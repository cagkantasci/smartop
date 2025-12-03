import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User, CreateUserDto, UpdateUserDto, UserListParams } from '../services';

export const USERS_QUERY_KEY = 'users';
export const OPERATORS_QUERY_KEY = 'operators';

export const useUsers = (params?: UserListParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => userService.getAll(params),
    enabled: options?.enabled !== false,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useOperators = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [OPERATORS_QUERY_KEY],
    queryFn: () => userService.getOperators(),
    enabled: options?.enabled !== false,
  });
};

export const useManagers = () => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'managers'],
    queryFn: () => userService.getManagers(),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [OPERATORS_QUERY_KEY] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => userService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [OPERATORS_QUERY_KEY] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [OPERATORS_QUERY_KEY] });
    },
  });
};
