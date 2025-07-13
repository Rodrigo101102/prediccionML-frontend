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
      await this.api.post<any>('/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      // Tu backend podría devolver un token real, por ahora simulamos
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      
      // Necesitamos obtener los datos del usuario después del login
      // Por ahora simulamos basado en la respuesta
      return {
        user: {
          id: credentials.username, // Temporal hasta que sepamos qué devuelve /login
          username: credentials.username,
          avatar: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        token: mockToken,
        refreshToken: mockToken
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Usar el endpoint /usuario de tu API - enviar password no password_hash
      const response = await this.api.post<any>('/usuario', {
        username: credentials.username,
        password: credentials.password
      });
      
      // Simulamos un token y respuesta de auth basado en la respuesta real
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      
      return {
        user: {
          id: response.data.id.toString(),
          username: response.data.username,
          avatar: undefined,
          createdAt: response.data.created_at,
          updatedAt: response.data.created_at
        },
        token: mockToken,
        refreshToken: mockToken
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
      const response = await this.api.get<any[]>('/usuario');
      
      if (response.data && response.data.length > 0) {
        const userData = response.data[0]; // Tomamos el primer usuario como ejemplo
        return {
          id: userData.id.toString(),
          username: userData.username,
          avatar: undefined,
          createdAt: userData.created_at,
          updatedAt: userData.created_at
        };
      } else {
        throw new Error('No user found');
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await this.api.put<any>('/usuario', userData);
      return {
        id: response.data.id.toString(),
        username: response.data.username,
        avatar: undefined,
        createdAt: response.data.created_at,
        updatedAt: response.data.created_at
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

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
