# Guia de Testing E2E con Selenium WebDriver, Mocha y Chai

## 1. Objetivo

Este documento explica:

- Que se implemento para pruebas automaticas E2E.
- Que hace cada archivo de testing.
- Como se ejecutan las pruebas.
- Que valida cada caso de prueba.
- Como leer resultados y evidencias.

La solucion esta pensada para validar el frontend de PuntaLink en flujos clave de autenticacion y proyectos, sin depender del backend real ni de login real de Google.

## 2. Stack de testing utilizado

- Selenium WebDriver: automatiza el navegador Chrome.
- Mocha: framework de ejecucion de pruebas.
- Chai: libreria de aserciones.
- Mochawesome: reporte HTML/JSON de resultados.

## 3. Estructura de archivos creada

- test/e2e/ui.smoke.spec.js
- test/e2e/helpers/webdriver.js
- test/e2e/helpers/staticServer.js
- test/e2e/helpers/mockApiServer.js
- test/artifacts/e2e/
- test/artifacts/mochawesome/

## 4. Que hace cada modulo

### 4.1 test/e2e/helpers/webdriver.js

Responsabilidad:

- Crear y configurar una instancia de Chrome para ejecutar pruebas.

Como funciona:

- Usa Selenium Builder para browser chrome.
- Por defecto corre en modo headless (sin UI visible).
- Permite modo visible si E2E_HEADFUL=true.
- Configura tamano de ventana y argumentos para mayor estabilidad.

### 4.2 test/e2e/helpers/staticServer.js

Responsabilidad:

- Servir los archivos del frontend/public en un puerto local de pruebas.

Como funciona:

- Levanta un servidor HTTP minimalista.
- Resuelve rutas estaticas (html, css, js, imagenes, etc).
- Sirve index.html cuando se entra por la raiz.

Motivo:

- Selenium necesita una URL HTTP real para probar el frontend.

### 4.3 test/e2e/helpers/mockApiServer.js

Responsabilidad:

- Simular el backend en el puerto 4008 para autenticacion y proyectos.

Como funciona:

- Expone endpoints mock:
  - POST /api/auth/google
  - GET /api/auth/me
  - POST /api/auth/logout
  - GET /api/proyecto/listar
  - GET /api/proyecto/cargar
  - POST /api/proyecto/crear
  - DELETE /api/proyecto/eliminar
- Mantiene estado en memoria (usuario logueado y lista de proyectos).
- Responde con CORS habilitado para pruebas desde localhost.

Motivo:

- Evita depender de base de datos real, backend real y Google Identity real.

### 4.4 test/e2e/ui.smoke.spec.js

Responsabilidad:

- Definir y ejecutar los escenarios E2E.

Como funciona:

- before:
  - Levanta mock API en 4008.
  - Levanta servidor estatico en 3010 (o variable E2E_PORT).
  - Crea el navegador Selenium.
- beforeEach:
  - Resetea estado del mock API.
  - Limpia cookies y storage.
- afterEach:
  - Si un test falla, guarda screenshot y HTML de la pagina.
  - Si E2E_CAPTURE_ALL=true, captura en todos los tests.
- after:
  - Cierra driver y servidores.

## 5. Casos de prueba implementados

### 5.1 Inicia sesion correctamente

Valida:

- Activacion visual de la grua/login.
- Simulacion de callback de Google.
- Cambio a estado autenticado en UI.
- Render de email de usuario en cabecera.

Tecnica:

- Se invoca window.onGoogleCredential con token falso.
- El mock API responde como login exitoso.

### 5.2 Carga un proyecto desde la lista

Valida:

- Flujo de cargar proyecto con id existente.
- Persistencia en localStorage de projectConfig.
- Navegacion hacia dashboard.html.

Tecnica:

- Se fuerza usuario logueado en el mock API.
- Se invoca flujo real de carga de proyecto y se valida resultado.

### 5.3 Crea un proyecto nuevo

Valida:

- Llenado del formulario de proyecto.
- Envio al endpoint crear del mock API.
- Redireccion al dashboard.
- Datos guardados en localStorage.

Tecnica:

- Selenium escribe en campos del formulario.
- Se hace click en boton crear y se espera navegacion.

### 5.4 Carga dashboard y renderiza bloque principal

Valida:

- Render base del dashboard.
- Presencia de encabezado principal.
- Disponibilidad de boton de carga de TXT.

## 6. Scripts npm disponibles

En package.json quedaron los siguientes scripts:

- npm run test:e2e
  - Ejecuta suite E2E con reporter spec.

- npm run test:e2e:headful
  - Ejecuta suite E2E mostrando ventana del navegador.

- npm run test:e2e:report
  - Ejecuta suite E2E con reporter mochawesome (HTML + JSON).

## 7. Evidencias y reportes

### 7.1 Evidencias por fallo

Si un test falla, se guardan:

- Screenshot PNG
- HTML de la pagina al fallar

Ubicacion:

- test/artifacts/e2e/

### 7.2 Reporte ejecutable para compartir

Al usar npm run test:e2e:report se generan:

- test/artifacts/mochawesome/e2e-report.html
- test/artifacts/mochawesome/e2e-report.json

Uso recomendado:

- Compartir el HTML para revision funcional del equipo.
- Guardar el JSON para trazabilidad en CI.

## 8. Flujo recomendado para presentar al equipo

1. Explicar objetivo de E2E (validar experiencia real de usuario).
2. Mostrar arquitectura de pruebas (Selenium + Mocha + Chai + mock API).
3. Ejecutar npm run test:e2e:headful en vivo.
4. Mostrar resultado de casos pasando.
5. Mostrar reporte HTML generado con npm run test:e2e:report.
6. Explicar carpeta de evidencias de fallos para debugging.

## 9. Decisiones tecnicas importantes

- Se usa localhost en tests para compatibilidad con API_BASE del frontend.
- Se usa backend mock para pruebas deterministicas y repetibles.
- Se capturan evidencias automaticas para acelerar analisis de fallos.
- Se evita depender de servicios externos para que CI sea estable.

## 10. Limitaciones actuales

- No se valida login real contra Google (se simula callback).
- No se prueba backend real ni base de datos real en esta suite.
- Es una suite E2E de frontend con API mock.

Esto es intencional para tener rapidez y estabilidad.

## 11. Proximos pasos sugeridos

- Agregar caso negativo de login fallido.
- Agregar caso de validaciones del formulario (campos obligatorios).
- Agregar pruebas de importacion TXT y calculos clave.
- Integrar ejecucion en CI (GitHub Actions) con artefactos de reporte.

## 12. Comandos rapidos

- Ejecutar pruebas: npm run test:e2e
- Ver navegador: npm run test:e2e:headful
- Generar reporte: npm run test:e2e:report
- Capturar todo (no solo fallos) en PowerShell:
  - $env:E2E_CAPTURE_ALL='true'; npm run test:e2e:report
