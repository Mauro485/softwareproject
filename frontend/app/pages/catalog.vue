<template>
  <div class="page-container">
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/dashboard">
        <img src="/logo-git.png" alt="Git Logo" class="header-logo" style="max-height: 50px; width: auto;" />
      </NuxtLink>
      <div class="header-title text-xl font-medium">Catálogo de Unidades</div>
    </header>

    <main class="main-content container mt-8 mb-8 flex-grow">
      <div class="panel p-6 mb-8 text-center">
        <h1 class="text-3xl font-bold">Unidades Disponibles</h1>
        <p class="text-secondary mt-2">Explora y únete a nuestros entornos virtuales de aprendizaje.</p>
      </div>

      <div v-if="loading" class="text-center mt-8">
        <p>Cargando unidades...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="course in courses" :key="course._id" class="panel p-6 course-card flex flex-col">
          <h3 class="text-xl font-bold mb-2">{{ course.name }}</h3>
          <p class="text-secondary mb-6 flex-grow">{{ course.description }}</p>
          <button @click="enroll(course._id)" class="btn-primary w-full mt-auto" :disabled="enrolling === course._id">
            <span v-if="enrolling === course._id">Inscribiendo...</span>
            <span v-else>Inscribirme</span>
          </button>
        </div>
        
        <div v-if="courses.length === 0" class="col-span-full text-center text-secondary p-8">
          No hay unidades disponibles en este momento.
        </div>
      </div>
    </main>

    <footer class="footer-global" style="width: 100%; padding: 1.5rem 1rem; margin-top: auto; border-top: 1px solid #30363d; background-color: #0d1117; color: #8b949e; font-size: 0.85rem; line-height: 1.6;">
      <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; align-items: start;">
        
        <!-- Columna 1: Logo -->
        <div style="display: flex; justify-content: center; align-items: flex-start; padding-top: 0.25rem;">
          <img src="/logo-unicordoba.png" alt="Logo Universidad de Córdoba" style="max-width: 80px; height: auto; opacity: 0.9;" />
        </div>

        <!-- Columna 2: Institución -->
        <div style="text-align: left;">
          <h4 style="color: #c9d1d9; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">Información Académica</h4>
          <p style="margin: 0;">
            Diseño y Desarrollo de Software Educativo III<br />
            Departamento de Informática Educativa<br />
            Licenciatura en Informática<br />
            Facultad de Educación y Ciencias Humanas<br />
            Universidad de Córdoba<br />
            <span style="display: inline-block; margin-top: 0.25rem;"><strong>Año:</strong> 2026</span><br />
            <strong>Metodología:</strong> MODESEC
          </p>
        </div>

        <!-- Columna 3: Créditos -->
        <div style="text-align: left;">
          <h4 style="color: #c9d1d9; font-weight: bold; margin-bottom: 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">Equipo de Desarrollo</h4>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem;">
            <li><strong style="color: #e6edf3;">Mauro Andrés Monterroza Sevilla:</strong> Product Owner & Developer</li>
            <li><strong style="color: #e6edf3;">Maria Claudia Oquendo Méndez:</strong> Lead UI Designer</li>
            <li><strong style="color: #e6edf3;">Alexander Domínguez Niño:</strong> UX Designer & Developer</li>
            <li><strong style="color: #e6edf3;">Isacar Torreglosa:</strong> Documentation</li>
            <li><strong style="color: #e6edf3;">Ph.D. Raúl Emiro Toscano Miranda:</strong> Academic Tutor</li>
          </ul>
        </div>

      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';

const api = useApi();
const router = useRouter();

const courses = ref([]);
const loading = ref(true);
const enrolling = ref(null);

onMounted(async () => {
  try {
    courses.value = await api.getCourses();
  } catch (error) {
    console.error('Error cargando cursos:', error);
  } finally {
    loading.value = false;
  }
});

const enroll = async (courseId) => {
  enrolling.value = courseId;
  try {
    const response = await api.enrollCourse(courseId);
    
    if (response && response.isGuest) {
      alert('Has entrado como invitado. Tu progreso no se guardará.');
    } else {
      alert('¡Inscripción completada exitosamente!');
    }
    
    router.push('/dashboard');
  } catch (error) {
    console.error('Error inscribiendo:', error);
    if (error.response && error.response.status === 400) {
      alert('Ya estás inscrito en esta unidad.');
      router.push('/dashboard');
    } else if (error.response && error.response.status === 401) {
      alert('Debes iniciar sesión para inscribirte.');
      router.push('/login');
    } else {
      alert('Error al intentar inscribirte. Por favor, intenta nuevamente.');
    }
  } finally {
    enrolling.value = null;
  }
};
</script>

<style scoped>
.course-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>
