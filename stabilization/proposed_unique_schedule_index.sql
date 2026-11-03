-- Proposed hardening only. NOT applied to production.
-- Verify no duplicates and test all teacher/admin workflows before execution.
-- A unique index makes the schedule identity invariant database-enforced.
-- Existing nonunique index schedule_teacher_class_start_idx can remain until reviewed.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS schedule_periods_teacher_class_start_unique
ON public.schedule_periods (teacher_id, class_name, start_date);
