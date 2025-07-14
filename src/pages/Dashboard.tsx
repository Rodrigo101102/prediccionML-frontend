import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LogOut, Play, Square, Network, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { 
  CapturaRequest,
  InterfacesResponse 
} from '../types';
import { apiService } from '../services/api';

const Dashboard: React.FC = memo(() => {
  const { user, isLoading, logout } = useAuth();
  const { success, error } = useToast();
  
  // State for network capture
  const [interfaces, setInterfaces] = useState<{ name: string; display_name: string }[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureStatus, setCaptureStatus] = useState<any | null>(null); // Flexible para nuevos estados
  const [results, setResults] = useState<any | null>(null);
  const [jobId, setJobId] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [captureMessage, setCaptureMessage] = useState<string>('');

  // Estado para modal de detalles de anomalía
  const [selectedAnomaly, setSelectedAnomaly] = useState<any | null>(null);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);

  // Diccionario de detalles extra por tipo de ataque
  const anomalyDetails: Record<string, { causas: string; recomendaciones: string }> = {
    'BENIGN': {
      causas: 'Tráfico normal, sin indicios de actividad maliciosa.',
      recomendaciones: 'No se requiere acción.'
    },
    'BOT': {
      causas: 'Actividad automatizada detectada, posiblemente por malware o scripts.',
      recomendaciones: 'Verifica dispositivos y ejecuta análisis antivirus.'
    },
    'BRUTE FORCE': {
      causas: 'Intentos repetidos de acceso no autorizado.',
      recomendaciones: 'Revisa logs de autenticación y refuerza contraseñas.'
    },
    'DDOS': {
      causas: 'Ataque de denegación de servicio distribuido, alto volumen de tráfico.',
      recomendaciones: 'Implementa mitigación DDoS y contacta a tu proveedor de red.'
    },
    'DOS': {
      causas: 'Ataque de denegación de servicio, tráfico anómalo desde una fuente.',
      recomendaciones: 'Identifica la fuente y bloquea el tráfico sospechoso.'
    },
    'PORT SCAN': {
      causas: 'Escaneo de puertos detectado, posible reconocimiento previo a un ataque.',
      recomendaciones: 'Monitorea accesos y limita exposición de servicios innecesarios.'
    },
    'WEB ATTACK': {
      causas: 'Intento de explotación de vulnerabilidades web.',
      recomendaciones: 'Actualiza tus aplicaciones web y revisa configuraciones de seguridad.'
    }
  };

  // --- useCallback functions (deben ir antes de los useEffect) ---
  const loadInterfaces = React.useCallback(async () => {
    try {
      const response = await apiService.get<InterfacesResponse>('/interfaces');
      console.log('Respuesta /interfaces (raw):', JSON.stringify(response, null, 2));
      // Intentar detectar la lista de interfaces en diferentes claves
      if (response && Array.isArray(response.interfaces)) {
        setInterfaces(response.interfaces);
        if (response.interfaces.length > 0) {
          setSelectedInterface(response.interfaces[0].name);
        }
      } else {
        console.warn('No se recibieron interfaces de red válidas:', response);
      }
    } catch (err) {
      error('Error', 'No se pudieron cargar las interfaces de red');
      console.error('Error al cargar interfaces:', err);
    }
  }, [error]);


  // --- useEffect hooks ---
  useEffect(() => {
    loadInterfaces();
  }, [loadInterfaces]);


  // Nuevo flujo de captura con feedback inmediato y polling
  const startCapture = useCallback(async () => {
    if (!selectedInterface) {
      error('Error', 'Selecciona una interfaz de red');
      return;
    }
    setIsCapturing(true);
    setResults(null);
    setProgress(0);
    setCaptureMessage('⏳ Iniciando...');
    setCaptureStatus({ status: 'iniciando', progress: 0, message: 'Preparando captura de tráfico...' });

    try {
      // Buscar el objeto de la interfaz seleccionada
      const selectedIfaceObj = interfaces.find((iface) => iface.name === selectedInterface);
      if (!selectedIfaceObj) {
        error('Error', 'No se encontró el objeto de la interfaz seleccionada');
        setIsCapturing(false);
        return;
      }
      const request: CapturaRequest = {
        duracion_segundos: duration,
        interfaz: selectedIfaceObj
      };

      // Respuesta inmediata del backend
      const response = await apiService.post<any>('/captura/iniciar', request);
      if (response.success && response.job_id) {
        setJobId(response.job_id);
        setCaptureMessage(response.message || '🚀 Captura iniciada');
        setProgress(0);
        // Consultar estado después de 2 segundos
        setTimeout(() => startProgressTracking(response.job_id), 2000);
        // (Opcional) Iniciar procesamiento real
        // await apiService.post<any>(`/captura/procesar/${response.job_id}`);
      } else {
        setIsCapturing(false);
        setCaptureMessage('❌ Error al iniciar la captura');
        error('Error', response.message || 'No se pudo iniciar la captura');
      }
    } catch (err: any) {
      setIsCapturing(false);
      setCaptureMessage('❌ Error de conexión');
      let details = '';
      if (err && err.response) {
        details = `Status: ${err.response.status}\n` +
                  `Data: ${JSON.stringify(err.response.data)}\n` +
                  `Message: ${err.message}`;
      } else if (err && err.message) {
        details = err.message;
      } else {
        details = JSON.stringify(err);
      }
      error('Error', details || 'No se pudo iniciar la captura de tráfico');
      console.error('❌ Error al iniciar captura:', err);
    }

  // Seguimiento de progreso con polling HTTP
  function startProgressTracking(jobId: string) {
    const checkStatus = async () => {
      try {
        const response = await apiService.get<any>(`/api/capture-status/${jobId}`);
        const statusData = response.data || response;
        setCaptureStatus(statusData);
        setProgress(statusData.progress || 0);
        setCaptureMessage(statusData.message || '');

        // Actualizar UI según estado
        switch (statusData.status) {
          case 'iniciando':
            console.log('🚀 Preparando captura...');
            break;
          case 'capturando':
            console.log('📡 Capturando tráfico de red...');
            break;
          case 'procesando':
            console.log('⚙️ Analizando datos...');
            break;
          case 'guardando':
            console.log('💾 Guardando en base de datos...');
            break;
          case 'completado':
            console.log('✅ Captura completada!');
            setIsCapturing(false);
            setResults(statusData.result || null);
            setCaptureMessage(statusData.message || '✅ Captura completada');
            onCaptureComplete(statusData);
            return;
          case 'error':
            console.error('❌ Error en captura:', statusData.error);
            setIsCapturing(false);
            setCaptureMessage(statusData.message || '❌ Error en la captura');
            error('Error', statusData.error || statusData.message || 'Error en la captura');
            return;
        }

        // Continuar polling si no está completado ni error
        if (statusData.status !== 'completado' && statusData.status !== 'error') {
          setTimeout(checkStatus, 3000);
        }
      } catch (err: any) {
        console.error('❌ Error consultando estado:', err);
        setIsCapturing(false);
        setCaptureMessage('❌ Error de conexión al consultar estado');
      }
    };
    // Empezar a consultar después de 2 segundos
    setTimeout(checkStatus, 2000);
  }

  // Proceso completado
  function onCaptureComplete(statusData: any) {
    if (statusData.status === 'completado' && statusData.result) {
      const { rows_inserted, csv_file } = statusData.result;
      // Mostrar resultado final
      success('✅ Captura completada!', `Registros: ${rows_inserted}\nArchivo: ${csv_file}`);
      // Habilitar botón para nueva captura (ejemplo)
      // ...
    }
  }
  }, [selectedInterface, duration, interfaces, error, success]);

  const stopCapture = useCallback(async () => {
    try {
      if (!jobId) throw new Error('No hay captura activa para detener');
      await apiService.post(`/captura/detener/${jobId}`);
      setIsCapturing(false);
      setCaptureStatus(null);
      setJobId('');
      success('Captura detenida', 'La captura de tráfico ha sido detenida');
    } catch (err: any) {
      error('Error', err?.message || 'No se pudo detener la captura');
    }
  }, [jobId, success, error]);



  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // The logout function should automatically redirect to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [logout]);

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
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Bienvenido, {typeof user.username === 'object' ? JSON.stringify(user.username) : user.username}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesión
            </button>
          </div>
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
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  {interfaces.length === 0 && (
                    <option value="" disabled>
                      No hay interfaces disponibles
                    </option>
                  )}
                  {interfaces.map((iface) => (
                    <option key={iface.name} value={iface.name}>
                      {iface.display_name}
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
                  value={isNaN(duration) ? 30 : duration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setDuration(isNaN(val) ? 30 : val);
                  }}
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

          {/* Status Panel - feedback inmediato y barra de progreso */}
          {(isCapturing || captureStatus) && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Estado de la Captura</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isCapturing && progress < 100 && (
                      <>
                        <Clock className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700">{captureMessage || 'Procesando...'}</span>
                      </>
                    )}
                    {progress === 100 && (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-700">Completado</span>
                      </>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {progress < 100 && isCapturing
                      ? `Progreso: ${progress}%`
                      : progress === 100
                        ? 'Finalizado'
                        : ''}
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  {progress}% completado
                </div>
              </div>
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
                      <p className="text-2xl font-bold text-blue-900">{
                        Array.isArray(results.total_flows) && results.total_flows.length > 0 && typeof results.total_flows[0] === 'object' && 'name' in results.total_flows[0] && 'description' in results.total_flows[0]
                          ? (
                              <ul className="text-left text-xs">
                                {results.total_flows.map((item: any, idx: number) => (
                                  <li key={item && item.name ? item.name + '-' + idx : idx}><b>{item.name}:</b> {item.description}</li>
                                ))}
                              </ul>
                            )
                          : (typeof results.total_flows === 'object' ? JSON.stringify(results.total_flows) : results.total_flows)
                      }</p>
                    </div>
                  </div>
                </div>

                {/* Normal Traffic */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Tráfico Normal</p>
                      <p className="text-2xl font-bold text-green-900">{
                        Array.isArray(results.normal) && results.normal.length > 0 && typeof results.normal[0] === 'object' && 'name' in results.normal[0] && 'description' in results.normal[0]
                          ? (
                              <ul className="text-left text-xs">
                                {results.normal.map((item: any, idx: number) => (
                                  <li key={item && item.name ? item.name + '-' + idx : idx}><b>{item.name}:</b> {item.description}</li>
                                ))}
                              </ul>
                            )
                          : (typeof results.normal === 'object' ? JSON.stringify(results.normal) : results.normal)
                      }</p>
                    </div>
                  </div>
                </div>

                {/* Anomalies - Custom visualization by attack type, now interactive */}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-red-600">Anomalías</p>
                      <div className="text-2xl font-bold text-red-900">
                        {Array.isArray(results.anomalias) && results.anomalias.length > 0 && typeof results.anomalias[0] === 'object' && 'name' in results.anomalias[0] && 'description' in results.anomalias[0]
                          ? (
                              <ul className="text-left text-xs space-y-1">
                                {results.anomalias.map((item: any, idx: number) => {
                                  let icon = null;
                                  let color = '';
                                  let label = '';
                                  const upperName = (item.name || '').toUpperCase();
                                  switch (upperName) {
                                    case 'BENIGN':
                                      icon = <CheckCircle className="inline h-4 w-4 text-green-500 mr-1 align-text-bottom" />;
                                      color = 'text-green-700';
                                      label = 'Benigno';
                                      break;
                                    case 'BOT':
                                      icon = <Activity className="inline h-4 w-4 text-blue-500 mr-1 align-text-bottom" />;
                                      color = 'text-blue-700';
                                      label = 'Bot';
                                      break;
                                    case 'BRUTE FORCE':
                                      icon = <AlertTriangle className="inline h-4 w-4 text-yellow-600 mr-1 align-text-bottom" />;
                                      color = 'text-yellow-800';
                                      label = 'Brute Force';
                                      break;
                                    case 'DDOS':
                                      icon = <AlertTriangle className="inline h-4 w-4 text-red-600 mr-1 align-text-bottom" />;
                                      color = 'text-red-800';
                                      label = 'DDoS';
                                      break;
                                    case 'DOS':
                                      icon = <AlertTriangle className="inline h-4 w-4 text-orange-600 mr-1 align-text-bottom" />;
                                      color = 'text-orange-800';
                                      label = 'DoS';
                                      break;
                                    case 'PORT SCAN':
                                      icon = <Network className="inline h-4 w-4 text-indigo-600 mr-1 align-text-bottom" />;
                                      color = 'text-indigo-800';
                                      label = 'Port Scan';
                                      break;
                                    case 'WEB ATTACK':
                                      icon = <AlertTriangle className="inline h-4 w-4 text-pink-600 mr-1 align-text-bottom" />;
                                      color = 'text-pink-800';
                                      label = 'Web Attack';
                                      break;
                                    default:
                                      icon = <AlertTriangle className="inline h-4 w-4 text-gray-500 mr-1 align-text-bottom" />;
                                      color = 'text-gray-800';
                                      label = item.name;
                                  }
                                  return (
                                    <li
                                      key={item && item.name ? item.name + '-' + idx : idx}
                                      className={color + ' cursor-pointer hover:bg-red-100 rounded px-1 py-0.5 transition'}
                                      onClick={() => {
                                        setSelectedAnomaly(item);
                                        setShowAnomalyModal(true);
                                      }}
                                      title="Haz clic para ver detalles"
                                    >
                                      {icon}
                                      <b>{label}:</b> {item.description}
                                    </li>
                                  );
                                })}
                              </ul>
                            )
                          : (typeof results.anomalias === 'object' ? JSON.stringify(results.anomalias) : results.anomalias)
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal de detalles de anomalía */}
                {showAnomalyModal && selectedAnomaly && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative animate-fade-in">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
                        onClick={() => setShowAnomalyModal(false)}
                        aria-label="Cerrar"
                      >
                        ×
                      </button>
                      <div className="flex items-center mb-2">
                        {/* Icono grande según tipo */}
                        {(() => {
                          const upperName = (selectedAnomaly.name || '').toUpperCase();
                          switch (upperName) {
                            case 'BENIGN':
                              return <CheckCircle className="h-8 w-8 text-green-500 mr-2" />;
                            case 'BOT':
                              return <Activity className="h-8 w-8 text-blue-500 mr-2" />;
                            case 'BRUTE FORCE':
                              return <AlertTriangle className="h-8 w-8 text-yellow-600 mr-2" />;
                            case 'DDOS':
                              return <AlertTriangle className="h-8 w-8 text-red-600 mr-2" />;
                            case 'DOS':
                              return <AlertTriangle className="h-8 w-8 text-orange-600 mr-2" />;
                            case 'PORT SCAN':
                              return <Network className="h-8 w-8 text-indigo-600 mr-2" />;
                            case 'WEB ATTACK':
                              return <AlertTriangle className="h-8 w-8 text-pink-600 mr-2" />;
                            default:
                              return <AlertTriangle className="h-8 w-8 text-gray-500 mr-2" />;
                          }
                        })()}
                        <span className="text-xl font-bold text-gray-900">
                          {selectedAnomaly.name}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-sm text-gray-700 font-semibold">Descripción:</span>
                        <span className="block text-gray-800">{selectedAnomaly.description}</span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-sm text-gray-700 font-semibold">Posibles causas:</span>
                        <span className="block text-gray-800">{anomalyDetails[(selectedAnomaly.name || '').toUpperCase()]?.causas || 'No disponible.'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-sm text-gray-700 font-semibold">Recomendaciones:</span>
                        <span className="block text-gray-800">{anomalyDetails[(selectedAnomaly.name || '').toUpperCase()]?.recomendaciones || 'No disponible.'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Percentage */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">% Anomalías</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {typeof results.porcentaje_anomalias === 'object'
                          ? JSON.stringify(results.porcentaje_anomalias)
                          : (typeof results.porcentaje_anomalias === 'number'
                              ? results.porcentaje_anomalias.toFixed(2) + '%'
                              : results.porcentaje_anomalias)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Links */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Archivos Generados</h3>
                {results.predicciones_path && typeof results.predicciones_path === 'string' && (
                  <a
                    href={`http://127.0.0.1:8000/download/${results.predicciones_path}`}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-4"
                    download
                  >
                    🤖 Descargar Predicciones
                  </a>
                )}
                {results.csv_path && typeof results.csv_path === 'string' && (
                  <a
                    href={`http://127.0.0.1:8000/download/${results.csv_path}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    download
                  >
                    📊 Descargar Dataset CSV
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Instructions Panel */}
          {!isCapturing && !results && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mt-8">
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
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
