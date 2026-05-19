# Plan de cobertura del proyecto Puntalink

## 1. Qué conviene testear primero

Prioridad alta:
- `backend/src/services/calculosService.ts`
- `backend/src/services/projectService.ts`
- `backend/src/controllers/projectController.ts`
- `backend/src/controllers/calculosController.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/middlewares/requiereAuth.ts`
- `backend/src/utils/jwt.ts`

Prioridad media:
- `backend/src/services/panelesService.ts`
- `backend/src/services/pdfService.ts`
- `backend/src/services/importService.ts`
- `backend/src/services/grupoMuertoService.ts`
- `backend/src/controllers/panelesController.ts`
- `backend/src/controllers/pdfController.ts`
- `backend/src/controllers/importController.ts`
- `backend/src/controllers/grupoMuertoController.ts`

Prioridad baja o de apoyo:
- `backend/src/models/*.ts`
- `backend/src/routes/*.ts`
- `frontend/public/js/*.js`

## 2. Estrategia por carpetas

- Backend servicios: pruebas unitarias con mocks de DB y dependencias.
- Backend controladores: pruebas unitarias con req/res falsos o integración HTTP con `supertest`.
- Middlewares y utilidades: pruebas unitarias directas.
- Modelos: pruebas con `pool.query` mockeado.
- Frontend JS: pruebas unitarias de funciones puras o de manipulación de DOM.
- E2E: mantener Selenium/Mocha para flujos críticos de usuario.

## 3. Orden recomendado de ejecución

1. Cubrir `calculosService` porque concentra lógica matemática clave.
2. Cubrir `projectService` porque conecta UI, controladores y modelo.
3. Cubrir `projectController` y luego `calculosController`.
4. Continuar con `auth`, `paneles`, `pdf`, `import` y `grupoMuerto`.
5. Agregar pruebas de frontend y E2E al final para validar el recorrido completo.
