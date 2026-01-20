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

export interface ScoringHistoryItem {
  id: number;
  zayavka_id: number;
  scoring_model_id: number;
  scoring_category_id: number;
  total_score: number;
  passed: boolean;
  source: string;
  scoring_start: string;
  scoring_end: string;
  processing_time_seconds: number;
  criteria_scores: any;
  evaluated_at: string;
  zayavka: {
    id: number;
    fullname: string;
    phone: string;
    amount: number;
    limit: number;
    status: string;
    createdAt: string;
  };
  scoringModel: {
    id: number;
    name: string;
    version: string;
    minPassScore: number;
  };
  scoringCategory: {
    id: number;
    category: string;
    criterias: {
      id: number;
      name: string;
      maxScore: number;
    }[];
  };
}

export interface ScoringHistoryResponse {
  data: ScoringHistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ScoringHistoryStats {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
  avgScore: number;
  avgProcessingTime: number;
  bySource: {
    source: string;
    count: number;
  }[];
}

export const scoringHistoryApi = {
  // Get all scoring history with filters
  getScoringHistory: (params?: {
    zayavka_id?: number;
    scoring_model_id?: number;
    source?: string;
    passed?: boolean;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get<ScoringHistoryResponse>('/scoring/history/list', { params });
  },

  // Get scoring history by ID
  getScoringHistoryById: (id: number) => {
    return apiClient.get<ScoringHistoryItem>(`/scoring/history/${id}`);
  },

  // Get scoring history statistics
  getScoringHistoryStats: () => {
    return apiClient.get<ScoringHistoryStats>('/scoring/history/stats');
  },
};
