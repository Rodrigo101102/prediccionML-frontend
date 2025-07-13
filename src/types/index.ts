// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// User Types
export interface User {
  id: string;
  username: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState {
  isLoading: boolean;
  errors: FormError[];
  success: boolean;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  current?: boolean;
}

// Toast Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}


// Traffic Capture Types
export interface CapturaRequest {
  duracion_segundos: number;
  interfaz: string;
}

export interface CapturaResponse {
  message: string;
  session_id: string;
  interfaz: string;
  duracion: number;
  success: boolean;
}

export interface CapturaStatus {
  session_id: string;
  estado: 'en_progreso' | 'completado' | 'error' | 'no_encontrada';
  progreso: number;
  tiempo_restante: number;
  archivo?: string;
  success: boolean;
}

export interface ProcesamientoResult {
  message: string;
  session_id: string;
  csv_path?: string;
  predicciones_path?: string;
  total_flows: number;
  normal: number;
  anomalias: number;
  porcentaje_anomalias: number;
  success: boolean;
}

export interface InterfacesResponse {
  interfaces: string[];
  success: boolean;
  message?: string;
}
