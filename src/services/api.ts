import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';
const API_TIMEOUT = 10000;

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common errors
    this.api.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        return response;
      },
      (error: AxiosError<any>) => {
        console.error('❌ API Error:', error.response?.status, error.config?.url);
        console.error('❌ API Error Details:', JSON.stringify(error.response?.data, null, 2));
        
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints - Adaptados para tu API FastAPI
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Usar el endpoint /login correcto para autenticación
      const response = await this.api.post<any>('/login', {
        username: credentials.username,
        password: credentials.password
      });

      // El backend debe devolver access_token y posiblemente user info
      const token = response.data.access_token || response.data.token;
      if (!token) {
        throw new Error('No se recibió access_token del backend');
      }
      localStorage.setItem('authToken', token);

      // Si el backend devuelve el usuario, úsalo; si no, crea uno básico
      const user = response.data.user || {
        id: response.data.id?.toString() || credentials.username,
        username: credentials.username,
        avatar: undefined,
        createdAt: response.data.created_at || new Date().toISOString(),
        updatedAt: response.data.updated_at || new Date().toISOString()
      };

      return {
        user,
        token,
        refreshToken: token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Usar el endpoint correcto de registro (ajusta si tu backend es diferente)
      const response = await this.api.post<any>('/register', {
        username: credentials.username,
        password: credentials.password
      });

      // El backend debe devolver access_token y posiblemente user info
      const token = response.data.access_token || response.data.token;
      if (!token) {
        throw new Error('No se recibió access_token del backend');
      }
      localStorage.setItem('authToken', token);

      // Si el backend devuelve el usuario, úsalo; si no, crea uno básico
      const user = response.data.user || {
        id: response.data.id?.toString() || credentials.username,
        username: response.data.username || credentials.username,
        avatar: undefined,
        createdAt: response.data.created_at || new Date().toISOString(),
        updatedAt: response.data.updated_at || new Date().toISOString()
      };

      return {
        user,
        token,
        refreshToken: token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      // Tu API no tiene endpoint de logout, solo limpiamos el storage local
      console.log('Logging out user...');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      // Forzar recarga para limpiar completamente el estado
      window.location.href = '/login';
    }
  }

  async refreshToken(): Promise<string> {
    try {
      // Tu API no tiene endpoint de refresh token, simulamos uno nuevo
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      return mockToken;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    try {
      // Usar el endpoint /me para obtener el usuario autenticado
      const response = await this.api.get<any>('/me');
      const userData = response.data;
      if (userData && userData.id && userData.username) {
        return {
          id: userData.id.toString(),
          username: userData.username,
          avatar: undefined,
          createdAt: userData.created_at || new Date().toISOString(),
          updatedAt: userData.updated_at || new Date().toISOString()
        };
      } else {
        throw new Error('No user found');
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // async updateProfile(userData: Partial<User>): Promise<User> {
  //   try {
  //     // Si tu backend soporta actualización de perfil, ajusta el endpoint aquí
  //     const response = await this.api.put<any>('/me', userData);
  //     return {
  //       id: response.data.id.toString(),
  //       username: response.data.username,
  //       avatar: undefined,
  //       createdAt: response.data.created_at,
  //       updatedAt: response.data.created_at
  //     };
  //   } catch (error) {
  //     throw this.handleError(error);
  //   }
  // }

  // Utility methods
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message || data?.detail || data?.error || error.message || 'An error occurred';
      
      // Handle specific HTTP status codes
      if (status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        return new Error('Credenciales incorrectas');
      } else if (status === 400) {
        // Si es un error de autenticación
        if (message.toLowerCase().includes('password') || message.toLowerCase().includes('username') || message.toLowerCase().includes('credentials')) {
          return new Error('Credenciales incorrectas');
        }
        return new Error(message);
      } else if (status === 422) {
        // Error de validación - puede ser credenciales incorrectas
        if (message.toLowerCase().includes('password') || message.toLowerCase().includes('username') || message.toLowerCase().includes('invalid')) {
          return new Error('Credenciales incorrectas');
        }
        return new Error('Datos inválidos');
      } else if (status === 404) {
        return new Error('Usuario no encontrado');
      } else if (status === 500) {
        return new Error('Error del servidor');
      }
      
      return new Error(message);
    }
    return new Error('Error de conexión');
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.api.get<T>(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.api.delete<T>(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
