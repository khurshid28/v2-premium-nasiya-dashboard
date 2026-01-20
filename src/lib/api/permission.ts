import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:7777/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: string;
  code: string;
  module: string;
}

export interface AssignPermissionDto {
  role: 'SUPER' | 'ADMIN' | 'AGENT' | 'USER' | 'CALLCENTER' | 'ACCOUNTANT' | 'BOTUSER' | 'BANKUSER';
  permission_id: number;
}

export const permissionApi = {
  // Get all permissions
  getPermissions: () => {
    return apiClient.get<Permission[]>('/permission');
  },

  // Get permission by ID
  getPermissionById: (id: number) => {
    return apiClient.get<Permission>(`/permission/${id}`);
  },

  // Create new permission
  createPermission: (data: CreatePermissionDto) => {
    return apiClient.post<Permission>('/permission', data);
  },

  // Update permission
  updatePermission: (id: number, data: Partial<CreatePermissionDto>) => {
    return apiClient.patch<Permission>(`/permission/${id}`, data);
  },

  // Delete permission
  deletePermission: (id: number) => {
    return apiClient.delete(`/permission/${id}`);
  },

  // Assign permission to role
  assignPermission: (data: AssignPermissionDto) => {
    return apiClient.post('/permission/assign', data);
  },

  // Get role permissions
  getRolePermissions: (role: string) => {
    return apiClient.get<Permission[]>(`/permission/role/${role}`);
  },

  // Remove permission from role
  removePermission: (role: string, permissionId: number) => {
    return apiClient.delete(`/permission/${role}/${permissionId}`);
  },
};
