# Pauta de Entrega - Caso E2E Crear Proyecto

## 1. De que trata esta prueba

Este caso E2E valida el flujo completo de creacion de un proyecto en el frontend de PuntaLink.

La automatizacion comprueba que un usuario puede:

- Ingresar datos del formulario de proyecto.
- Enviar el formulario correctamente.
- Ser redirigido al dashboard.
- Mantener los datos del proyecto en localStorage.

## 2. Como se hace la prueba

### 2.1 Preparacion

1. Instalar dependencias:
   - npm install
2. Ejecutar el caso en modo visible:
   - npm run test:e2e:proyectos:crear:headful

### 2.2 Ejecucion con evidencia completa

Por defecto, la captura se guarda solo si falla el test.

Para capturar evidencia siempre (pase o falle), usar en PowerShell:

- $env:E2E_CAPTURE_ALL='true'; npm run test:e2e:proyectos:crear:headful

Ubicacion de evidencias:

- test/artifacts/e2e/

## 3. Que valida exactamente el caso

Script:

- npm run test:e2e:proyectos:crear:headful

Archivo automatizado:

- test/e2e/proyectos.crear.spec.js

Validaciones funcionales del test:

- Usuario autenticado en entorno mock.
- Ingreso de nombre, empresa, ubicacion y variables de entorno del proyecto.
- Click en boton de creacion.
- Navegacion a dashboard.html.
- Verificacion de datos guardados en localStorage:
  - nombre
  - empresa
  - ubicacion

## 4. Guion detallado para video de entrega

Duracion objetivo: 60 a 90 segundos.

### 4.1 Estructura por tiempo

1. 0s a 10s - Contexto
   - Mostrar la terminal y el repositorio abierto.
   - Explicar que se ejecutara un caso E2E para crear proyecto.
2. 10s a 20s - Comando
   - Escribir y ejecutar: npm run test:e2e:proyectos:crear:headful
3. 20s a 60s - Ejecucion automatizada
   - Mostrar como Selenium completa campos y envia formulario.
   - Mostrar redireccion automatica al dashboard.
4. 60s a 75s - Resultado
   - Enfatizar la salida de consola con 1 passing.
5. 75s a 90s - Cierre
   - Confirmar que el flujo de creacion queda validado de punta a punta.

### 4.2 Texto sugerido para hablar en el video

Puedes usar este texto casi literal:

"En este video demuestro el caso E2E de creacion de proyecto en PuntaLink. La prueba automatiza el navegador con Selenium y valida el flujo completo de usuario."

"Ahora ejecuto el comando npm run test:e2e:proyectos:crear:headful para ver el comportamiento en modo visible."

"Durante la ejecucion, el test completa el formulario de proyecto, envia los datos y espera la redireccion al dashboard."

"El resultado final es 1 passing, lo que confirma que la creacion del proyecto funciona correctamente en este escenario controlado con API mock."

"Con esto queda validado el caso de prueba de crear proyecto de extremo a extremo."

### 4.3 Evidencia opcional para reforzar la entrega

Si quieres mostrar evidencias adicionales en carpeta, ejecuta antes:

- $env:E2E_CAPTURE_ALL='true'; npm run test:e2e:proyectos:crear:headful

Luego mostrar brevemente:

- test/artifacts/e2e/

Nota: sin E2E_CAPTURE_ALL, se guardan capturas solo cuando el test falla.

## 5. Criterio de aprobacion

El caso se considera aprobado cuando:

- El test finaliza en passing.
- Se completa el flujo de creacion sin errores visibles.
- La app redirige al dashboard.
- Los datos del proyecto quedan persistidos como se esperaba.

## 6. Comandos de apoyo

- Ejecutar solo este caso en modo normal: npm run test:e2e:proyectos:crear
- Ejecutar solo este caso en modo visible: npm run test:e2e:proyectos:crear:headful
- Generar reporte global: npm run test:e2e:report

## 7. Checklist rapido antes de grabar

- Tener cerradas ventanas que no aporten a la demo.
- Dejar visible solo terminal y navegador de prueba.
- Ejecutar una vez antes de grabar para confirmar estabilidad.
- Verificar que en consola aparezca 1 passing.
- Si se mostraran evidencias en carpeta, activar E2E_CAPTURE_ALL.
