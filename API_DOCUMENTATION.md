# Guía de API - Frontend ↔ Backend

Esta guía documenta todas las interacciones entre el frontend y el backend de la aplicación de predicción ML para detección de tráfico anómalo de redes.

## 📋 Tabla de Contenidos

1. [Configuración General](#configuración-general)
2. [Autenticación](#autenticación)
3. [Endpoints de Usuario](#endpoints-de-usuario)
4. [Endpoints de Captura de Tráfico](#endpoints-de-captura-de-tráfico)
5. [Endpoints de Descarga](#endpoints-de-descarga)
6. [Manejo de Errores](#manejo-de-errores)
7. [Flujo Completo de Trabajo](#flujo-completo-de-trabajo)

---

## 🔧 Configuración General

### Base URL
```
http://127.0.0.1:8000
```

### Headers Requeridos
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {access_token}"
}
```

**Nota:** El header `Authorization` solo es requerido para endpoints protegidos.

---

## 🔐 Autenticación

### 1. Iniciar Sesión

**Endpoint:** `POST /login`

**Lo que el backend espera del frontend:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Lo que el backend devuelve al frontend:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "number",
    "username": "string",
    "created_at": "2025-01-14T20:33:00Z",
    "updated_at": "2025-01-14T20:33:00Z"
  }
}
```

**Códigos de respuesta:**
- `200`: Autenticación exitosa
- `400`: Datos inválidos
- `401`: Credenciales incorrectas
- `422`: Error de validación

**Ejemplo de uso:**
```typescript
const response = await fetch('http://127.0.0.1:8000/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'mi_usuario',
    password: 'mi_contraseña'
  })
});

const data = await response.json();
// Guardar el token: localStorage.setItem('authToken', data.access_token);
```

### 2. Registrar Usuario

**Endpoint:** `POST /register`

**Lo que el backend espera del frontend:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Lo que el backend devuelve al frontend:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "id": "number",
    "username": "string",
    "created_at": "2025-01-14T20:33:00Z",
    "updated_at": "2025-01-14T20:33:00Z"
  }
}
```

**Códigos de respuesta:**
- `201`: Usuario creado exitosamente
- `400`: Usuario ya existe o datos inválidos
- `422`: Error de validación

---

## 👤 Endpoints de Usuario

### 1. Obtener Usuario Actual

**Endpoint:** `GET /me`

**Headers requeridos:**
```json
{
  "Authorization": "Bearer {access_token}"
}
```

**Lo que el backend espera del frontend:**
- Solo el token de autorización en el header

**Lo que el backend devuelve al frontend:**
```json
{
  "id": "number",
  "username": "string",
  "created_at": "2025-01-14T20:33:00Z",
  "updated_at": "2025-01-14T20:33:00Z"
}
```

**Códigos de respuesta:**
- `200`: Usuario obtenido exitosamente
- `401`: Token inválido o expirado
- `404`: Usuario no encontrado

---

## 🌐 Endpoints de Captura de Tráfico

### 1. Obtener Interfaces de Red

**Endpoint:** `GET /interfaces`

**Headers requeridos:**
```json
{
  "Authorization": "Bearer {access_token}"
}
```

**Lo que el backend espera del frontend:**
- Solo el token de autorización en el header

**Lo que el backend devuelve al frontend:**
```json
{
  "interfaces": [
    {
      "name": "eth0",
      "display_name": "Ethernet 0 (eth0)"
    },
    {
      "name": "wlan0", 
      "display_name": "WiFi (wlan0)"
    }
  ],
  "success": true,
  "message": "Interfaces obtenidas correctamente"
}
```

**Códigos de respuesta:**
- `200`: Interfaces obtenidas exitosamente
- `401`: Token inválido
- `500`: Error del servidor

### 2. Iniciar Captura de Tráfico

**Endpoint:** `POST /captura/iniciar`

**Headers requeridos:**
```json
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

**Lo que el backend espera del frontend:**
```json
{
  "duracion_segundos": 30,
  "interfaz": {
    "name": "eth0",
    "display_name": "Ethernet 0 (eth0)"
  }
}
```

**Lo que el backend devuelve al frontend:**
```json
{
  "message": "Captura iniciada exitosamente",
  "job_id": "capture_12345_20250114203300",
  "interfaz": "eth0",
  "duracion": 30,
  "success": true
}
```

**Códigos de respuesta:**
- `200`: Captura iniciada exitosamente
- `400`: Parámetros inválidos
- `401`: Token inválido
- `500`: Error del servidor

### 3. Consultar Estado de Captura

**Endpoint:** `GET /api/capture-status/{job_id}`

**Headers requeridos:**
```json
{
  "Authorization": "Bearer {access_token}"
}
```

**Lo que el backend espera del frontend:**
- `job_id` en la URL (obtenido del endpoint de iniciar captura)

**Lo que el backend devuelve al frontend:**

**Durante el proceso:**
```json
{
  "status": "capturando",
  "progress": 45,
  "message": "📡 Capturando tráfico de red...",
  "time_remaining": 15
}
```

**Al completarse:**
```json
{
  "status": "completado",
  "progress": 100,
  "message": "✅ Captura completada",
  "result": {
    "rows_inserted": 1250,
    "csv_file": "capture_12345_20250114203300.csv",
    "total_flows": [
      {
        "name": "Total",
        "description": "1250 flujos analizados"
      }
    ],
    "normal": [
      {
        "name": "BENIGN",
        "description": "1000 flujos normales"
      }
    ],
    "anomalias": [
      {
        "name": "DDOS",
        "description": "150 ataques DDoS detectados"
      },
      {
        "name": "PORT SCAN",
        "description": "75 escaneos de puerto detectados"
      },
      {
        "name": "WEB ATTACK",
        "description": "25 ataques web detectados"
      }
    ],
    "porcentaje_anomalias": 20.0,
    "predicciones_path": "predictions_12345_20250114203300.csv",
    "csv_path": "capture_12345_20250114203300.csv"
  }
}
```

**Estados posibles:**
- `iniciando`: Preparando la captura
- `capturando`: Capturando tráfico de red
- `procesando`: Analizando datos con ML
- `guardando`: Guardando resultados en BD
- `completado`: Proceso finalizado
- `error`: Error en el proceso

**Códigos de respuesta:**
- `200`: Estado obtenido exitosamente
- `404`: Job ID no encontrado
- `401`: Token inválido

### 4. Detener Captura

**Endpoint:** `POST /captura/detener/{job_id}`

**Headers requeridos:**
```json
{
  "Authorization": "Bearer {access_token}"
}
```

**Lo que el backend espera del frontend:**
- `job_id` en la URL

**Lo que el backend devuelve al frontend:**
```json
{
  "message": "Captura detenida exitosamente",
  "job_id": "capture_12345_20250114203300",
  "success": true
}
```

**Códigos de respuesta:**
- `200`: Captura detenida exitosamente
- `404`: Job ID no encontrado
- `401`: Token inválido
- `400`: No se puede detener la captura

---

## 📥 Endpoints de Descarga

### 1. Descargar Archivos Generados

**Endpoint:** `GET /download/{filename}`

**Headers requeridos:**
```json
{
  "Authorization": "Bearer {access_token}"
}
```

**Lo que el backend espera del frontend:**
- `filename` en la URL (obtenido de `csv_path` o `predicciones_path`)

**Lo que el backend devuelve al frontend:**
- Archivo binario (CSV)
- Headers de descarga apropiados

**Códigos de respuesta:**
- `200`: Archivo descargado exitosamente
- `404`: Archivo no encontrado
- `401`: Token inválido

**Ejemplo de uso:**
```typescript
// Descargar predicciones
const downloadUrl = `http://127.0.0.1:8000/download/${predicciones_path}`;
window.open(downloadUrl, '_blank');

// O usando fetch para mayor control
const response = await fetch(downloadUrl, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const blob = await response.blob();
```

---

## ⚠️ Manejo de Errores

### Estructura de Respuestas de Error

**Formato estándar:**
```json
{
  "detail": "Descripción del error",
  "message": "Mensaje de error legible",
  "error": "Código de error específico"
}
```

### Códigos de Error Comunes

| Código | Descripción | Acción Recomendada |
|--------|-------------|-------------------|
| `400` | Bad Request | Revisar parámetros enviados |
| `401` | Unauthorized | Renovar token o re-autenticar |
| `404` | Not Found | Verificar URL o ID |
| `422` | Validation Error | Corregir datos de entrada |
| `500` | Server Error | Reintentar o contactar soporte |

### Manejo en el Frontend

```typescript
try {
  const response = await apiService.post('/captura/iniciar', data);
  // Manejar respuesta exitosa
} catch (error) {
  if (error.response?.status === 401) {
    // Token expirado - redirigir a login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  } else if (error.response?.status === 400) {
    // Error de parámetros
    console.error('Parámetros inválidos:', error.response.data);
  }
  // Mostrar error al usuario
  showError(error.response?.data?.detail || 'Error de conexión');
}
```

---

## 🔄 Flujo Completo de Trabajo

### 1. Flujo de Autenticación
```
Frontend                    Backend
   |                           |
   |-- POST /login ----------->|
   |                           |-- Validar credenciales
   |                           |-- Generar JWT token
   |<-- access_token + user ---|
   |                           |
   |-- Guardar token --------->|
   |-- GET /me --------------->|
   |<-- user data -------------|
```

### 2. Flujo de Captura de Tráfico
```
Frontend                    Backend
   |                           |
   |-- GET /interfaces ------->|
   |<-- lista interfaces ------|
   |                           |
   |-- POST /captura/iniciar ->|
   |<-- job_id ----------------|
   |                           |
   |-- polling cada 3s ------>|
   |-- GET /capture-status -->|
   |<-- status + progress -----|
   |                           |
   |-- (repetir hasta completado)
   |                           |
   |<-- result + files --------|
   |                           |
   |-- GET /download/file ---->|
   |<-- archivo CSV ----------|
```

### 3. Ejemplo Completo en TypeScript

```typescript
class MLTrafficAnalyzer {
  private token: string;
  private apiUrl = 'http://127.0.0.1:8000';

  async login(username: string, password: string) {
    const response = await fetch(`${this.apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    this.token = data.access_token;
    return data.user;
  }

  async getInterfaces() {
    const response = await fetch(`${this.apiUrl}/interfaces`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  async startCapture(interfaz: any, duracion: number) {
    const response = await fetch(`${this.apiUrl}/captura/iniciar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        duracion_segundos: duracion,
        interfaz: interfaz
      })
    });
    return response.json();
  }

  async checkStatus(jobId: string) {
    const response = await fetch(`${this.apiUrl}/api/capture-status/${jobId}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  async downloadFile(filename: string) {
    const response = await fetch(`${this.apiUrl}/download/${filename}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.blob();
  }
}
```

---

## 📝 Notas Importantes

### Seguridad
- Todos los endpoints (excepto login/register) requieren autenticación JWT
- El token debe incluirse en el header `Authorization: Bearer {token}`
- Los tokens pueden expirar - manejar error 401 apropiadamente

### Performance
- El polling del estado de captura se hace cada 3 segundos
- Las capturas pueden durar de 10 a 300 segundos
- Los archivos generados están disponibles para descarga inmediata

### Tipos de Anomalías Detectadas
- `BENIGN`: Tráfico normal
- `BOT`: Actividad de bots
- `BRUTE FORCE`: Ataques de fuerza bruta
- `DDOS`: Ataques de denegación de servicio distribuido
- `DOS`: Ataques de denegación de servicio
- `PORT SCAN`: Escaneos de puertos
- `WEB ATTACK`: Ataques a aplicaciones web

---

## 🔗 Enlaces Útiles

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [JWT Authentication](https://jwt.io/)
- [Axios HTTP Client](https://axios-http.com/)

---

**Última actualización:** Enero 2025  
**Versión de API:** 1.0.0