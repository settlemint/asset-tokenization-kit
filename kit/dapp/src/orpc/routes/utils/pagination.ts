const DEFAULT_LIMIT = 100;

export const getPagination = (input?: { offset: number; limit: number }) => {
  return {
    offset: input?.offset ?? 0,
    limit: input?.limit ?? DEFAULT_LIMIT,
  };
};
