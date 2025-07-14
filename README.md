# Frontend - Predicción ML para Detección de Tráfico Anómalo

Este proyecto es una aplicación frontend React para la detección de tráfico anómalo de redes usando Machine Learning con Random Forest.

## 📚 Documentación de API

**¿Necesitas saber qué espera el backend del frontend y qué devuelve?**

- **[📖 Guía Completa de API (Español)](./API_DOCUMENTATION.md)** - Documentación detallada con ejemplos
- **[📋 API Quick Reference (English)](./API_GUIDE_EN.md)** - Guía rápida en inglés

## 🚀 Inicio Rápido

Este proyecto fue creado con [Create React App](https://github.com/facebook/create-react-app).

### Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## 🔌 Integración con Backend

Esta aplicación frontend se conecta con un backend FastAPI que proporciona:

- **Autenticación JWT**: Login y registro de usuarios
- **Captura de Tráfico**: Monitoreo de interfaces de red
- **Análisis ML**: Detección de anomalías con Random Forest
- **Descarga de Resultados**: Archivos CSV con predicciones

### Configuración del Backend

Asegúrate de que el backend esté ejecutándose en:
```
http://127.0.0.1:8000
```

### Variables de Entorno

Configura las siguientes variables en `.env`:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

## 🔧 Arquitectura de la Aplicación

### Estructura de Carpetas
```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas principales
├── services/      # Servicios de API
├── types/         # Definiciones de tipos TypeScript
├── hooks/         # Custom hooks
├── contexts/      # React contexts
└── utils/         # Utilidades
```

### Flujo de Trabajo

1. **Autenticación**: Login con credenciales
2. **Selección de Interfaz**: Elegir interfaz de red
3. **Captura**: Iniciar monitoreo por tiempo definido
4. **Análisis**: Procesamiento automático con ML
5. **Resultados**: Visualización y descarga de datos

## 📖 Más Información

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [TypeScript documentation](https://www.typescriptlang.org/)
- [Tailwind CSS documentation](https://tailwindcss.com/)
