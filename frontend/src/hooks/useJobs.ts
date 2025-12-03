import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService, Job, CreateJobDto, UpdateJobDto, AssignJobDto, JobListParams } from '../services';

export const JOBS_QUERY_KEY = 'jobs';

export const useJobs = (params?: JobListParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [JOBS_QUERY_KEY, params],
    queryFn: () => jobService.getAll(params),
    enabled: options?.enabled !== false,
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: [JOBS_QUERY_KEY, id],
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });
};

export const useActiveJobs = () => {
  return useQuery({
    queryKey: [JOBS_QUERY_KEY, 'active'],
    queryFn: () => jobService.getActiveJobs(),
  });
};

export const useScheduledJobs = () => {
  return useQuery({
    queryKey: [JOBS_QUERY_KEY, 'scheduled'],
    queryFn: () => jobService.getScheduledJobs(),
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobDto) => jobService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobDto }) => jobService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
    },
  });
};

export const useStartJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobService.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, 'active'] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, 'scheduled'] });
    },
  });
};

export const useCompleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, 'active'] });
    },
  });
};

export const useAssignJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, machineIds, operatorIds = [] }: { jobId: string; machineIds: string[]; operatorIds?: string[] }) =>
      jobService.assign(jobId, machineIds, operatorIds),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, jobId] });
    },
  });
};
