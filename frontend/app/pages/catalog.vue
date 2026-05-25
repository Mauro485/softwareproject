<template>
  <div class="page-container">
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/dashboard">
        <img src="/logo-unicordoba.png" alt="Logo Universidad de Córdoba" class="header-logo">
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

    <footer class="footer-global w-full text-center">
      <p>Diseño y Desarrollo de Software Educativo III<br />Departamento de Informática Educativa<br />Universidad de Córdoba<br />2026</p>
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
