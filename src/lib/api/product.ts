import apiClient from './index';

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
    return apiClient.get<Category[]>('/category', { params });
  },

  getCategoryById: (id: number) => {
    return apiClient.get<Category>(`/category/${id}`);
  },

  createCategory: (data: CreateCategoryDto) => {
    return apiClient.post<Category>('/category', data);
  },

  updateCategory: (id: number, data: Partial<CreateCategoryDto>) => {
    return apiClient.patch<Category>(`/category/${id}`, data);
  },

  deleteCategory: (id: number) => {
    return apiClient.delete(`/category/${id}`);
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
    return apiClient.patch<Product>(`/product/${id}`, data);
  },

  deleteProduct: (id: number) => {
    return apiClient.delete(`/product/${id}`);
  },
};
