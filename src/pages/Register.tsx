import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useAuth';
import { useToastContext } from '../contexts/ToastContext';
import { RegisterCredentials } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';

const Register: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const { success, error } = useToastContext();
  
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setErrors,
  } = useForm<RegisterCredentials>({
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = (credentials: RegisterCredentials) => {
    const newErrors: Record<string, string> = {};

    if (credentials.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (credentials.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (credentials.password !== credentials.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      throw new Error('Por favor corrige los errores del formulario');
    }
  };

  const onSubmit = async (credentials: RegisterCredentials) => {
    try {
      validateForm(credentials);
      await register(credentials);
      success('¡Cuenta creada!', 'Tu cuenta ha sido creada exitosamente');
    } catch (err) {
      if (err instanceof Error && err.message === 'Por favor corrige los errores del formulario') {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'No se pudo crear tu cuenta';
      error('Error al crear cuenta', errorMessage);
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              inicia sesión si ya tienes una cuenta
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
              helperText="Mínimo 3 caracteres"
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
              helperText="Mínimo 6 caracteres"
              required
            />
            
            <Input
              label="Confirmar contraseña"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock />}
              isPassword
              required
            />
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
            Crear Cuenta
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
