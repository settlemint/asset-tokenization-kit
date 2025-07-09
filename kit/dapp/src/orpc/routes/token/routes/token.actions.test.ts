import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { ACTION_STATUS } from '@/lib/constants/action-types';
import { actions } from './token.actions';

// Mock dependencies
vi.mock('@/lib/settlemint/the-graph');
vi.mock('@/orpc/middlewares/services/the-graph.middleware');
vi.mock('@/orpc/middlewares/auth/permissions.middleware');

describe('Token Actions API Security Tests', () => {
  const mockContext = {
    auth: {
      user: {
        address: '0x1234567890123456789012345678901234567890',
        role: {
          permissions: { admin: false, token: 'read' }
        }
      }
    },
    theGraphClient: {
      query: vi.fn()
    }
  };

  const mockTheGraphResponse = {
    actions: [
      {
        id: '0x1',
        name: 'ApproveXvPSettlement',
        type: 'Admin',
        createdAt: '1640995200',
        activeAt: '1640995200',
        expiresAt: '1641081600',
        executedAt: null,
        executed: false,
        target: { id: '0xabc' },
        executedBy: null
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext.theGraphClient.query.mockResolvedValue(mockTheGraphResponse);
  });

  describe('Authorization Tests', () => {
    it('should reject unauthenticated requests', async () => {
      const contextWithoutAuth = { ...mockContext, auth: null };
      
      await expect(
        actions.handler({
          input: { status: ACTION_STATUS.PENDING },
          context: contextWithoutAuth
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should reject queries for other users without admin permission', async () => {
      const input = {
        userAddress: '0x9876543210987654321098765432109876543210',
        status: ACTION_STATUS.PENDING
      };

      await expect(
        actions.handler({ input, context: mockContext })
      ).rejects.toThrow(TRPCError);
    });

    it('should allow admin users to query other users', async () => {
      const adminContext = {
        ...mockContext,
        auth: {
          user: {
            address: '0x1234567890123456789012345678901234567890',
            role: { permissions: { admin: true, token: 'read' } }
          }
        }
      };

      const input = {
        userAddress: '0x9876543210987654321098765432109876543210',
        status: ACTION_STATUS.PENDING
      };

      const result = await actions.handler({ input, context: adminContext });
      expect(result).toBeDefined();
      expect(mockContext.theGraphClient.query).toHaveBeenCalled();
    });

    it('should allow users to query their own actions', async () => {
      const input = {
        userAddress: '0x1234567890123456789012345678901234567890',
        status: ACTION_STATUS.PENDING
      };

      const result = await actions.handler({ input, context: mockContext });
      expect(result).toBeDefined();
      expect(mockContext.theGraphClient.query).toHaveBeenCalled();
    });
  });

  describe('Input Validation Tests', () => {
    it('should reject invalid Ethereum addresses', async () => {
      const input = {
        userAddress: 'invalid-address',
        status: ACTION_STATUS.PENDING
      };

      await expect(
        actions.handler({ input, context: mockContext })
      ).rejects.toThrow();
    });

    it('should reject invalid status values', async () => {
      const input = {
        status: 'INVALID_STATUS' as any,
      };

      await expect(
        actions.handler({ input, context: mockContext })
      ).rejects.toThrow();
    });

    it('should reject negative offset values', async () => {
      const input = {
        offset: -1,
        status: ACTION_STATUS.PENDING
      };

      await expect(
        actions.handler({ input, context: mockContext })
      ).rejects.toThrow();
    });

    it('should limit maximum query size to 1000', async () => {
      const input = {
        limit: 2000,
        status: ACTION_STATUS.PENDING
      };

      await actions.handler({ input, context: mockContext });
      
      expect(mockContext.theGraphClient.query).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            first: 1000 // Should be capped at 1000
          })
        })
      );
    });
  });

  describe('Query Security Tests', () => {
    it('should use parameterized queries to prevent injection', async () => {
      const input = {
        tokenId: '0x1234567890123456789012345678901234567890',
        status: ACTION_STATUS.PENDING
      };

      await actions.handler({ input, context: mockContext });
      
      const queryCall = mockContext.theGraphClient.query.mock.calls[0];
      expect(queryCall[1]).toHaveProperty('input');
      expect(queryCall[1].input).toHaveProperty('where');
      expect(queryCall[1].input.where).toEqual({
        target: input.tokenId.toLowerCase(),
        executed: false,
        activeAt_lte: expect.any(Number),
        expiresAt_gt: expect.any(Number)
      });
    });

    it('should sanitize user addresses to lowercase', async () => {
      const input = {
        userAddress: '0x1234567890123456789012345678901234567890',
        status: ACTION_STATUS.PENDING
      };

      await actions.handler({ input, context: mockContext });
      
      const queryCall = mockContext.theGraphClient.query.mock.calls[0];
      expect(queryCall[1].input.where).toEqual({
        executor_: {
          accounts_contains: [input.userAddress.toLowerCase()]
        },
        executed: false,
        activeAt_lte: expect.any(Number),
        expiresAt_gt: expect.any(Number)
      });
    });
  });

  describe('Data Filtering Tests', () => {
    it('should apply correct time-based filtering for PENDING status', async () => {
      const input = { status: ACTION_STATUS.PENDING };
      
      await actions.handler({ input, context: mockContext });
      
      const queryCall = mockContext.theGraphClient.query.mock.calls[0];
      expect(queryCall[1].input.where).toEqual({
        executed: false,
        activeAt_lte: expect.any(Number),
        expiresAt_gt: expect.any(Number)
      });
    });

    it('should apply correct filtering for COMPLETED status', async () => {
      const input = { status: ACTION_STATUS.COMPLETED };
      
      await actions.handler({ input, context: mockContext });
      
      const queryCall = mockContext.theGraphClient.query.mock.calls[0];
      expect(queryCall[1].input.where).toEqual({
        executed: true
      });
    });

    it('should apply correct filtering for EXPIRED status', async () => {
      const input = { status: ACTION_STATUS.EXPIRED };
      
      await actions.handler({ input, context: mockContext });
      
      const queryCall = mockContext.theGraphClient.query.mock.calls[0];
      expect(queryCall[1].input.where).toEqual({
        executed: false,
        expiresAt_lte: expect.any(Number)
      });
    });
  });

  describe('Response Security Tests', () => {
    it('should compute status server-side and return consistent data', async () => {
      const input = { status: ACTION_STATUS.PENDING };
      
      const result = await actions.handler({ input, context: mockContext });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('status');
      expect(result[0].status).toBe(ACTION_STATUS.PENDING);
      expect(result[0].createdAt).toBe(1640995200);
      expect(result[0].activeAt).toBe(1640995200);
      expect(result[0].expiresAt).toBe(1641081600);
    });

    it('should not expose sensitive internal data', async () => {
      const input = { status: ACTION_STATUS.PENDING };
      
      const result = await actions.handler({ input, context: mockContext });
      
      expect(result[0]).not.toHaveProperty('internalId');
      expect(result[0]).not.toHaveProperty('privateKey');
      expect(result[0]).not.toHaveProperty('executorPrivateData');
    });
  });

  describe('Audit Logging Tests', () => {
    it('should log action queries for security monitoring', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const input = { status: ACTION_STATUS.PENDING };
      await actions.handler({ input, context: mockContext });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Action query by user'),
        expect.objectContaining({
          status: ACTION_STATUS.PENDING,
          timestamp: expect.any(String)
        })
      );
      
      consoleSpy.mockRestore();
    });
  });
});