# Actions Project Plan — Updated October 8, 2025

## Phase 1 — Discovery & Alignment (Oct 8 – Oct 10)
- [x] Document currently discoverable actions: ApproveXvPSettlement, ExecuteXvPSettlement, MatureBond (indexed via TheGraph `Action` entity, exposed through `orpc.actions.list` and `token.actions`).
- [ ] Confirm scope with product: validate "currently supported" list and align ownership for deferred flows (ENG-4026 bond redeem, ENG-4027 bond claim yield) with token lifecycle squad.
- [x] Audit existing data sources / ORPC procedures powering v1 actions (TheGraph `ListActionsQuery`, ORPC `actions.list` + token-scoped proxy, subgraph action creation in bond/xvp handlers).
- [ ] Capture UX/translation requirements: sidebar IA, namespace name (`actions`), tab copy, status terminology, accessibility requirements (pending design/i18n sync).

## Phase 2 — Backend & ORPC Enablement (Oct 10 – Oct 16)
- [ ] Model unified Actions entity (status, type, schedule, approval metadata) in Drizzle schema and migrations.
- [ ] Expose list/query mutations via ORPC, including filtering by status (pending/completed/upcoming) and pagination.
- [ ] Implement action execution endpoints for bond maturity, redemption, and yield claims with authorization + audit logging.
- [ ] Add cron/queue strategy decision for time-based triggers; spike if background execution required.

## Phase 3 — Frontend Scaffold (Oct 16 – Oct 21)
- [x] Create dedicated sidebar route + translation namespace; wire TanStack Router + ORPC client.
- [x] Build tabbed layout with TanStack components, ensuring responsive + accessible keyboard navigation.
- [x] Implement Actions table view with columns for status, type, schedule, actor, approval state, and contextual actions.

## Phase 4 — Action Workflows (Oct 21 – Oct 28)
- [ ] Integrate approval/rejection flow with optimistic updates and rollback handling.
- [ ] Add action creation forms for supported actions, including validation via Zod schemas and error surfacing.
- [ ] Wire execute/claim/redeem flows to backend endpoints; handle background completion states.
- [ ] Ensure notification hooks (email/in-app) fire on status transitions where required.

## Phase 5 — Quality, Rollout & Handover (Oct 28 – Oct 31)
- [ ] Create unit tests (Vitest) for ORPC procedures + UI components; extend e2e coverage for core flows.
- [ ] Run performance + security review (rate limits, access control) and address findings.
- [ ] Prepare release playbook: data migration steps, feature flags, rollback procedure, and monitoring dashboards.
- [ ] Document admin/operator workflows and update internal runbooks.

## Cross-Cutting Considerations
- [ ] Align duplicates (ENG-3675, ENG-3755) with master tickets to avoid double work.
- [ ] Track dependencies on external cron/queue infrastructure decisions.
- [ ] Schedule design/QA reviews aligned with milestone boundaries.
- [ ] Maintain status updates in Linear project view; adjust plan as scopes move between projects.
