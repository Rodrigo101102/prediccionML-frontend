import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useAuth';
import { useToastContext } from '../contexts/ToastContext';
import { LoginCredentials } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { success, error } = useToastContext();
  
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm<LoginCredentials>({
    username: '',
    password: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      success('¡Bienvenido!', 'Has iniciado sesión exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
      error('Error de autenticación', errorMessage);
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              crea una cuenta nueva
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}>
          <div className="space-y-4">
            <Input
              label="Usuario"
              type="text"
              placeholder="Tu nombre de usuario"
              value={values.username}
              onChange={(e) => handleChange('username', e.target.value)}
              error={errors.username}
              leftIcon={<User />}
              required
            />
            
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              leftIcon={<Lock />}
              isPassword
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            size="lg"
          >
            Iniciar Sesión
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
