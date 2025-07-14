/**
 * Ejemplo completo de integración con la API del backend
 * Complete example of backend API integration
 */

// Configuración de la API
const API_BASE_URL = 'http://127.0.0.1:8000';

// Tipos de respuesta esperados del backend
interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    created_at: string;
    updated_at: string;
  };
}

interface InterfacesResponse {
  interfaces: Array<{
    name: string;
    display_name: string;
  }>;
  success: boolean;
}

interface CaptureStartResponse {
  job_id: string;
  message: string;
  success: boolean;
}

interface CaptureStatusResponse {
  status: 'iniciando' | 'capturando' | 'procesando' | 'guardando' | 'completado' | 'error';
  progress: number;
  message: string;
  result?: {
    total_flows: Array<{ name: string; description: string }>;
    normal: Array<{ name: string; description: string }>;
    anomalias: Array<{ name: string; description: string }>;
    porcentaje_anomalias: number;
    csv_path: string;
    predicciones_path: string;
  };
}

/**
 * Clase principal para la integración con la API
 * Main class for API integration
 */
class MLTrafficAnalyzer {
  private token: string = '';

  /**
   * 1. Autenticación - Iniciar sesión
   * Authentication - Login
   */
  async login(username: string, password: string): Promise<LoginResponse['user']> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: LoginResponse = await response.json();
      this.token = data.access_token;
      
      console.log('✅ Login exitoso:', data.user.username);
      return data.user;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  /**
   * 2. Obtener interfaces de red disponibles
   * Get available network interfaces
   */
  async getNetworkInterfaces(): Promise<InterfacesResponse['interfaces']> {
    try {
      const response = await fetch(`${API_BASE_URL}/interfaces`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: InterfacesResponse = await response.json();
      
      console.log('✅ Interfaces obtenidas:', data.interfaces.length);
      return data.interfaces;
    } catch (error) {
      console.error('❌ Error obteniendo interfaces:', error);
      throw error;
    }
  }

  /**
   * 3. Iniciar captura de tráfico
   * Start traffic capture
   */
  async startCapture(interfaceName: string, duration: number = 30): Promise<string> {
    try {
      // Primero obtenemos las interfaces para encontrar el objeto completo
      const interfaces = await this.getNetworkInterfaces();
      const selectedInterface = interfaces.find(iface => iface.name === interfaceName);
      
      if (!selectedInterface) {
        throw new Error(`Interfaz ${interfaceName} no encontrada`);
      }

      const response = await fetch(`${API_BASE_URL}/captura/iniciar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duracion_segundos: duration,
          interfaz: selectedInterface
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: CaptureStartResponse = await response.json();
      
      console.log('✅ Captura iniciada:', data.job_id);
      return data.job_id;
    } catch (error) {
      console.error('❌ Error iniciando captura:', error);
      throw error;
    }
  }

  /**
   * 4. Monitorear estado de la captura (polling)
   * Monitor capture status (polling)
   */
  async monitorCapture(jobId: string): Promise<CaptureStatusResponse['result']> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/capture-status/${jobId}`, {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });

          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const data: CaptureStatusResponse = await response.json();
          
          console.log(`📊 Estado: ${data.status} (${data.progress}%) - ${data.message}`);

          // Verificar si está completado
          if (data.status === 'completado') {
            console.log('✅ Captura completada exitosamente');
            resolve(data.result!);
            return;
          }

          // Verificar si hay error
          if (data.status === 'error') {
            console.error('❌ Error en la captura:', data.message);
            reject(new Error(`Error en captura: ${data.message}`));
            return;
          }

          // Continuar monitoreando
          setTimeout(checkStatus, 3000); // Cada 3 segundos
        } catch (error) {
          console.error('❌ Error consultando estado:', error);
          reject(error);
        }
      };

      // Empezar a monitorear después de 2 segundos
      setTimeout(checkStatus, 2000);
    });
  }

  /**
   * 5. Descargar archivo de resultados
   * Download results file
   */
  async downloadFile(filename: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      console.log('✅ Archivo descargado:', filename);
      return blob;
    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      throw error;
    }
  }

  /**
   * 6. Flujo completo - Desde login hasta resultados
   * Complete workflow - From login to results
   */
  async runCompleteAnalysis(
    username: string, 
    password: string, 
    interfaceName: string, 
    duration: number = 30
  ): Promise<{
    user: LoginResponse['user'];
    results: CaptureStatusResponse['result'];
    csvBlob: Blob;
    predictionsBlob: Blob;
  }> {
    try {
      console.log('🚀 Iniciando análisis completo...');

      // 1. Login
      const user = await this.login(username, password);

      // 2. Obtener interfaces (para verificar que existe)
      const interfaces = await this.getNetworkInterfaces();
      const targetInterface = interfaces.find(iface => iface.name === interfaceName);
      if (!targetInterface) {
        throw new Error(`Interfaz ${interfaceName} no disponible. Disponibles: ${interfaces.map(i => i.name).join(', ')}`);
      }

      // 3. Iniciar captura
      const jobId = await this.startCapture(interfaceName, duration);

      // 4. Monitorear hasta completar
      const results = await this.monitorCapture(jobId);

      // 5. Descargar archivos
      const csvBlob = await this.downloadFile(results.csv_path);
      const predictionsBlob = await this.downloadFile(results.predicciones_path);

      console.log('🎉 Análisis completo finalizado');
      
      return {
        user,
        results,
        csvBlob,
        predictionsBlob
      };
    } catch (error) {
      console.error('💥 Error en análisis completo:', error);
      throw error;
    }
  }
}

/**
 * Ejemplo de uso básico
 * Basic usage example
 */
async function basicExample() {
  const analyzer = new MLTrafficAnalyzer();

  try {
    // Ejecutar análisis completo
    const result = await analyzer.runCompleteAnalysis(
      'mi_usuario',      // username
      'mi_contraseña',   // password
      'eth0',            // interface name
      60                 // duration in seconds
    );

    // Mostrar resultados
    console.log('Usuario:', result.user.username);
    console.log('Total flujos:', result.results.total_flows);
    console.log('Anomalías detectadas:', result.results.anomalias);
    console.log('Porcentaje de anomalías:', result.results.porcentaje_anomalias + '%');

    // Guardar archivos (ejemplo en navegador)
    const csvUrl = URL.createObjectURL(result.csvBlob);
    const predictionsUrl = URL.createObjectURL(result.predictionsBlob);
    
    // Crear enlaces de descarga
    const csvLink = document.createElement('a');
    csvLink.href = csvUrl;
    csvLink.download = 'network_data.csv';
    csvLink.click();

    const predictionsLink = document.createElement('a');
    predictionsLink.href = predictionsUrl;
    predictionsLink.download = 'predictions.csv';
    predictionsLink.click();

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Ejemplo de uso paso a paso
 * Step-by-step usage example
 */
async function stepByStepExample() {
  const analyzer = new MLTrafficAnalyzer();

  try {
    // Paso 1: Login
    console.log('1. Iniciando sesión...');
    const user = await analyzer.login('usuario', 'contraseña');

    // Paso 2: Ver interfaces disponibles
    console.log('2. Obteniendo interfaces...');
    const interfaces = await analyzer.getNetworkInterfaces();
    console.log('Interfaces disponibles:', interfaces);

    // Paso 3: Iniciar captura
    console.log('3. Iniciando captura...');
    const jobId = await analyzer.startCapture('eth0', 30);

    // Paso 4: Monitorear progreso
    console.log('4. Monitoreando progreso...');
    const results = await analyzer.monitorCapture(jobId);

    // Paso 5: Mostrar resultados
    console.log('5. Resultados obtenidos:');
    console.log('- Total de flujos:', results.total_flows);
    console.log('- Tráfico normal:', results.normal);
    console.log('- Anomalías:', results.anomalias);
    console.log('- Porcentaje de anomalías:', results.porcentaje_anomalias + '%');

    // Paso 6: Descargar archivos si se necesitan
    if (results.csv_path) {
      console.log('6. Descargando CSV...');
      const csvBlob = await analyzer.downloadFile(results.csv_path);
      console.log('CSV descargado, tamaño:', csvBlob.size, 'bytes');
    }

  } catch (error) {
    console.error('Error en el proceso:', error);
  }
}

// Exportar para uso en módulos
export { MLTrafficAnalyzer, basicExample, stepByStepExample };

// Para uso en navegador (global)
if (typeof window !== 'undefined') {
  (window as any).MLTrafficAnalyzer = MLTrafficAnalyzer;
  (window as any).basicExample = basicExample;
  (window as any).stepByStepExample = stepByStepExample;
}