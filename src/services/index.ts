export { default as api, setAccessToken, getAccessToken } from './api';
export { authService } from './authService';
export { machineService } from './machineService';
export { userService } from './userService';
export { checklistService } from './checklistService';
export { jobService } from './jobService';

// Re-export types
export type { LoginCredentials, RegisterData, AuthResponse, User as AuthUser } from './authService';
export type { Machine, CreateMachineDto, UpdateMachineDto, MachineListParams } from './machineService';
export type { User, CreateUserDto, UpdateUserDto, UserListParams } from './userService';
export type {
  ChecklistTemplate,
  ChecklistSubmission,
  ChecklistEntry,
  ChecklistItem,
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateSubmissionDto,
  ReviewSubmissionDto,
  SubmissionListParams,
} from './checklistService';
export type { Job, JobAssignment, CreateJobDto, UpdateJobDto, AssignJobDto, JobListParams } from './jobService';
