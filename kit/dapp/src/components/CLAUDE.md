# Frontend Components Documentation

_This file documents component patterns and implementations within the dapp frontend._

## Actions Table Implementation

### New Component: `actions-table.tsx`

The actions table component implements a comprehensive workflow management interface for tracking and executing pending operations:

**Key Features:**
- **Status-based filtering**: Uses `ActionStatusEnum` for consistent status handling across UI
- **Time-based status calculation**: Determines UI state from `activeAt`, `expiresAt`, and `executedAt` timestamps
- **Dynamic column configuration**: Shows execute buttons only for pending actions
- **Context-specific empty states**: Custom messages and icons for each status type
- **Action type filtering**: Supports "Admin" and "User" action types
- **Internationalization**: Full i18n support with comprehensive translation keys

**Status Calculation Logic:**
```typescript
const calculateActionStatus = (action: Action): ActionStatus => {
  const now = Date.now();
  
  if (action.executed) return ActionStatusEnum.COMPLETED;
  if (action.expiresAt && now > action.expiresAt.getTime()) return ActionStatusEnum.EXPIRED;
  if (now < action.activeAt.getTime()) return ActionStatusEnum.UPCOMING;
  return ActionStatusEnum.PENDING;
};
```

**Integration Pattern:**
- Uses ORPC for type-safe backend communication
- Leverages existing DataTable component infrastructure
- Implements proper error boundaries and loading states
- Follows established UI component patterns

## Data Table Empty State Enhancement

### Updated Component: `data-table-empty-state.tsx`

Enhanced empty state component for contextual messaging:

**New Features:**
- **Customizable icons**: Accepts icon prop for context-specific iconography
- **Flexible content**: Supports custom title and description
- **Consistent styling**: Uses semantic UI tokens for design system compliance
- **Integration ready**: Works with DataTable's `customEmptyState` prop

**Usage Pattern:**
```typescript
<DataTable
  customEmptyState={
    <DataTableEmptyState
      icon={<CircleDashed className="size-8 text-muted-foreground" />}
      title={t("actionsTable.emptyStates.pending.title")}
      description={t("actionsTable.emptyStates.pending.description")}
    />
  }
/>
```

## Component Architecture Patterns

### Status-Based UI Management
- **Centralized enums**: Use `ActionStatusEnum` for consistent status handling
- **Status calculation**: Implement time-based logic for dynamic UI states
- **Visual indicators**: Status badges with appropriate colors and icons
- **Conditional rendering**: Show/hide UI elements based on calculated status

### Translation Integration
- **Namespaced keys**: Use `actionsTable.*` namespace for related translations
- **Status-specific content**: Separate keys for different status contexts
- **Empty state messaging**: Context-aware empty state translations
- **Action type labels**: Consistent terminology across all action-related UI

## Best Practices

- **Type safety**: Use schema-generated types for all action-related data
- **Error boundaries**: Implement proper error handling for action operations
- **Loading states**: Show appropriate loading indicators during data fetching
- **Accessibility**: Ensure all interactive elements have proper ARIA labels
- **Responsive design**: Support various screen sizes and mobile devices

---

_This documentation covers the actions table implementation and related component patterns. For API integration details, see the ORPC documentation._