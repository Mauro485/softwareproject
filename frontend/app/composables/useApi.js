export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBaseUrl;

  // Creamos una instancia preconfigurada de $fetch (incluido en Nuxt)
  const apiFetch = $fetch.create({
    baseURL,
    onRequest({ request, options }) {
      // Recuperar el token desde cookies (si existe) y adjuntarlo
      const token = useCookie('auth_token').value;
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        };
      }
    }
  });

  // Login (CU-2)
  const login = async (email, password) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      
      // Guardar token y usuario en cookies para persistencia
      const tokenCookie = useCookie('auth_token');
      tokenCookie.value = response.token;
      
      const userCookie = useCookie('user_data');
      userCookie.value = response.user;

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Registro
  const register = async (userData) => {
    try {
      return await apiFetch('/auth/register', {
        method: 'POST',
        body: userData
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Inscripción a Curso (CU-4)
  const enrollCourse = async (courseId) => {
    try {
      return await apiFetch(`/courses/${courseId}/enroll`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Enroll error:', error);
      throw error;
    }
  };

  // Obtener Módulo para Estudio (sin respuestas correctas)
  const getModuleStudy = async (courseId, moduleId) => {
    try {
      return await apiFetch(`/courses/${courseId}/modules/${moduleId}/study`);
    } catch (error) {
      console.error('Get module study error:', error);
      throw error;
    }
  };

  // Evaluar Módulo (CU-7)
  const evaluateModule = async (courseId, moduleId, answers) => {
    try {
      return await apiFetch(`/courses/${courseId}/modules/${moduleId}/evaluate`, {
        method: 'POST',
        body: { answers }
      });
    } catch (error) {
      console.error('Evaluate module error:', error);
      throw error;
    }
  };

  // Ver Progreso (CU-8)
  const getProgress = async (courseId, moduleId) => {
    try {
      return await apiFetch(`/courses/${courseId}/modules/${moduleId}/progress`);
    } catch (error) {
      console.error('Get progress error:', error);
      throw error;
    }
  };

  // Obtener Cursos (para el Dashboard)
  const getCourses = async () => {
    try {
      return await apiFetch('/courses');
    } catch (error) {
      console.error('Get courses error:', error);
      throw error;
    }
  };

  // Obtener Cursos Inscritos del Estudiante
  const getEnrolledCourses = async () => {
    try {
      return await apiFetch('/courses/student/enrolled');
    } catch (error) {
      console.error('Get enrolled courses error:', error);
      throw error;
    }
  };

  // Obtener Estudiantes del Docente (CU-Dashboard)
  const getTeacherStudents = async () => {
    try {
      return await apiFetch('/courses/teacher/students');
    } catch (error) {
      console.error('Get teacher students error:', error);
      throw error;
    }
  };

  // Obtener Logros del Estudiante (CU-9)
  const getAchievements = async () => {
    try {
      return await apiFetch('/achievements/user');
    } catch (error) {
      console.error('Get achievements error:', error);
      throw error;
    }
  };

  // Crear Curso (Solo Docente)
  const createCourse = async (name, description, modules = []) => {
    try {
      return await apiFetch('/courses', {
        method: 'POST',
        body: { name, description, modules }
      });
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  };

  // Agregar Módulo a un Curso (Solo Docente)
  const createModule = async (courseId, moduleData) => {
    try {
      return await apiFetch(`/courses/${courseId}/modules`, {
        method: 'POST',
        body: moduleData
      });
    } catch (error) {
      console.error('Create module error:', error);
      throw error;
    }
  };

  // Agregar Actividad a un Módulo (Solo Docente)
  const createActivity = async (courseId, moduleId, activityData) => {
    try {
      return await apiFetch(`/courses/${courseId}/modules/${moduleId}/activities`, {
        method: 'POST',
        body: activityData
      });
    } catch (error) {
      console.error('Create activity error:', error);
      throw error;
    }
  };

  // Subir archivo al backend
  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiFetch('/upload', {
        method: 'POST',
        body: formData
      });
      return response.url; // url devuelta por el backend
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  };

  // Obtener cursos creados por el docente
  const getTeacherCourses = async () => {
    try {
      return await apiFetch('/courses/teacher/courses');
    } catch (error) {
      console.error('Get teacher courses error:', error);
      throw error;
    }
  };

  // Actualizar un curso
  const updateCourse = async (courseId, name, description) => {
    try {
      return await apiFetch(`/courses/${courseId}`, {
        method: 'PUT',
        body: { name, description }
      });
    } catch (error) {
      console.error('Update course error:', error);
      throw error;
    }
  };

  // Eliminar un curso
  const deleteCourse = async (courseId) => {
    try {
      return await apiFetch(`/courses/${courseId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete course error:', error);
      throw error;
    }
  };

  // Actualizar un módulo
  const updateModule = async (courseId, moduleId, moduleData) => {
    try {
      return await apiFetch(`/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        body: moduleData
      });
    } catch (error) {
      console.error('Update module error:', error);
      throw error;
    }
  };

  // Eliminar un módulo
  const deleteModule = async (courseId, moduleId) => {
    try {
      return await apiFetch(`/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Delete module error:', error);
      throw error;
    }
  };

  return {
    login,
    register,
    enrollCourse,
    getModuleStudy,
    evaluateModule,
    getProgress,
    getCourses,
    getEnrolledCourses,
    getTeacherStudents,
    getAchievements,
    createCourse,
    createModule,
    createActivity,
    uploadFile,
    getTeacherCourses,
    updateCourse,
    deleteCourse,
    updateModule,
    deleteModule,
    apiFetch
  };
};
