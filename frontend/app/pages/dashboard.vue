<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/dashboard">
        <img src="/logo-unicordoba.png" alt="Logo Universidad de Córdoba" class="header-logo">
      </NuxtLink>
      <div class="header-title text-xl font-medium text-gradient">
        <template v-if="role === 'teacher'">Panel del Docente</template>
        <template v-else-if="role === 'student'">Panel del Estudiante</template>
        <template v-else>Acceso de Invitado</template>
      </div>
    </header>

    <main class="main-content container mt-8 mb-8 flex-grow">
      
      <!-- Banner para invitados -->
      <div v-if="role === 'guest'" class="warning-alert p-4 mb-6 rounded-lg text-center font-medium">
        Modo Invitado: Tu progreso no será guardado. <NuxtLink to="/register" class="underline font-bold">Regístrate para guardar tu avance.</NuxtLink>
      </div>

      <div class="flex justify-between items-center mb-8 panel p-6">
        <div>
          <h1 class="text-3xl font-bold">
            <span v-if="role === 'teacher'" class="text-gradient">Panel del Docente</span>
            <span v-else-if="role === 'student'" class="text-gradient">Panel del Estudiante</span>
            <span v-else class="text-gradient">Acceso de Invitado</span>
          </h1>
          <p class="text-secondary">{{ role === 'teacher' ? 'Supervisa a tus estudiantes' : 'Temario de Git y GitHub' }}</p>
        </div>
        <div class="flex gap-4">
          <NuxtLink v-if="role !== 'teacher'" to="/catalog" class="btn-primary">Explorar Catálogo</NuxtLink>
          <NuxtLink v-if="role === 'teacher'" to="/course-manager" class="btn-primary">Gestionar Contenidos</NuxtLink>
          <button v-if="role !== 'guest'" class="btn-secondary" @click="logout">Cerrar Sesión</button>
        </div>
      </div>

      <div v-if="loading" class="text-center mt-8">
        <p>Cargando datos...</p>
      </div>

      <!-- VISTA DOCENTE: Layout con Menú Lateral -->
      <div v-else-if="role === 'teacher'" class="flex flex-col md:flex-row gap-8">
        
        <!-- Sidebar (Docente) -->
        <aside class="w-full md:w-1/4 flex flex-col gap-4">
          <div class="panel p-6">
            <h3 class="text-lg font-bold mb-4 border-b border-[#30363d] pb-2 text-white">Menú Docente</h3>
            <nav class="flex flex-col gap-2">
              <button @click="activeTab = 'estudiantes'" :class="['menu-btn', activeTab === 'estudiantes' ? 'active' : '']">Estudiantes Inscritos</button>
              <button @click="activeTab = 'mis-unidades'" :class="['menu-btn', activeTab === 'mis-unidades' ? 'active' : '']">Mis Unidades</button>
            </nav>
          </div>
        </aside>

        <!-- Contenido Principal Docente -->
        <div class="w-full md:w-3/4">
          
          <!-- Tab Estudiantes -->
          <div v-if="activeTab === 'estudiantes'" class="panel p-6">
            <h2 class="text-2xl font-bold mb-6">Estudiantes Inscritos</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-[#30363d]">
                    <th class="p-3">Nombre</th>
                    <th class="p-3">Email</th>
                    <th class="p-3">Unidad de Aprendizaje</th>
                    <th class="p-3 text-center">Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in teacherStudents" :key="student.id" class="border-b border-[#30363d] hover:bg-[#30363d]/30 transition-colors">
                    <td class="p-3">{{ student.studentName }}</td>
                    <td class="p-3">{{ student.studentEmail }}</td>
                    <td class="p-3">{{ student.courseName }}</td>
                    <td class="p-3">
                      <div class="w-full bg-[#161b22] border border-[#30363d] rounded-full h-3 relative overflow-hidden">
                        <div class="bg-[#ff6600] h-full rounded-full shadow-[0_0_10px_#ff6600] transition-all duration-500 ease-out" :style="{ width: student.progress + '%' }"></div>
                      </div>
                      <div class="text-xs text-center mt-1 font-bold text-secondary">PROGRESO {{ student.progress }}%</div>
                    </td>
                  </tr>
                  <tr v-if="teacherStudents.length === 0">
                    <td colspan="4" class="p-4 text-center text-secondary">Aún no hay estudiantes inscritos.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tab Mis Unidades -->
          <div v-if="activeTab === 'mis-unidades'" class="panel p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold">Mis Unidades Creadas</h2>
              <NuxtLink to="/course-manager" class="btn-primary text-sm">+ Nueva Unidad</NuxtLink>
            </div>
            
            <div v-if="teacherCourses.length === 0" class="text-center p-8 text-secondary border border-dashed border-[#30363d] rounded-lg">
              No has creado ninguna unidad todavía.
            </div>
            
            <div v-else class="flex flex-col gap-6">
              <div v-for="course in teacherCourses" :key="course._id" class="panel p-6 module-card">
                <div class="flex-grow">
                  <h3 class="font-bold text-xl text-white uppercase">{{ course.name }}</h3>
                  <p class="text-sm text-secondary mt-2 mb-4">{{ course.description || 'Sin descripción' }}</p>
                </div>
                <div class="flex justify-between items-end mt-auto">
                  <span class="badge">{{ course.modules?.length || 0 }} MÓDULOS</span>
                  <div class="flex gap-4">
                    <button @click="handleDeleteCourse(course._id)" class="btn-secondary" style="background-color: transparent; border-color: rgba(218,54,51,0.5); color: #ff7b72;" onmouseover="this.style.backgroundColor='rgba(218,54,51,0.2)'; this.style.borderColor='#da3633'" onmouseout="this.style.backgroundColor='transparent'; this.style.borderColor='rgba(218,54,51,0.5)'">Eliminar</button>
                    <NuxtLink :to="`/course-manager?edit=${course._id}`" class="btn-primary">Editar Unidad</NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA ESTUDIANTE/INVITADO: Layout con Menú Lateral -->
      <div v-else class="flex flex-col md:flex-row gap-8">
        
        <!-- Sidebar (Solo Estudiantes) -->
        <aside v-if="role === 'student'" class="w-full md:w-1/4 flex flex-col gap-4">
          <div class="panel p-6">
            <h3 class="text-lg font-bold mb-4 border-b pb-2">Menú</h3>
            <nav class="flex flex-col gap-2">
              <button @click="activeTab = 'cursos'" :class="['menu-btn', activeTab === 'cursos' ? 'active' : '']">Mis Unidades</button>
              <button @click="activeTab = 'logros'" :class="['menu-btn', activeTab === 'logros' ? 'active' : '']">Mis Logros</button>
            </nav>
          </div>
        </aside>

        <!-- Contenido Principal -->
        <div :class="{'w-full': role !== 'student', 'w-full md:w-3/4': role === 'student'}">
          
          <!-- Tab: Mis Cursos -->
          <div v-if="activeTab === 'cursos' || role !== 'student'">
            <div v-for="course in enrolledCoursesList" :key="course._id" class="mb-12">
              <h2 class="text-2xl font-bold mb-6 pb-2 border-b border-[#30363d] text-white tracking-wide uppercase">{{ course.name }}</h2>
              
              <!-- Si la unidad no tiene módulos aún -->
              <div v-if="!course.modules || course.modules.length === 0" class="panel p-8 text-center text-secondary">
                <p class="text-xl mb-2">Esta unidad aún no tiene módulos publicados.</p>
                <p>El docente a cargo agregará el contenido pronto.</p>
              </div>

              <div v-else class="flex flex-col gap-4">
                <div v-for="mod in course.modules" :key="mod._id" class="panel p-6 module-card">
                  <h3 class="text-xl font-bold mb-2">{{ mod.title }}</h3>
                  <div v-if="role === 'student'" class="mb-5">
                    <div class="flex justify-between text-xs font-bold mb-2">
                      <span class="text-secondary">PROGRESO</span>
                      <span class="text-[#ff6600]">{{ mod.progress || 0 }}%</span>
                    </div>
                    <div class="w-full bg-[#161b22] border border-[#30363d] rounded-full h-2 relative overflow-hidden">
                      <div class="bg-[#ff6600] h-full rounded-full shadow-[0_0_10px_#ff6600] transition-all duration-500 ease-out" :style="{ width: (mod.progress || 0) + '%' }"></div>
                    </div>
                  </div>
                  <p class="text-secondary mb-4 flex-grow">{{ mod.description }}</p>
                  <div class="flex justify-end items-center mt-auto pt-4 border-t border-[#30363d] gap-4">
                    <span class="badge whitespace-nowrap">Módulo {{ mod.order }}</span>
                    <NuxtLink :to="`/course/${course._id}/module/${mod._id}`" class="btn-primary text-sm whitespace-nowrap flex-shrink-0">Ver Contenido</NuxtLink>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="enrolledCoursesList.length === 0" class="text-center p-8 text-secondary">
               No hay unidades disponibles para mostrar.
            </div>
          </div>

          <!-- Tab: Mis Logros -->
          <div v-if="activeTab === 'logros' && role === 'student'">
            <h2 class="text-2xl font-bold mb-6 pb-2 border-b">Mis Logros</h2>
            <div v-if="achievementsList.length === 0" class="panel p-8 text-center text-secondary">
              Aún no has desbloqueado ningún logro. ¡Completa los módulos para ganar medallas!
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="ach in achievementsList" :key="ach.id" class="panel p-6 flex flex-col items-center text-center achievement-card">
                <div class="text-6xl mb-4">{{ ach.icon }}</div>
                <h3 class="text-lg font-bold mb-2">{{ ach.title }}</h3>
                <p class="text-sm text-secondary">{{ ach.description }}</p>
                <div class="mt-4 text-xs font-bold text-gray-400">
                  Desbloqueado: {{ new Date(ach.unlockedAt).toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer-global w-full text-center">
      <p>Diseño y Desarrollo de Software Educativo III<br />Departamento de Informática Educativa<br />Universidad de Córdoba<br />2026</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useCookie } from '#app';

const api = useApi();
const router = useRouter();
const loading = ref(true);

const role = ref('guest');
const isEnrolled = ref(false); // Solo como referencia visual por ahora

const enrolledCoursesList = ref([]);
const teacherStudents = ref([]);
const teacherCourses = ref([]);
const achievementsList = ref([]);
const activeTab = ref('cursos'); // For student 'cursos', 'logros'. For teacher 'estudiantes', 'mis-unidades'.

onMounted(async () => {
  loading.value = true;
  
  // 1. Recuperar Estado
  const token = useCookie('auth_token').value;
  const userData = useCookie('user_data').value;
  
  if (token && userData && userData.role) {
    role.value = userData.role;
  }

  try {
    // 2. Consumo de API según el Rol
    if (role.value === 'teacher') {
      activeTab.value = 'estudiantes';
      teacherStudents.value = await api.getTeacherStudents();
      try {
        teacherCourses.value = await api.getTeacherCourses();
      } catch(e) {
        console.error("Error loading teacher courses", e);
      }
    } else if (role.value === 'student') {
      // Estudiante: Obtener cursos inscritos
      const enrolled = await api.getEnrolledCourses();
      if (!enrolled || enrolled.length === 0) {
        return router.push('/catalog');
      }
      
      isEnrolled.value = true;
      
      // Mapear progreso para cada módulo de cada curso
      for (let course of enrolled) {
        course.modules = course.modules.map(m => ({ ...m, progress: 0 }));
        for (let mod of course.modules) {
          try {
            const prog = await api.getProgress(course._id, mod._id);
            if (prog && prog.percentage !== undefined) {
              mod.progress = prog.percentage;
            }
          } catch (err) {
            // 404 significa que no tiene progreso aún
          }
        }
      }
      
      enrolledCoursesList.value = enrolled;
      
      // Obtener Logros
      try {
        achievementsList.value = await api.getAchievements();
      } catch (err) {
        console.error('Error obteniendo logros:', err);
      }
    } else {
      // Invitado: Obtener todos los cursos del catálogo general
      const courses = await api.getCourses();
      if (courses && courses.length > 0) {
        enrolledCoursesList.value = courses.map(c => ({
          ...c,
          modules: c.modules.map(m => ({ ...m, progress: 0 }))
        }));
      }
    }
  } catch (error) {
    console.error("Error al cargar datos del dashboard:", error);
  } finally {
    loading.value = false;
  }
});

// La función enroll() ya no es necesaria aquí porque se hace en el catálogo

const logout = () => {
  const token = useCookie('auth_token');
  const userData = useCookie('user_data');
  token.value = null;
  userData.value = null;
  router.push('/login');
};

const handleDeleteCourse = async (courseId) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta unidad y todos sus módulos? Esta acción no se puede deshacer.')) {
    try {
      await api.deleteCourse(courseId);
      teacherCourses.value = teacherCourses.value.filter(c => c._id !== courseId);
      alert('Unidad eliminada exitosamente.');
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la unidad.');
    }
  }
};
</script>

<style scoped>
.menu-btn {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: 0 0.5rem 0.5rem 0;
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  border-left: 4px solid transparent;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.menu-btn:hover {
  background-color: rgba(48, 54, 61, 0.5);
  color: var(--text-primary);
}
.menu-btn.active {
  background-color: rgba(255, 102, 0, 0.1);
  border-left-color: var(--primary-color);
  color: var(--text-primary);
  font-weight: 700;
}
.module-card {
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  border-color: var(--primary-color);
}

.achievement-card {
  transition: all 0.3s ease;
  background-color: var(--surface-color);
}
.achievement-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 10px 20px rgba(255, 102, 0, 0.15);
  border-color: var(--primary-color);
}

.badge {
  background-color: rgba(255, 102, 0, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(255, 102, 0, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Tabla Estudiantes */
table {
  width: 100%;
  border-spacing: 0;
}

th {
  background-color: var(--surface-color);
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem;
  border-bottom: 2px solid var(--border-color);
}

td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 500;
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:last-child td {
  border-bottom: none;
}
</style>
