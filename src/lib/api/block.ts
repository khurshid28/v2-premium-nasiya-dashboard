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

export interface Block {
  id: number;
  type: 'USER' | 'MERCHANT' | 'FILLIAL' | 'WORKPLACE';
  reason: string;
  startDate: string;
  endDate?: string;
  isPermanent: boolean;
  isActive: boolean;
  user_id?: number;
  merchant_id?: number;
  fillial_id?: number;
  workplace_name?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockDto {
  type: 'USER' | 'MERCHANT' | 'FILLIAL' | 'WORKPLACE';
  reason: string;
  isPermanent: boolean;
  endDate?: string;
  user_id?: number;
  merchant_id?: number;
  fillial_id?: number;
  workplace_name?: string;
}

export interface UpdateBlockDto {
  reason?: string;
  endDate?: string;
  isPermanent?: boolean;
}

export const blockApi = {
  // Get all blocks with optional filters
  getBlocks: (params?: {
    type?: 'USER' | 'MERCHANT' | 'FILLIAL' | 'WORKPLACE';
    isActive?: boolean;
    merchant_id?: number;
    fillial_id?: number;
  }) => {
    return apiClient.get<Block[]>('/block', { params });
  },

  // Get block by ID
  getBlockById: (id: number) => {
    return apiClient.get<Block>(`/block/${id}`);
  },

  // Create new block
  createBlock: (data: CreateBlockDto) => {
    return apiClient.post<Block>('/block', data);
  },

  // Update block
  updateBlock: (id: number, data: UpdateBlockDto) => {
    return apiClient.patch<Block>(`/block/${id}`, data);
  },

  // Deactivate block
  deactivateBlock: (id: number) => {
    return apiClient.post<Block>(`/block/${id}/deactivate`);
  },

  // Delete block
  deleteBlock: (id: number) => {
    return apiClient.delete(`/block/${id}`);
  },
};
