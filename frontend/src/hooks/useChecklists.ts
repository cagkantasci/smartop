import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  checklistService,
  ChecklistTemplate,
  ChecklistSubmission,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateSubmissionDto,
  ReviewSubmissionDto,
  SubmissionListParams,
} from '../services';

export const TEMPLATES_QUERY_KEY = 'checklist-templates';
export const SUBMISSIONS_QUERY_KEY = 'checklist-submissions';

// Template hooks
export const useChecklistTemplates = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY],
    queryFn: () => checklistService.getTemplates(),
    enabled: options?.enabled !== false,
  });
};

export const useChecklistTemplate = (id: string) => {
  return useQuery({
    queryKey: [TEMPLATES_QUERY_KEY, id],
    queryFn: () => checklistService.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => checklistService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      checklistService.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY, id] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checklistService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] });
    },
  });
};

// Submission hooks
export const useChecklistSubmissions = (params?: SubmissionListParams) => {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, params],
    queryFn: () => checklistService.getSubmissions(params),
  });
};

export const useChecklistSubmission = (id: string) => {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, id],
    queryFn: () => checklistService.getSubmissionById(id),
    enabled: !!id,
  });
};

export const usePendingSubmissions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, 'pending'],
    queryFn: () => checklistService.getPendingSubmissions(),
    enabled: options?.enabled !== false,
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubmissionDto) => checklistService.createSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBMISSIONS_QUERY_KEY] });
    },
  });
};

export const useReviewSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewSubmissionDto }) =>
      checklistService.reviewSubmission(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [SUBMISSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SUBMISSIONS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [SUBMISSIONS_QUERY_KEY, 'pending'] });
    },
  });
};
