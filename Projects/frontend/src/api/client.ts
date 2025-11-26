import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies in requests
});

// Custom error interface
export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  method: string;
}

// Request interceptor - add auth token if stored
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token is automatically sent via HTTP-only cookie
    // But we can also check localStorage for optional Bearer token backup
    const token = localStorage.getItem('backup_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle network errors
    if (!error.response) {
      const networkError = new Error('Network error. Please check your connection.');
      (networkError as any).statusCode = 0;
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle 401 - Token expired or invalid
    if (status === 401) {
      localStorage.removeItem('backup_jwt_token');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session_expired=true';
      }

      const authError = new Error('Session expired. Please log in again.');
      (authError as any).statusCode = 401;
      return Promise.reject(authError);
    }

    // Handle 403 - Forbidden
    if (status === 403) {
      const forbiddenError = new Error('You do not have permission to access this resource.');
      (forbiddenError as any).statusCode = 403;
      return Promise.reject(forbiddenError);
    }

    // Handle 404 - Not found
    if (status === 404) {
      const notFoundError = new Error('Resource not found.');
      (notFoundError as any).statusCode = 404;
      return Promise.reject(notFoundError);
    }

    // Handle 429 - Too many requests
    if (status === 429) {
      const rateLimitError = new Error('Too many requests. Please try again later.');
      (rateLimitError as any).statusCode = 429;
      return Promise.reject(rateLimitError);
    }

    // Handle 500+ - Server errors
    if (status >= 500) {
      const serverError = new Error('Server error. Please try again later.');
      (serverError as any).statusCode = status;
      return Promise.reject(serverError);
    }

    // Handle validation errors (400, 422)
    if (status === 400 || status === 422) {
      const validationError = new Error(
        Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Invalid request',
      );
      (validationError as any).statusCode = status;
      return Promise.reject(validationError);
    }

    // Generic error handling
    const message = Array.isArray(data.message) 
      ? data.message.join(', ') 
      : (data.message || `Error: ${status}`);
    const genericError = new Error(message);
    (genericError as any).statusCode = status;
    return Promise.reject(genericError);
  },
);

// Auth API
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

// Listings API
export const listingsApi = {
  popular: (limit: number = 6) => api.get(`/listings/popular?limit=${limit}`),
  search: (query: string = '', location: string = '', limit: number = 20) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (location) params.append('location', location);
    params.append('limit', String(limit));
    return api.get(`/listings/search?${params.toString()}`);
  },
};

// Properties API
export const propertiesApi = {
  getOne: (id: number | string) => api.get(`/property/${id}`),
};

// Projects API
export const projectsApi = {
  getOne: (id: number | string) => api.get(`/project/${id}`),
};

// Lands API
export const landsApi = {
  getOne: (id: number | string) => api.get(`/land/${id}`),
};

// Agent Contacts API
export const agentContactApi = {
  create: (payload: { name: string; email: string; message: string; property_id?: number | null }) =>
    api.post('/agent-contact', payload),
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return true; // Let backend validation via interceptors handle it
};

// Utility function to get error message from API error
export const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    const msg = error.response.data.message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return 'An unexpected error occurred. Please try again.';
};
