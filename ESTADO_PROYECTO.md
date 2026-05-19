# Estado del Proyecto: Plataforma Educativa Git (OVA)

Este documento sirve como punto de guardado y resumen de contexto para retomar el desarrollo en la próxima sesión.

## 1. Estado Actual (Fases Completadas)
Hasta la fecha, se han diseñado, desarrollado e integrado con éxito las **Fases 1 a la 6**:

*   **Fase 1 & 2 (Autenticación y Setup):** Sistema de login robusto con roles (`teacher`, `student`, `guest`) basado en JWT. UI institucional limpia.
*   **Fase 3 (Diseño UI/UX Base):** Implementación del efecto de "ventana de escritorio" minimalista, asegurando una estética académica y premium en toda la plataforma. Uso de paleta de colores institucional (`--primary-color`, `--surface-color`, etc.).
*   **Fase 4 (Dashboard Dinámico):** Enrutamiento condicional basado en cookies. El Docente ve una tabla con sus estudiantes; el Estudiante ve sus módulos.
*   **Fase 5 (Gestor de Contenidos del Docente - Tabbed UI):** 
    *   Formulario protegido (`course-manager.vue`) con sistema de **Pestañas (Tabs)**.
    *   **Pestaña 1 (Material):** Soporta subida de archivos reales (Imágenes, Videos MP4) usando `multer` en el backend.
    *   **Pestaña 2 (Evaluación):** Generador dinámico de preguntas y opciones, con validación estricta de Radio Buttons (`isCorrect`).
*   **Fase 6 (Visor Interactivo del Estudiante):**
    *   **UX de 3 Fases:** Lectura -> Evaluación -> Retroalimentación (Feedback).
    *   **Backend "Antifallas":** Endpoint de estudio (`GET /study`) que limpia las respuestas correctas para evitar trampas en el frontend. Endpoint de evaluación (`POST /evaluate`) que corrige los exámenes del lado del servidor.
    *   **Modo Invitado:** Funcional, con advertencias claras de que no se guardará el progreso.

---

## 2. Arquitectura de la Solución

### Backend (Node.js + Express + MongoDB)
*   `src/models/`: Modelos anidados de Mongoose (`course`, `progress`, `activityResult`, `enrollment`, `user`).
*   `src/routes/`:
    *   `authRoutes.js`: Login y registro.
    *   `uploadRoutes.js`: Manejo de archivos binarios vía `multer`.
    *   `courseRoutes.js`: Rutas Core.
        *   `POST /:id/modules` & `POST /:id/modules/:moduleId/activities` (Docente).
        *   `GET /:id/modules/:moduleId/study` (Estudiante - Limpio).
        *   `POST /:id/modules/:moduleId/evaluate` (Estudiante - Corrección remota).
*   **Seguridad**: Middleware basado en roles (`authMiddleware`, `teacherMiddleware`, `optionalAuthMiddleware`).

### Frontend (Nuxt 4 / Vue.js)
*   **Gestión de Estado**: `useCookie` para tokens JWT y persistencia de roles.
*   **Composables (`useApi.js`)**: Abstracción centralizada con `$fetch`, incluyendo inyección automática del token de autorización e integración completa de endpoints administrativos y de estudiantes.
*   **Vistas Clave (`app/pages/`)**:
    *   `login.vue` y `register.vue` (Acceso).
    *   `dashboard.vue` (Punto de convergencia por rol).
    *   `course-manager.vue` (Gestor de creación con pestañas).
    *   `course/[id]/module/[moduleId].vue` (Máquina de estados de 3 fases para el visor del estudiante).

---

## 3. Pendientes Inmediatos (Siguientes Pasos)

El desarrollo se pausó al término de la Fase 6. Para la **siguiente sesión**, el plan de trabajo es el siguiente:

1.  **Fase 7: Conexión de Barras de Progreso (CU-8)**
    *   Vincular la tabla `Progress` con los componentes del `Dashboard`. El docente debe ver en tiempo real el porcentaje de avance de sus alumnos, y el estudiante debe ver su propia barra circular llenándose dinámicamente.
2.  **Fase 8: Catálogo de Cursos (CU-4)**
    *   Implementar una vista para que el estudiante pueda explorar todos los cursos creados por los docentes y hacer clic en "Inscribirse" (Endpoint `POST /:id/enroll`).
3.  **Fase 9: Gamificación y Logros (CU-9)**
    *   Crear la lógica para otorgar insignias o puntos (Logros) cuando un estudiante llegue al 100% de progreso o resuelva actividades con calificación perfecta.

> **Instrucción de Sistema:** El Asistente IA deberá leer este archivo al iniciar la próxima sesión para recuperar el contexto completo de la arquitectura y el diseño visual ("efecto ventana") antes de emitir cualquier línea de código.
