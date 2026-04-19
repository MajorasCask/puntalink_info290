# PuntaLink v1.0

**PuntaLink** es un sistema web para el análisis y gestión de proyectos estructurales, permitiendo importar archivos `.TXT`, procesar y visualizar datos de muros, realizar cálculos para braces y deadman, y generar reportes.

Desarrollado en Node.js + Express (backend), PostgreSQL (base de datos), y HTML/CSS/JS puro (frontend).


## Características principales

- Importación de datos estructurales desde archivos `.TXT`.
- Visualización de paneles y resultados en tabla.
- Cálculo y manejo de muros, braces y deadman.
- Exportación de reportes.

### Requerimientos
- Se debe poder calcular la fuerza del viento sobre los muros.
- Se deben poder guardar proyectos creados.
- Se debe poder crear un documento en .pdf que detalle los cálculos realizados.
- Se deben poder calcular la cantidad de materiales necesaria para construir los
muertos.

### Especificaciones
- El sistema deberá permitir ingresar los parámetros necesarios para el cálculo de
viento, incluyendo dimensiones del muro y variables estructurales requeridas, y
deberá mostrar el resultado del cálculo en pantalla asociado al proyecto activo.
- El sistema deberá almacenar cada proyecto en una base de datos PostgreSQL,
registrando como mínimo: identificador del proyecto, usuario asociado, fecha de
creación, fecha de modificación y datos de entrada utilizados en los cálculos.
- El sistema deberá generar un archivo PDF por proyecto que incluya: nombre del
proyecto, fecha de generación, parámetros de entrada, resultados de cálculo de
viento y estimación de materiales.
- El sistema deberá calcular la cantidad de materiales por muro y por proyecto,
mostrando los resultados en tablas con el formato definido por el cliente.

### Requisitos funcionales
- El sistema debe asociar y diferenciar los proyectos con una cuenta de Google.
- El sistema debe manejar diferentes versiones de un mismo proyecto.

### Requisitos no funcionales
- El sistema debe ser desarrollado como un servicio web.
- Las distintas tablas deben seguir los formatos definidos por el cliente.

### Modelo arquitectónico
El sistema presenta un modelo arquitectónico de tipo web en tres capas. La capa de
presentación corresponde al frontend, encargado de la interacción con el usuario; la capa
de negocio corresponde al backend desarrollado con Node.js y Express, donde se
implementan las reglas y cálculos del sistema; y la capa de datos corresponde a
PostgreSQL, utilizada para la persistencia de proyectos y resultados. Además, el despliegue
mediante Docker Compose evidencia una separación cliente-servidor entre frontend,
backend y base de datos. Por ello, puede afirmarse que sí existe un modelo arquitectónico,
aunque no esté formalizado en un diagrama explícito dentro de la documentación principal.

## Requisitos

- **Node.js** v18+ (LTS recomendado)
- **Docker Desktop** v4.46+


## Estructura del proyecto

```
puntalink/
│
├── backend/ # API REST, lógica servidor, conexión BD
│ ├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── models/
│
├── frontend/
│ └── public/ # Interfaz web (*.html, *.js, *.css)
│
├── data/ # Manuales, diagramas, SQL (opcional)
└── ...
```

## Descarga y despliegue de la aplicación

### 1. Preparar directorio del proyecto

El proyecto se puede descargar como un .zip o clonarse por medio de git.

### 2. Docker Desktop

#### 2.1 Instalar Docker Desktop

Este proyecto se levanta por medio de Docker Desktop.
Descarga Docker Desktop [aquí](https://docs.docker.com/get-started/get-docker/).

Sigue los pasos para la instalación. Luego de la instalación, reinicia tu computador.

#### 2.1 Iniciar Docker Desktop

Docker Desktop se puede iniciar con la interfaz gráfica del sistema operativo o por medio de la consola.

- Linux:
    ```bat
    sudo systemctl start docker
    ```
- Windows:
    ```cmd
    docker desktop start
    ```

### 3. Levantar la aplicación

Estos comandos y los del paso 4 se realizan desde la carpeta raíz del proyecto.

- Para correr el proceso en foreground y ver los logs en la consola (pero dejar la consola anclada al proceso):
    ```cmd
    docker compose up --build
    ```
- Para correr el proceso en background (la consola queda liberada y puede ejecutar otros comandos):
    ```cmd
    docker compose up --build -d
    ```
    - Los logs se pueden ver en Docker Desktop o con el siguiente comando:
        ```cmd
        docker compose logs -f
        ```
#### 3.1. Acceder a Puntalink
Para acceder a Puntalink, introduce la dirección http://localhost:3008/ en tu navegador.

### 4. Detener la aplicación

- Si está corriendo en foreground, usar la combinación de teclas <kbd>Ctrl</kbd> + <kbd>C</kbd>
    - Puede requerirse presionar otra tecla antes de que la detención se lleve a cabo.

- Si está corriendo en background:
    ```cmd
    docker compose stop
    ```

## Manual de usuario
[Enlace al manual en Google Docs](https://drive.google.com/file/d/1zLXreBXLX6Niz4EJT39ZyNrOROOdcQHh/view?usp=drive_link)

## Contacto
Equipo Nonlucrum

Product Owner:\
Ninoska Toledo\
ninoska.toledo@outlook.com
