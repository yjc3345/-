# Scheduler stabilization audit — 2026-10-31

Repository: `yjc3345/-`
Working branch: `stabilization-audit-20261031`
Production `main`: unchanged.

## Verified by source inspection
- `index.html` loads `assets/scheduler-core.js` and `assets/scheduler.css`.
- `login.html` loads `assets/login-app.js` and `assets/login.css`.
- Teacher saves call Supabase RPC `save_teacher_schedule_atomic`.
- Approval UI queries `schedule_periods.approved_at`.
- Deletion requests `schedule_periods.delete().eq("id", period.id).select("id")`, then removes browser local storage only after a successful returned deletion.
- Teacher schedule loading uses a request token to discard stale results.

## Risks requiring verification before production changes
1. **Approval/save race:** the save handler unconditionally enables the save button in `finally`, while an independent asynchronous approval checker also manages it. The server RPC must enforce approved-data immutability.
2. **Approval query failure:** the UI disables editing on query error, but only protects against actions within this UI. Database authorization and RPC behavior must be checked.
3. **Deletion cascade:** deletion assumes dependent `schedule_cells` rows are removed through database cascade; verify FK and row-level security policies.
4. **Browser-local state:** schedule deletion clears local cache only after a successful server response. Test no-match, network failure, and permissions scenarios.
5. **Concurrent updates:** check what happens when approval, class selection, or saved schedule changes while another request is in flight.
6. **Regression tests:** no browser or authenticated Supabase integration tests have been run in this audit.

## Next checks
- Inspect SQL migrations and RLS policies for `save_teacher_schedule_atomic`, `schedule_periods`, and `schedule_cells`.
- Reproduce approval/save race with test accounts and test data only.
- Test save, reload, approval, revocation, deletion, and browser refresh.
- Implement verified fixes in this branch; review before merging into `main`.

Status: **audit in progress; not production-ready**.
