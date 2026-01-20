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

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  merchants?: { merchant_id: number }[];
  fillials?: { fillial_id: number }[];
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  merchants?: { merchant_id: number }[];
  fillials?: { fillial_id: number }[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
  merchant_ids?: number[];
  fillial_ids?: number[];
}

export interface CreateProductDto {
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  isActive?: boolean;
  merchant_ids?: number[];
  fillial_ids?: number[];
}

export const productApi = {
  // Categories
  getCategories: (params?: {
    merchant_id?: number;
    fillial_id?: number;
    isActive?: boolean;
  }) => {
    return apiClient.get<Category[]>('/product/category', { params });
  },

  getCategoryById: (id: number) => {
    return apiClient.get<Category>(`/product/category/${id}`);
  },

  createCategory: (data: CreateCategoryDto) => {
    return apiClient.post<Category>('/product/category', data);
  },

  updateCategory: (id: number, data: Partial<CreateCategoryDto>) => {
    return apiClient.put<Category>(`/product/category/${id}`, data);
  },

  deleteCategory: (id: number) => {
    return apiClient.delete(`/product/category/${id}`);
  },

  // Products
  getProducts: (params?: {
    category_id?: number;
    merchant_id?: number;
    fillial_id?: number;
    isActive?: boolean;
  }) => {
    return apiClient.get<Product[]>('/product', { params });
  },

  getProductById: (id: number) => {
    return apiClient.get<Product>(`/product/${id}`);
  },

  createProduct: (data: CreateProductDto) => {
    return apiClient.post<Product>('/product', data);
  },

  updateProduct: (id: number, data: Partial<CreateProductDto>) => {
    return apiClient.put<Product>(`/product/${id}`, data);
  },

  deleteProduct: (id: number) => {
    return apiClient.delete(`/product/${id}`);
  },

  // Bulk Import
  bulkImportProducts: (data: {
    products: CreateProductDto[];
    default_merchant_ids?: number[];
    default_fillial_ids?: number[];
  }) => {
    return apiClient.post('/product/bulk-import', data);
  },
};
