# API Guide - Frontend ↔ Backend Integration

This guide documents all interactions between the frontend and backend for the ML prediction application for network anomaly detection.

## 📋 Quick Reference

### Base Configuration
- **Base URL:** `http://127.0.0.1:8000`
- **Authentication:** Bearer JWT tokens
- **Content-Type:** `application/json`

### Main Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/login` | User authentication | No |
| POST | `/register` | User registration | No |
| GET | `/me` | Get current user | Yes |
| GET | `/interfaces` | Get network interfaces | Yes |
| POST | `/captura/iniciar` | Start traffic capture | Yes |
| GET | `/api/capture-status/{job_id}` | Check capture status | Yes |
| POST | `/captura/detener/{job_id}` | Stop capture | Yes |
| GET | `/download/{filename}` | Download generated files | Yes |

---

## 🔐 Authentication Flow

### Login Request
```json
POST /login
{
  "username": "string",
  "password": "string"
}
```

### Login Response
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": 123,
    "username": "user123",
    "created_at": "2025-01-14T20:33:00Z"
  }
}
```

---

## 🌐 Network Capture Workflow

### 1. Get Available Interfaces
```json
GET /interfaces
Authorization: Bearer {token}

Response:
{
  "interfaces": [
    {
      "name": "eth0",
      "display_name": "Ethernet 0 (eth0)"
    }
  ],
  "success": true
}
```

### 2. Start Capture
```json
POST /captura/iniciar
Authorization: Bearer {token}

Request:
{
  "duracion_segundos": 30,
  "interfaz": {
    "name": "eth0",
    "display_name": "Ethernet 0 (eth0)"
  }
}

Response:
{
  "job_id": "capture_12345_20250114203300",
  "message": "Capture started successfully",
  "success": true
}
```

### 3. Poll Status (every 3 seconds)
```json
GET /api/capture-status/{job_id}
Authorization: Bearer {token}

Response (in progress):
{
  "status": "capturing",
  "progress": 45,
  "message": "📡 Capturing network traffic..."
}

Response (completed):
{
  "status": "completado",
  "progress": 100,
  "result": {
    "total_flows": [{"name": "Total", "description": "1250 flows"}],
    "anomalias": [
      {"name": "DDOS", "description": "150 DDoS attacks detected"},
      {"name": "PORT SCAN", "description": "75 port scans detected"}
    ],
    "porcentaje_anomalias": 20.0,
    "csv_path": "capture_12345.csv",
    "predicciones_path": "predictions_12345.csv"
  }
}
```

### 4. Download Results
```json
GET /download/{filename}
Authorization: Bearer {token}

Returns: CSV file download
```

---

## 📊 Detected Anomaly Types

| Type | Description |
|------|-------------|
| `BENIGN` | Normal traffic |
| `BOT` | Bot activity |
| `BRUTE FORCE` | Brute force attacks |
| `DDOS` | Distributed denial of service |
| `DOS` | Denial of service |
| `PORT SCAN` | Port scanning |
| `WEB ATTACK` | Web application attacks |

---

## ⚠️ Error Handling

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized (invalid/expired token)
- `404`: Not found
- `422`: Validation error
- `500`: Server error

### Error Response Format
```json
{
  "detail": "Error description",
  "message": "User-friendly error message"
}
```

---

## 🔄 Complete Example (TypeScript)

```typescript
// 1. Login
const loginResponse = await fetch('http://127.0.0.1:8000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});
const { access_token } = await loginResponse.json();

// 2. Get interfaces
const interfacesResponse = await fetch('http://127.0.0.1:8000/interfaces', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const { interfaces } = await interfacesResponse.json();

// 3. Start capture
const captureResponse = await fetch('http://127.0.0.1:8000/captura/iniciar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    duracion_segundos: 30,
    interfaz: interfaces[0]
  })
});
const { job_id } = await captureResponse.json();

// 4. Poll status
const checkStatus = async () => {
  const statusResponse = await fetch(`http://127.0.0.1:8000/api/capture-status/${job_id}`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  const status = await statusResponse.json();
  
  if (status.status === 'completado') {
    console.log('Capture completed!', status.result);
    return status.result;
  } else if (status.status === 'error') {
    throw new Error(status.message);
  } else {
    // Continue polling
    setTimeout(checkStatus, 3000);
  }
};

checkStatus();
```

For detailed documentation in Spanish, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).