import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LogOut, Play, Square, Network, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { 
  CapturaRequest, 
  CapturaResponse, 
  CapturaStatus, 
  ProcesamientoResult, 
  InterfacesResponse 
} from '../types';
import { apiService } from '../services/api';

const Dashboard: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const { success, error } = useToast();
  
  // State for network capture
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureStatus, setCaptureStatus] = useState<CapturaStatus | null>(null);
  const [results, setResults] = useState<ProcesamientoResult | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Load available network interfaces on component mount
  useEffect(() => {
    loadInterfaces();
  }, []);

  // Poll capture status when capturing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCapturing && sessionId) {
      interval = setInterval(() => {
        checkCaptureStatus();
      }, 2000); // Check every 2 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCapturing, sessionId]);

  const loadInterfaces = async () => {
    try {
      const response = await apiService.get<InterfacesResponse>('/interfaces');
      if (response.success) {
        setInterfaces(response.interfaces);
        if (response.interfaces.length > 0) {
          setSelectedInterface(response.interfaces[0]);
        }
      }
    } catch (err) {
      error('Error', 'No se pudieron cargar las interfaces de red');
    }
  };

  const startCapture = async () => {
    if (!selectedInterface) {
      error('Error', 'Selecciona una interfaz de red');
      return;
    }

    try {
      const request: CapturaRequest = {
        duracion_segundos: duration,
        interfaz: selectedInterface
      };

      const response = await apiService.post<CapturaResponse>('/captura/iniciar', request);
      
      if (response.success) {
        setSessionId(response.session_id);
        setIsCapturing(true);
        setResults(null);
        success('Captura iniciada', `Capturando tráfico en ${selectedInterface} por ${duration} segundos`);
      }
    } catch (err) {
      error('Error', 'No se pudo iniciar la captura de tráfico');
    }
  };

  const stopCapture = async () => {
    try {
      await apiService.post(`/captura/detener/${sessionId}`);
      setIsCapturing(false);
      setCaptureStatus(null);
      success('Captura detenida', 'La captura de tráfico ha sido detenida');
    } catch (err) {
      error('Error', 'No se pudo detener la captura');
    }
  };

  const checkCaptureStatus = async () => {
    if (!sessionId) return;

    try {
      const status = await apiService.get<CapturaStatus>(`/captura/estado/${sessionId}`);
      setCaptureStatus(status);

      if (status.estado === 'completado') {
        setIsCapturing(false);
        processResults();
      } else if (status.estado === 'error') {
        setIsCapturing(false);
        error('Error', 'Error durante la captura de tráfico');
      }
    } catch (err) {
      console.error('Error checking capture status:', err);
    }
  };

  const processResults = async () => {
    if (!sessionId) return;

    try {
      const result = await apiService.get<ProcesamientoResult>(`/procesar/${sessionId}`);
      if (result.success) {
        setResults(result);
        success('Análisis completado', 
          `Detectadas ${result.anomalias} anomalías de ${result.total_flows} flujos (${result.porcentaje_anomalias.toFixed(2)}%)`
        );
      }
    } catch (err) {
      error('Error', 'No se pudieron procesar los resultados');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // The logout function should automatically redirect to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If no user, this should be handled by ProtectedRoute, but just in case
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No hay usuario autenticado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Bienvenido, {user.username}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Project Title - Centered and Styled */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            Modelo de aprendizaje supervisado con 
            <span className="text-primary-600 block mt-2">Random Forest</span>
            para la detección de tráfico anómalo de redes
          </h1>
          <div className="flex items-center justify-center space-x-2 text-lg text-gray-600">
            <span>2025</span>
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            <span>Proyecto de Machine Learning</span>
          </div>
        </div>

        {/* Main Content Area - Network Traffic Monitoring */}
        <div className="space-y-8">
          {/* Control Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Network className="h-6 w-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Panel de Control de Captura</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Interface Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interfaz de Red
                </label>
                <select
                  value={selectedInterface}
                  onChange={(e) => setSelectedInterface(e.target.value)}
                  disabled={isCapturing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                >
                  {interfaces.map((iface) => (
                    <option key={iface} value={iface}>
                      {iface}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (segundos)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  disabled={isCapturing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-end">
                {!isCapturing ? (
                  <button
                    onClick={startCapture}
                    disabled={!selectedInterface}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Captura
                  </button>
                ) : (
                  <button
                    onClick={stopCapture}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Detener Captura
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Panel */}
          {(isCapturing || captureStatus) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Estado de la Captura</h2>
              </div>

              {captureStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {captureStatus.estado === 'en_progreso' && (
                        <>
                          <Clock className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-blue-700">Capturando...</span>
                        </>
                      )}
                      {captureStatus.estado === 'completado' && (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-green-700">Completado</span>
                        </>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {captureStatus.tiempo_restante > 0 
                        ? `${captureStatus.tiempo_restante}s restantes`
                        : 'Procesando...'
                      }
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${captureStatus.progreso}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    {captureStatus.progreso.toFixed(1)}% completado
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Panel */}
          {results && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Resultados del Análisis</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Flows */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Network className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Flujos</p>
                      <p className="text-2xl font-bold text-blue-900">{results.total_flows}</p>
                    </div>
                  </div>
                </div>

                {/* Normal Traffic */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Tráfico Normal</p>
                      <p className="text-2xl font-bold text-green-900">{results.normal}</p>
                    </div>
                  </div>
                </div>

                {/* Anomalies */}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-600">Anomalías</p>
                      <p className="text-2xl font-bold text-red-900">{results.anomalias}</p>
                    </div>
                  </div>
                </div>

                {/* Percentage */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">% Anomalías</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {results.porcentaje_anomalias.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Links */}
              {(results.csv_path || results.predicciones_path) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Archivos Generados</h3>
                  <div className="flex space-x-4">
                    {results.csv_path && (
                      <a
                        href={`http://127.0.0.1:8000/download/${results.csv_path}`}
                        download
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        📊 Descargar Dataset CSV
                      </a>
                    )}
                    {results.predicciones_path && (
                      <a
                        href={`http://127.0.0.1:8000/download/${results.predicciones_path}`}
                        download
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        🤖 Descargar Predicciones
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions Panel */}
          {!isCapturing && !results && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Instrucciones de Uso</h3>
              <div className="space-y-2 text-blue-800">
                <p>• <strong>Selecciona la interfaz de red</strong> que deseas monitorear</p>
                <p>• <strong>Configura la duración</strong> de la captura (10-300 segundos)</p>
                <p>• <strong>Haz clic en "Iniciar Captura"</strong> para comenzar el monitoreo</p>
                <p>• <strong>El sistema analizará</strong> el tráfico con Random Forest automáticamente</p>
                <p>• <strong>Revisa los resultados</strong> para identificar posibles anomalías</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
