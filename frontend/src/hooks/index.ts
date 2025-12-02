// Machine hooks
export {
  useMachines,
  useMachine,
  useCreateMachine,
  useUpdateMachine,
  useDeleteMachine,
  useAssignOperator,
  useUpdateMachineLocation,
  MACHINES_QUERY_KEY,
} from './useMachines';

// User hooks
export {
  useUsers,
  useUser,
  useOperators,
  useManagers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  USERS_QUERY_KEY,
  OPERATORS_QUERY_KEY,
} from './useUsers';

// Checklist hooks
export {
  useChecklistTemplates,
  useChecklistTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useChecklistSubmissions,
  useChecklistSubmission,
  usePendingSubmissions,
  useCreateSubmission,
  useReviewSubmission,
  TEMPLATES_QUERY_KEY,
  SUBMISSIONS_QUERY_KEY,
} from './useChecklists';

// Job hooks
export {
  useJobs,
  useJob,
  useActiveJobs,
  useScheduledJobs,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  useStartJob,
  useCompleteJob,
  useAssignJob,
  JOBS_QUERY_KEY,
} from './useJobs';
