<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/dashboard">
        <img src="/logo-git.png" alt="Git Logo" class="header-logo" style="max-height: 50px; width: auto;" />
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
              <div v-if="content.type === 'text'" class="text-content w-full">
                <div class="markdown-body" v-html="marked.parse(content.text)"></div>
              </div>
              
              <!-- Imagen -->
              <div v-else-if="content.type === 'image'" class="media-content">
                <img :src="content.imageUrl" :alt="content.title" class="rounded-lg shadow-lg max-w-full mx-auto" />
              </div>
              
              <!-- Video Subido -->
              <div v-else-if="content.type === 'video'" class="media-content">
                <video controls preload="metadata" class="rounded-lg shadow-lg max-w-full w-full">
                  <source :src="content.videoUrl + '#t=0.001'" type="video/mp4" />
                  Tu navegador no soporta el reproductor de video.
                </video>
              </div>

              <!-- Video YouTube -->
              <div v-else-if="content.type === 'youtube'" class="media-content youtube-container">
                <iframe 
                  class="rounded-lg shadow-lg"
                  :src="content.youtubeUrl" 
                  title="YouTube video player" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowfullscreen>
                </iframe>
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
            <div v-for="(activity, index) in moduleData.activities" :key="activity._id" class="mb-8 p-6 bg-[#161b22] border border-[#30363d] rounded-lg">
              
              <!-- Opción Múltiple -->
              <div v-if="!activity.type || activity.type === 'multiple_choice'">
                <h3 class="text-lg font-bold mb-4">{{ index + 1 }}. {{ activity.question }}</h3>
                <div class="flex flex-col gap-3">
                  <label v-for="opt in activity.options" :key="opt._id" class="flex items-center gap-3 p-3 bg-[#0d1117] border border-[#30363d] rounded cursor-pointer hover:border-[#ff6600] transition-colors">
                    <input type="radio" :name="'question-' + activity._id" :value="opt._id" v-model="answers[activity._id]" class="w-5 h-5 cursor-pointer accent-[#ff6600]" required />
                    <span class="text-white">{{ opt.text }}</span>
                  </label>
                </div>
              </div>

              <!-- Arrastrar y Soltar -->
              <div v-else-if="activity.type === 'drag_drop'">
                <h3 class="text-lg font-bold mb-4 text-[#ff6600]">Actividad {{ index + 1 }}: Arrastrar y Soltar</h3>
                <DragAndDropActivity :activity="activity" @complete="markActivityComplete(activity._id, 'drag_drop')" />
              </div>

              <!-- Simulador Git -->
              <div v-else-if="activity.type === 'simulator'">
                <h3 class="text-lg font-bold mb-4 text-[#ff6600]">Actividad {{ index + 1 }}: Simulador Git</h3>
                <GitSimulatorActivity :activity="activity" @complete="markActivityComplete(activity._id, 'simulator')" />
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
    </main>

    <!-- Footer -->
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
import { useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useCookie } from '#app';
import DragAndDropActivity from '~/components/DragAndDropActivity.vue';
import GitSimulatorActivity from '~/components/GitSimulatorActivity.vue';
import { marked } from 'marked';

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

onMounted(async () => {
  try {
    const data = await api.getModuleStudy(courseId, moduleId);
    moduleData.value = data;
    
    // Si viene por URL directo a la evaluación
    if (route.query.phase === 'evaluation') {
      activePhase.value = 'evaluation';
    }
  } catch (error) {
    console.error('Error fetching module:', error);
  }
});

const startEvaluation = () => {
  activePhase.value = 'evaluation';
  window.scrollTo(0, 0);
};

const markActivityComplete = (activityId, type) => {
  // Reasignar el objeto para forzar la reactividad en Vue y asegurar que el botón se habilite
  answers.value = {
    ...answers.value,
    [activityId]: `completed_${type}`
  };
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
    
  } catch(error) {
    isEvalError.value = true;
    evalMessage.value = 'Ocurrió un error al enviar tus respuestas. Inténtalo de nuevo.';
  } finally {
    isEvaluating.value = false;
  }
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
.text-content {
  width: 100%;
}

/* YouTube Responsive Container */
.youtube-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
  border-radius: 0.5rem;
}
.youtube-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Markdown Styles for v-html */
:deep(.markdown-body) {
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}
:deep(.markdown-body p) {
  margin-bottom: 1rem;
}
:deep(.markdown-body h1), :deep(.markdown-body h2), :deep(.markdown-body h3) {
  color: var(--text-primary);
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
:deep(.markdown-body h1) { font-size: 1.8rem; }
:deep(.markdown-body h2) { font-size: 1.5rem; }
:deep(.markdown-body h3) { font-size: 1.25rem; }
:deep(.markdown-body ul) {
  list-style-type: disc;
  padding-left: 2rem;
  margin-bottom: 1rem;
}
:deep(.markdown-body ol) {
  list-style-type: decimal;
  padding-left: 2rem;
  margin-bottom: 1rem;
}
:deep(.markdown-body strong) {
  color: #ffffff;
  font-weight: 700;
}
:deep(.markdown-body em) {
  font-style: italic;
}
:deep(.markdown-body code) {
  background-color: #30363d;
  color: #ff6600;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}
:deep(.markdown-body pre) {
  background-color: #0d1117;
  border: 1px solid #30363d;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}
:deep(.markdown-body pre code) {
  background-color: transparent;
  padding: 0;
  color: #e6edf3;
}
:deep(.markdown-body blockquote) {
  border-left: 4px solid #ff6600;
  padding-left: 1rem;
  margin-left: 0;
  color: #8b949e;
  font-style: italic;
}
</style>
