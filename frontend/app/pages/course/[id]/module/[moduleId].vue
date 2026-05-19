<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/dashboard">
        <img src="/logo-unicordoba.png" alt="Logo Universidad de Córdoba" class="header-logo" />
      </NuxtLink>
      <div class="header-title text-xl font-medium">Contenido del Módulo</div>
    </header>

    <main class="main-content container mt-4 mb-8 flex-grow">
      <div class="mb-6">
        <NuxtLink to="/dashboard" class="btn-secondary">&larr; Volver al Panel</NuxtLink>
      </div>

      <div class="panel p-6">
        <!-- Guest Warning -->
        <div v-if="userRole === 'guest'" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p class="text-yellow-700 font-bold">Modo Invitado</p>
          <p class="text-sm text-yellow-600">Estás viendo este contenido como invitado. Tu progreso no será guardado.</p>
        </div>

        <header class="mb-8 border-b pb-4">
          <h1 class="text-3xl font-bold">{{ moduleData.title }}</h1>
          <p class="text-secondary mt-2">{{ moduleData.description }}</p>
        </header>

        <!-- Fase 1: Lectura -->
        <div v-if="activePhase === 'reading'">
          <!-- Renderizado de Contenidos -->
          <div class="content-list flex-col gap-6 w-full max-w-full overflow-hidden">
            <div v-for="(content, index) in moduleData.contents" :key="index" class="content-item mb-8 overflow-hidden w-full">
              
              <h2 class="text-2xl font-bold mb-4">{{ content.title }}</h2>
              
              <!-- Texto -->
              <div v-if="content.type === 'text'" class="text-content">
                <p class="whitespace-pre-wrap break-all w-full">{{ content.text }}</p>
              </div>
              
              <!-- Imagen -->
              <div v-else-if="content.type === 'image'" class="media-content">
                <img :src="content.imageUrl" :alt="content.title" class="rounded-lg shadow-lg max-w-full mx-auto" />
              </div>
              
              <!-- Video -->
              <div v-else-if="content.type === 'video'" class="media-content">
                <video controls class="rounded-lg shadow-lg max-w-full w-full">
                  <source :src="content.videoUrl" type="video/mp4" />
                  Tu navegador no soporta el reproductor de video.
                </video>
              </div>

            </div>
          </div>
          
          <div class="mt-12 pt-8 border-t text-center">
            <button class="btn-primary py-3 px-8 text-lg" @click="startEvaluation" v-if="moduleData.activities && moduleData.activities.length > 0">
              Siguiente: Resolver Actividad
            </button>
            <p v-else class="text-secondary italic">No hay actividades configuradas para este módulo.</p>
          </div>
        </div>

        <!-- Fase 2: Evaluación -->
        <div v-else-if="activePhase === 'evaluation'">
          <h2 class="text-2xl font-bold mb-6 text-primary">Evaluación del Módulo</h2>
          <p class="mb-8 text-secondary">Lee cuidadosamente cada pregunta y selecciona la respuesta correcta.</p>

          <form @submit.prevent="submitEvaluation">
            <div v-for="(activity, index) in moduleData.activities" :key="activity._id" class="mb-8 p-6 bg-gray-50 border rounded-lg">
              <h3 class="text-lg font-bold mb-4">{{ index + 1 }}. {{ activity.question }}</h3>
              
              <div class="flex flex-col gap-3">
                <label v-for="opt in activity.options" :key="opt._id" class="flex items-center gap-3 p-3 bg-white border rounded cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="radio" :name="'question-' + activity._id" :value="opt._id" v-model="answers[activity._id]" class="w-5 h-5 cursor-pointer text-primary" required />
                  <span>{{ opt.text }}</span>
                </label>
              </div>
            </div>

            <div v-if="evalMessage" :class="['p-4 rounded-lg mb-4 font-bold text-center', isEvalError ? 'error-alert' : 'success-alert']">
              {{ evalMessage }}
            </div>

            <div class="flex justify-between items-center mt-8">
              <button type="button" class="btn-secondary" @click="activePhase = 'reading'" :disabled="isEvaluating">Volver a Lectura</button>
              <button type="submit" class="btn-primary px-8 py-3" :disabled="isEvaluating || Object.keys(answers).length < moduleData.activities.length">
                <span v-if="isEvaluating">Enviando...</span>
                <span v-else>Enviar Respuestas</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Fase 3: Feedback -->
        <div v-else-if="activePhase === 'feedback'" class="text-center py-12">
          <div class="mb-6">
            <span class="text-6xl" v-if="evalResult.percentage >= 60">🎉</span>
            <span class="text-6xl" v-else>💪</span>
          </div>
          <h2 class="text-3xl font-bold mb-4 text-primary">¡Evaluación Completada!</h2>
          <p class="text-xl mb-2">Obtuviste <strong class="text-2xl">{{ evalResult.score }}</strong> de <strong>{{ evalResult.total }}</strong> respuestas correctas.</p>
          <p class="text-2xl font-bold mb-8" :style="{ color: evalResult.percentage >= 60 ? '#16a34a' : '#ea580c' }">
            Puntuación: {{ evalResult.percentage }}%
          </p>
          
          <NuxtLink to="/dashboard" class="btn-primary inline-block py-3 px-8">Volver al Dashboard</NuxtLink>
        </div>
      </div>
      <!-- Modal de Logro -->
      <div v-if="showAchievementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-105">
          <div class="text-7xl mb-4 animate-bounce">{{ unlockedAchievementData.icon }}</div>
          <h2 class="text-2xl font-bold text-yellow-600 mb-2">¡Logro Desbloqueado!</h2>
          <h3 class="text-xl font-bold mb-4">{{ unlockedAchievementData.title }}</h3>
          <p class="text-secondary mb-8">{{ unlockedAchievementData.description }}</p>
          <button @click="closeAchievementModal" class="btn-primary w-full py-3">¡Genial!</button>
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
import { useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useCookie } from '#app';

const route = useRoute();
const api = useApi();
const courseId = route.params.id;
const moduleId = route.params.moduleId;

const userRole = ref(useCookie('user_data').value?.role || 'guest');

const activePhase = ref('reading'); // 'reading', 'evaluation', 'feedback'
const moduleData = ref({ contents: [], activities: [] });
const answers = ref({}); // { activityId: optionId }

const isEvaluating = ref(false);
const evalMessage = ref('');
const isEvalError = ref(false);
const evalResult = ref(null);

const showAchievementModal = ref(false);
const unlockedAchievementData = ref(null);

onMounted(async () => {
  try {
    const data = await api.getModuleStudy(courseId, moduleId);
    moduleData.value = data;
  } catch (error) {
    console.error('Error fetching module:', error);
  }
});

const startEvaluation = () => {
  activePhase.value = 'evaluation';
  window.scrollTo(0, 0);
};

const submitEvaluation = async () => {
  isEvaluating.value = true;
  evalMessage.value = '';
  isEvalError.value = false;

  try {
    // Transform answers dictionary to array format expected by backend
    const formattedAnswers = Object.keys(answers.value).map(activityId => ({
      activityId,
      optionId: answers.value[activityId]
    }));

    const result = await api.evaluateModule(courseId, moduleId, formattedAnswers);
    
    evalResult.value = result;
    activePhase.value = 'feedback';
    window.scrollTo(0, 0);

    // Activar modal de logro si viene en la respuesta
    if (result.achievementUnlocked) {
      unlockedAchievementData.value = result.achievementUnlocked;
      setTimeout(() => {
        showAchievementModal.value = true;
      }, 500); // Pequeño retraso para efecto sorpresa
    }
    
  } catch(error) {
    isEvalError.value = true;
    evalMessage.value = 'Ocurrió un error al enviar tus respuestas. Inténtalo de nuevo.';
  } finally {
    isEvaluating.value = false;
  }
};

const closeAchievementModal = () => {
  showAchievementModal.value = false;
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex-grow: 1;
}

.header-logo {
  max-width: 90px;
  height: auto;
}

.header-title {
  color: var(--text-primary);
}

.footer-global {
  margin-top: auto;
  padding: 15px 20px;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
  background-color: var(--surface-color);
}

.border-b { border-bottom: 1px solid var(--border-color); }
.border-t { border-top: 1px solid var(--border-color); }
.pb-4 { padding-bottom: 1rem; }
.pt-8 { padding-top: 2rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.rounded-lg { border-radius: 0.5rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.max-w-full { max-width: 100%; }
.w-full { width: 100%; }
.content-item {
  background: var(--surface-color);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.text-content p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}
</style>
