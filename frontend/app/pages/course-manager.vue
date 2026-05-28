<template>
  <div class="page-container">
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/dashboard">
        <img src="/logo-git.png" alt="Git Logo" class="header-logo" style="max-height: 50px; width: auto;" />
      </NuxtLink>
      <div class="header-title text-xl font-medium">Gestor de Contenidos</div>
    </header>

    <main class="main-content flex flex-col flex-grow px-4 mt-8 mb-8 w-full">
      <div class="mb-6 max-w-[600px] mx-auto w-full">
        <NuxtLink to="/dashboard" class="btn-secondary">&larr; Volver al Panel</NuxtLink>
      </div>

      <!-- Formulario 1: Crear / Editar Curso -->
      <div class="panel w-full max-w-[600px] mx-auto mb-8" style="max-width: 600px; margin: 0 auto 32px auto;">
        <h2 class="text-2xl font-bold mb-6">
          {{ isEditMode ? '1. Editar Unidad de Aprendizaje' : '1. Crear Nueva Unidad de Aprendizaje' }}
        </h2>
        
        <form @submit.prevent="handleSaveCourse" class="flex flex-col gap-5">
          <div v-if="courseMessage" :class="['p-3 rounded-lg text-sm text-center font-medium', isCourseError ? 'error-alert' : 'success-alert']">
            {{ courseMessage }}
          </div>

          <div class="form-group mb-2">
            <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Nombre de la Unidad</h3>
            <input type="text" v-model="course.name" class="input-form w-full" placeholder="Ej. Unidad: Comandos Base de Git" :disabled="courseCreated && !isEditMode" />
          </div>

          <div class="form-group mb-2">
            <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Descripción</h3>
            <textarea v-model="course.description" class="input-form w-full" rows="3" placeholder="Breve descripción de la unidad" :disabled="courseCreated && !isEditMode"></textarea>
          </div>

          <button type="submit" class="btn-primary w-full mt-2" :disabled="isCourseLoading || (courseCreated && !isEditMode)">
            <span v-if="isCourseLoading">Guardando...</span>
            <span v-else-if="courseCreated && !isEditMode">Unidad Creada (ID: {{ createdCourseId }})</span>
            <span v-else>{{ isEditMode ? 'Actualizar Unidad' : 'Guardar Unidad de Aprendizaje' }}</span>
          </button>
        </form>
      </div>

      <!-- Sección de Módulos -->
      <div v-if="courseCreated" class="panel w-full max-w-[600px] mx-auto mb-8 p-6" style="max-width: 600px;">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Módulos de la Unidad</h2>
          <button @click="startNewModule" class="btn-primary text-xs">+ Añadir Módulo</button>
        </div>

        <div v-if="existingModules.length === 0" class="text-center text-secondary py-4">
          No hay módulos creados todavía.
        </div>
        
        <div v-else class="flex flex-col gap-2 mb-6">
          <div v-for="m in existingModules" :key="m._id" class="flex justify-between items-center p-3 border border-[#30363d] bg-[#0d1117] rounded-md">
            <div>
              <span class="font-bold text-[#ff6600]">Módulo {{ m.order }}:</span> <span class="font-medium text-white">{{ m.title }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="loadModuleForEdit(m)" class="px-3 py-1 bg-[#30363d] text-white rounded text-xs font-bold hover:bg-[#ff6600]">Editar</button>
              <button @click="handleDeleteModule(m._id)" class="px-3 py-1 bg-red-900/30 text-red-500 rounded text-xs font-bold border border-red-900/50 hover:bg-red-600 hover:text-white">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor de Módulo / Evaluación -->
      <div v-if="isEditingModule" class="panel w-full max-w-[600px] mx-auto p-0 overflow-hidden" style="max-width: 600px; margin: 0 auto;">
        
        <!-- Tab Navigation -->
        <div class="flex border-b border-surface-border" style="background-color: var(--surface-color);">
          <button 
            @click="activeTab = 'material'" 
            :class="['flex-1 px-6 py-4 font-bold text-sm uppercase transition-colors', activeTab === 'material' ? 'text-primary' : 'text-secondary']"
            :style="activeTab === 'material' ? 'background-color: transparent; border-bottom: 2px solid var(--primary-color);' : ''"
          >
            Material de Estudio
          </button>
          <button 
            @click="activeTab = 'evaluation'" 
            :disabled="!createdModuleId"
            :class="['flex-1 px-6 py-4 font-bold text-sm uppercase transition-colors', activeTab === 'evaluation' ? 'text-primary' : 'text-secondary', !createdModuleId ? 'opacity-50 cursor-not-allowed' : '']"
            :style="activeTab === 'evaluation' ? 'background-color: transparent; border-bottom: 2px solid var(--primary-color);' : ''"
          >
            Evaluación
          </button>
        </div>

        <!-- Tab 1: Formulario Módulo -->
        <div v-show="activeTab === 'material'" class="p-8" style="background-color: transparent;">
          <h2 class="text-2xl font-bold mb-6">{{ isEditModuleMode ? 'Editar Módulo' : 'Agregar Módulo' }}</h2>
          
          <form @submit.prevent="handleSaveModule" class="flex flex-col gap-5">
            <div v-if="moduleMessage" :class="['p-3 rounded-lg text-sm text-center font-medium', isModuleError ? 'error-alert' : 'success-alert']">
              {{ moduleMessage }}
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Título del Módulo</h3>
              <input type="text" v-model="module.title" class="input-form w-full" placeholder="Ej. Introducción a Ramas" />
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Descripción Breve</h3>
              <input type="text" v-model="module.description" class="input-form w-full" placeholder="Ej. Aprende a crear y fusionar ramas" />
            </div>
            
            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Orden (Número)</h3>
              <input type="number" v-model="module.order" class="input-form w-full" placeholder="Ej. 1" min="1" />
            </div>

            <hr class="my-4 border-[#30363d]" />
            <h3 class="text-lg font-bold mb-2">Contenido Multimedia (Opcional)</h3>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Contenido Principal (Texto)</h3>
              <textarea v-model="module.textContent" class="input-form w-full" rows="4" placeholder="Escribe la explicación teórica aquí..."></textarea>
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Imagen</h3>
              <input type="file" accept="image/*" @change="handleImageChange" class="input-form w-full bg-[#161b22] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-[#30363d] file:text-white hover:file:bg-[#ff6600] transition-colors" />
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">URL de Video (YouTube)</h3>
              <input type="text" v-model="module.youtubeUrl" class="input-form w-full" placeholder="Ej. https://www.youtube.com/watch?v=..." />
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">O Video (MP4 Subido)</h3>
              <input type="file" accept="video/mp4,video/webm" @change="handleVideoChange" class="input-form w-full bg-[#161b22] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-[#30363d] file:text-white hover:file:bg-[#ff6600] transition-colors" />
            </div>

            <button type="submit" class="btn-primary w-full mt-8" :disabled="isModuleLoading">
              <span v-if="isModuleLoading">Guardando...</span>
              <span v-else>{{ isEditModuleMode ? 'Actualizar Material' : 'Guardar Material de Estudio' }}</span>
            </button>
          </form>
        </div>

        <!-- Tab 2: Evaluación -->
        <div v-show="activeTab === 'evaluation'" class="p-8" style="background-color: transparent;">
          <h2 class="text-2xl font-bold mb-6">Agregar Pregunta de Evaluación</h2>
          
          <form @submit.prevent="handleCreateActivity" class="flex flex-col gap-5">
            <div v-if="activityMessage" :class="['p-3 rounded-lg text-sm text-center font-medium', isActivityError ? 'error-alert' : 'success-alert']">
              {{ activityMessage }}
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Tipo de Actividad</h3>
              <select v-model="activity.type" class="input-form w-full bg-surface-color">
                <option value="multiple_choice">Opción Múltiple</option>
                <option value="drag_drop">Arrastrar y Soltar</option>
                <option value="simulator">Simulador Git</option>
              </select>
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Instrucción o Enunciado</h3>
              <textarea v-model="activity.question" class="input-form w-full" rows="2" placeholder="Ej. ¿Qué comando se usa para clonar un repositorio?"></textarea>
            </div>

            <div class="form-group mb-2">
              <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Nivel de Dificultad</h3>
              <select v-model="activity.difficulty" class="input-form w-full bg-surface-color">
                <option value="básico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <!-- Múltiple Opción -->
            <div v-if="activity.type === 'multiple_choice'">
              <hr class="my-2 border-[#30363d]" />
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-bold">Opciones de Respuesta</h3>
                <button type="button" @click="addOption" v-if="activity.options.length < 4" class="text-sm font-bold hover:underline" style="color: var(--primary-color)">
                  + Añadir Opción
                </button>
              </div>
              
              <p class="text-xs text-secondary mb-4">Selecciona el botón circular para marcar la respuesta correcta.</p>

              <div v-for="(opt, index) in activity.options" :key="index" class="flex items-center gap-3 mb-3">
                <input 
                  type="radio" 
                  name="correctOption" 
                  :checked="opt.isCorrect" 
                  @change="setCorrectOption(index)"
                  class="w-5 h-5 cursor-pointer accent-[#ff6600]"
                />
                <input type="text" v-model="opt.text" class="input-form flex-grow" :placeholder="'Opción ' + (index + 1)" />
                <button type="button" @click="removeOption(index)" v-if="activity.options.length > 2" class="text-red-500 font-bold hover:underline px-2">
                  X
                </button>
              </div>
            </div>

            <!-- Arrastrar y Soltar -->
            <div v-if="activity.type === 'drag_drop'">
              <hr class="my-2 border-[#30363d]" />
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-bold">Pares a Relacionar</h3>
                <button type="button" @click="addDragDropPair" v-if="activity.dragDropPairs.length < 6" class="text-sm font-bold hover:underline" style="color: var(--primary-color)">
                  + Añadir Par
                </button>
              </div>
              
              <p class="text-xs text-secondary mb-4">Ejemplo: Elemento Arrastrable = "git commit", Elemento Destino = "Guarda cambios localmente".</p>

              <div v-for="(pair, index) in activity.dragDropPairs" :key="'pair-'+index" class="flex items-center gap-3 mb-3">
                <input type="text" v-model="pair.draggable" class="input-form flex-grow" placeholder="Arrastrable (Ej: Comando)" />
                <span class="text-secondary font-bold">-></span>
                <input type="text" v-model="pair.target" class="input-form flex-grow" placeholder="Destino (Ej: Definición)" />
                <button type="button" @click="removeDragDropPair(index)" v-if="activity.dragDropPairs.length > 2" class="text-red-500 font-bold hover:underline px-2">
                  X
                </button>
              </div>
            </div>

            <!-- Simulador Git -->
            <div v-if="activity.type === 'simulator'">
              <hr class="my-2 border-[#30363d]" />
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-bold">Configuración del Simulador</h3>
              </div>
              
              <div class="form-group mb-4">
                <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Objetivo de la Simulación</h3>
                <select v-model="activity.simulatorMode" class="input-form w-full bg-surface-color">
                  <option value="exact_command">Comando Específico</option>
                  <option value="create_repo">Crear Repositorio (git init)</option>
                  <option value="make_commit">Hacer un Commit (Avanzado)</option>
                </select>
                <p class="text-xs text-secondary mt-1" v-if="activity.simulatorMode === 'exact_command'">El estudiante deberá ingresar exactamente el comando que configures.</p>
                <p class="text-xs text-secondary mt-1" v-if="activity.simulatorMode === 'create_repo'">El estudiante deberá inicializar un repositorio vacío.</p>
                <p class="text-xs text-secondary mt-1" v-if="activity.simulatorMode === 'make_commit'">El estudiante deberá completar un ciclo de commit.</p>
              </div>

              <div class="form-group mb-2" v-if="activity.simulatorMode === 'exact_command'">
                <h3 class="text-sm font-bold mb-2 text-secondary uppercase">Comando Esperado</h3>
                <input type="text" v-model="activity.simulatorExpectedCommand" class="input-form w-full" placeholder="Ej. git push" />
              </div>
            </div>

            <button type="submit" class="btn-primary w-full mt-8" :disabled="isActivityLoading">
              <span v-if="isActivityLoading">Guardando...</span>
              <span v-else>Guardar Pregunta</span>
            </button>
          </form>
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
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { useCookie } from '#app';

const api = useApi();
const router = useRouter();
const route = useRoute();

const isEditMode = ref(false);

// Variables de Estado - Curso
const course = ref({ name: '', description: '' });
const isCourseLoading = ref(false);
const courseCreated = ref(false);
const createdCourseId = ref(null);
const courseMessage = ref('');
const isCourseError = ref(false);

// Variables de Estado - Módulos
const existingModules = ref([]);
const isEditingModule = ref(false);
const isEditModuleMode = ref(false);
const createdModuleId = ref(null);
const activeTab = ref('material');

// Variables Formulario Módulo
const module = ref({ title: '', description: '', order: 1, textContent: '' });
const isModuleLoading = ref(false);
const moduleMessage = ref('');
const isModuleError = ref(false);

const selectedImage = ref(null);
const selectedVideo = ref(null);

const handleImageChange = (event) => {
  selectedImage.value = event.target.files[0];
};

const handleVideoChange = (event) => {
  selectedVideo.value = event.target.files[0];
};

// Variables Formulario Evaluación
const activity = ref({
  type: 'multiple_choice',
  question: '',
  difficulty: 'básico',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
  ],
  dragDropPairs: [
    { draggable: '', target: '' },
    { draggable: '', target: '' }
  ],
  simulatorMode: 'exact_command',
  simulatorExpectedCommand: ''
});
const isActivityLoading = ref(false);
const activityMessage = ref('');
const isActivityError = ref(false);

const addOption = () => {
  if (activity.value.options.length < 4) {
    activity.value.options.push({ text: '', isCorrect: false });
  }
};

const removeOption = (index) => {
  if (activity.value.options.length > 2) {
    if (activity.value.options[index].isCorrect) {
       activity.value.options[0].isCorrect = true;
    }
    activity.value.options.splice(index, 1);
  }
};

const setCorrectOption = (index) => {
  activity.value.options.forEach((opt, i) => {
    opt.isCorrect = i === index;
  });
};

const addDragDropPair = () => {
  if (activity.value.dragDropPairs.length < 6) {
    activity.value.dragDropPairs.push({ draggable: '', target: '' });
  }
};

const removeDragDropPair = (index) => {
  if (activity.value.dragDropPairs.length > 2) {
    activity.value.dragDropPairs.splice(index, 1);
  }
};

const loadCourseData = async (id) => {
  try {
    const data = await api.apiFetch(`/courses/${id}`);
    if (data) {
      course.value.name = data.name;
      course.value.description = data.description;
      createdCourseId.value = data._id;
      courseCreated.value = true;
      existingModules.value = data.modules || [];
      isEditMode.value = true;
    }
  } catch(e) {
    console.error(e);
    alert('Error cargando los datos de la unidad');
  }
};

onMounted(() => {
  const token = useCookie('auth_token').value;
  const userData = useCookie('user_data').value;
  
  if (!token || !userData || userData.role !== 'teacher') {
    alert('Acceso denegado. Esta área es exclusiva para docentes.');
    router.push('/dashboard');
    return;
  }

  if (route.query.edit) {
    loadCourseData(route.query.edit);
  }
});

const handleSaveCourse = async () => {
  courseMessage.value = '';
  isCourseError.value = false;

  if (!course.value.name || !course.value.description) {
    isCourseError.value = true;
    courseMessage.value = 'El nombre y la descripción son obligatorios.';
    return;
  }

  isCourseLoading.value = true;
  try {
    if (isEditMode.value) {
      await api.updateCourse(createdCourseId.value, course.value.name, course.value.description);
      courseMessage.value = 'Unidad actualizada exitosamente.';
    } else {
      const response = await api.createCourse(course.value.name, course.value.description);
      courseCreated.value = true;
      createdCourseId.value = response._id;
      courseMessage.value = 'Unidad creada exitosamente. Ahora puedes agregarle módulos.';
    }
  } catch (error) {
    isCourseError.value = true;
    courseMessage.value = 'Error al guardar la unidad.';
  } finally {
    isCourseLoading.value = false;
  }
};

const startNewModule = () => {
  isEditingModule.value = true;
  isEditModuleMode.value = false;
  createdModuleId.value = null;
  activeTab.value = 'material';
  module.value = { title: '', description: '', order: existingModules.value.length + 1, textContent: '', youtubeUrl: '' };
  moduleMessage.value = '';
};

const loadModuleForEdit = (modData) => {
  isEditingModule.value = true;
  isEditModuleMode.value = true;
  createdModuleId.value = modData._id;
  activeTab.value = 'material';
  
  let txt = '';
  let ytUrl = '';
  if (modData.contents && modData.contents.length > 0) {
    const textObj = modData.contents.find(c => c.type === 'text');
    if (textObj) txt = textObj.text;
    const ytObj = modData.contents.find(c => c.type === 'youtube');
    if (ytObj) ytUrl = ytObj.youtubeUrl;
  }

  module.value = { 
    title: modData.title, 
    description: modData.description, 
    order: modData.order, 
    textContent: txt,
    youtubeUrl: ytUrl
  };
  moduleMessage.value = '';
};

const handleSaveModule = async () => {
  moduleMessage.value = '';
  isModuleError.value = false;

  if (!module.value.title || !module.value.description || !module.value.order) {
    isModuleError.value = true;
    moduleMessage.value = 'El título, descripción y orden son obligatorios.';
    return;
  }

  isModuleLoading.value = true;
  try {
    let finalImageUrl = null;
    let finalVideoUrl = null;

    if (selectedImage.value) {
      moduleMessage.value = 'Subiendo imagen...';
      finalImageUrl = await api.uploadFile(selectedImage.value);
    }
    
    if (selectedVideo.value) {
      moduleMessage.value = 'Subiendo video...';
      finalVideoUrl = await api.uploadFile(selectedVideo.value);
    }

    moduleMessage.value = 'Guardando módulo...';

    const payload = {
      title: module.value.title,
      description: module.value.description,
      order: module.value.order,
      textContent: module.value.textContent,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      youtubeUrl: module.value.youtubeUrl
    };

    let response;
    if (isEditModuleMode.value) {
      response = await api.updateModule(createdCourseId.value, createdModuleId.value, payload);
      moduleMessage.value = 'Módulo actualizado. Puedes cambiar a la pestaña Evaluación.';
    } else {
      response = await api.createModule(createdCourseId.value, payload);
      if (response && response.module && response.module._id) {
        createdModuleId.value = response.module._id;
      }
      moduleMessage.value = 'Módulo agregado. Puedes añadir preguntas en la pestaña Evaluación.';
    }
    
    // Refresh modules
    await loadCourseData(createdCourseId.value);
    isModuleError.value = false;
    
    // Reset file inputs
    selectedImage.value = null;
    selectedVideo.value = null;
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
    
  } catch (error) {
    isModuleError.value = true;
    moduleMessage.value = 'Error al intentar guardar el módulo.';
  } finally {
    isModuleLoading.value = false;
  }
};

const handleDeleteModule = async (moduleId) => {
  if (confirm('¿Eliminar este módulo? Esta acción es irreversible.')) {
    try {
      await api.deleteModule(createdCourseId.value, moduleId);
      await loadCourseData(createdCourseId.value);
      if (createdModuleId.value === moduleId) {
        isEditingModule.value = false;
      }
      alert('Módulo eliminado.');
    } catch (e) {
      alert('Error eliminando módulo.');
    }
  }
};

const handleCreateActivity = async () => {
   activityMessage.value = '';
   isActivityError.value = false;

   if (!activity.value.question.trim()) {
     isActivityError.value = true;
     activityMessage.value = 'Completa el enunciado de la pregunta.';
     return;
   }

   if (activity.value.type === 'multiple_choice') {
     const emptyOptions = activity.value.options.some(opt => !opt.text.trim());
     if (emptyOptions) {
       isActivityError.value = true;
       activityMessage.value = 'Completa todas las opciones de respuesta.';
       return;
     }
   } else if (activity.value.type === 'drag_drop') {
     const emptyPairs = activity.value.dragDropPairs.some(pair => !pair.draggable.trim() || !pair.target.trim());
     if (emptyPairs) {
       isActivityError.value = true;
       activityMessage.value = 'Completa todos los elementos a emparejar.';
       return;
     }
   } else if (activity.value.type === 'simulator') {
     if (activity.value.simulatorMode === 'exact_command' && (!activity.value.simulatorExpectedCommand || !activity.value.simulatorExpectedCommand.trim())) {
       isActivityError.value = true;
       activityMessage.value = 'Ingresa el comando esperado para el simulador.';
       return;
     }
   }

   isActivityLoading.value = true;
   try {
     const payload = { ...activity.value };
     
     // Limpiar datos no necesarios según el tipo
     if (payload.type === 'multiple_choice') {
       payload.dragDropPairs = [];
       payload.simulatorExpectedCommand = '';
     } else if (payload.type === 'drag_drop') {
       payload.options = [];
       payload.simulatorExpectedCommand = '';
     } else if (payload.type === 'simulator') {
       payload.options = [];
       payload.dragDropPairs = [];
     }

     await api.createActivity(createdCourseId.value, createdModuleId.value, payload);
     
     isActivityError.value = false;
     activityMessage.value = 'Actividad agregada con éxito.';
     
     // Reiniciar formulario
     activity.value.question = '';
     activity.value.simulatorExpectedCommand = '';
     activity.value.options.forEach(opt => opt.text = '');
     activity.value.dragDropPairs.forEach(pair => { pair.draggable = ''; pair.target = ''; });
   } catch (error) {
     isActivityError.value = true;
     activityMessage.value = 'Error al intentar guardar la actividad.';
   } finally {
     isActivityLoading.value = false;
   }
};

</script>

<style scoped>
</style>
