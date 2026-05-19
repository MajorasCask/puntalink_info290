# Presentación: Cobertura de pruebas con Istanbul en Puntalink

## Duración: 10 minutos

### 1. Objetivo
- Explicar cómo medimos la cobertura de pruebas en el proyecto.
- Mostrar que la meta no es solo ejecutar código, sino validar funcionalidades reales.
- Presentar Istanbul como base técnica para obtener evidencia de cobertura.

### 2. ¿Qué significa cobertura de pruebas?
- Es el porcentaje de funcionalidades o requisitos que tienen pruebas asociadas.
- Responde a la pregunta: “¿qué parte del sistema está validada por tests?”.
- No es lo mismo que cobertura de código: una mide requisitos cubiertos y la otra líneas ejecutadas.

### 3. ¿Por qué usamos Istanbul?
- Istanbul permite medir cobertura de ejecución con reportes claros.
- En este proyecto lo usamos con `nyc` y Mocha para evitar conflictos con Vitest y obtener reportes claros.
- Genera reportes HTML y `lcov` para revisar qué quedó probado y qué no.

### 4. Cómo lo aplicamos en Puntalink
- Definimos un mapping requisito → test.
- Cada requisito importante se enlaza con uno o más archivos de prueba.
- Generamos un informe que indica qué requisitos están cubiertos y cuáles faltan.

### 5. Ejemplo en el proyecto
- Requisitos de proyectos: cubiertos por `projectController.test.ts` y `projectService.test.ts`.
- Requisitos de cálculos: cubiertos por `calculosService.test.ts`.
- Requisitos de autenticación: cubiertos por `auth.test.ts`.
- Requisitos pendientes: PDF.

### 6. Resultados actuales
- El informe de cobertura de pruebas ya se genera automáticamente.
- El proyecto muestra avance parcial: algunos requisitos están cubiertos y otros no.
- Esto ayuda a priorizar qué pruebas faltan antes de entregar.

### 7. Ventajas de este enfoque
- Permite justificar cobertura ante docentes o evaluadores.
- Ayuda a encontrar funcionalidades críticas sin pruebas.
- Sirve como base para CI/CD y para mejorar la calidad del proyecto.

### 8. Conclusión
- Istanbul ayuda a medir la ejecución del código.
- El mapping requisito → test ayuda a medir cobertura de pruebas real.
- Juntos dan una visión más completa que solo mirar porcentaje de líneas.

### 9. Cierre
- Pregunta final: ¿qué requisitos todavía faltan por probar?
- Próximo paso: agregar pruebas para PDF y otras rutas críticas.
