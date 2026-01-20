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

export interface ScoringCriteria {
  id: number;
  name: string;
  weight: number;
  maxScore: number;
}

export interface ScoringCategory {
  id: number;
  category: string;
  minAge: number;
  maxAge: number;
  criterias: ScoringCriteria[];
}

export interface ScoringModel {
  id: number;
  name: string;
  version: string;
  isActive: boolean;
  categories: ScoringCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateScoringModelDto {
  name: string;
  version: string;
  categories: {
    category: string;
    minAge: number;
    maxAge: number;
    criterias: {
      name: string;
      weight: number;
      maxScore: number;
    }[];
  }[];
}

export const scoringApi = {
  // Get all scoring models
  getScoringModels: () => {
    return apiClient.get<ScoringModel[]>('/scoring');
  },

  // Get scoring model by ID
  getScoringModelById: (id: number) => {
    return apiClient.get<ScoringModel>(`/scoring/${id}`);
  },

  // Get active scoring model
  getActiveScoringModel: () => {
    return apiClient.get<ScoringModel>('/scoring/active');
  },

  // Create new scoring model
  createScoringModel: (data: CreateScoringModelDto) => {
    return apiClient.post<ScoringModel>('/scoring', data);
  },

  // Update scoring model
  updateScoringModel: (id: number, data: Partial<CreateScoringModelDto>) => {
    return apiClient.patch<ScoringModel>(`/scoring/${id}`, data);
  },

  // Activate scoring model
  activateScoringModel: (id: number) => {
    return apiClient.post<ScoringModel>(`/scoring/${id}/activate`, {});
  },

  // Delete scoring model
  deleteScoringModel: (id: number) => {
    return apiClient.delete(`/scoring/${id}`);
  },

  // Get unique criteria names from all models
  getCriteriaNames: () => {
    return apiClient.get<string[]>('/scoring/criteria/names');
  },
};
