import apiClient from './index';

export interface Block {
  id: number;
  type: 'USER' | 'MERCHANT' | 'FILLIAL';
  reason: string;
  startDate: string;
  endDate?: string;
  isPermanent: boolean;
  isActive: boolean;
  user_id?: number;
  merchant_id?: number;
  fillial_id?: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockDto {
  type: 'USER' | 'MERCHANT' | 'FILLIAL';
  reason: string;
  isPermanent: boolean;
  endDate?: string;
  user_id?: number;
  merchant_id?: number;
  fillial_id?: number;
}

export interface UpdateBlockDto {
  reason?: string;
  endDate?: string;
  isPermanent?: boolean;
}

export const blockApi = {
  // Get all blocks with optional filters
  getBlocks: (params?: {
    type?: 'USER' | 'MERCHANT' | 'FILLIAL';
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
