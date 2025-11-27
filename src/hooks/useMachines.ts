import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService, Machine, CreateMachineDto, UpdateMachineDto, MachineListParams } from '../services';

export const MACHINES_QUERY_KEY = 'machines';

export const useMachines = (params?: MachineListParams) => {
  return useQuery({
    queryKey: [MACHINES_QUERY_KEY, params],
    queryFn: () => machineService.getAll(params),
  });
};

export const useMachine = (id: string) => {
  return useQuery({
    queryKey: [MACHINES_QUERY_KEY, id],
    queryFn: () => machineService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMachine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMachineDto) => machineService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY] });
    },
  });
};

export const useUpdateMachine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMachineDto }) => machineService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY, id] });
    },
  });
};

export const useDeleteMachine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => machineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY] });
    },
  });
};

export const useAssignOperator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ machineId, operatorId }: { machineId: string; operatorId: string }) =>
      machineService.assignOperator(machineId, operatorId),
    onSuccess: (_, { machineId }) => {
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY, machineId] });
    },
  });
};

export const useUpdateMachineLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      machineId,
      lat,
      lng,
      address,
    }: {
      machineId: string;
      lat: number;
      lng: number;
      address?: string;
    }) => machineService.updateLocation(machineId, lat, lng, address),
    onSuccess: (_, { machineId }) => {
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MACHINES_QUERY_KEY, machineId] });
    },
  });
};
