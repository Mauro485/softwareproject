<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/">
        <img src="/logo-git.png" alt="Git Logo" class="header-logo" style="max-height: 50px; width: auto;" />
      </NuxtLink>
      <div class="header-title text-xl font-medium">REGISTRO</div>
    </header>

    <!-- Main Content -->
    <main class="main-content flex justify-center items-center flex-grow px-4 mt-8 mb-8 w-full">
      <div class="panel w-full max-w-[500px] mx-auto" style="max-width: 500px; margin: 40px auto;">
        <form @submit.prevent="handleRegister" class="flex flex-col gap-5">

          <!-- Error/Success Alert -->
          <div v-if="message" :class="['p-3 rounded-lg text-sm text-center font-medium', isError ? 'error-alert' : 'success-alert']">
            {{ message }}
          </div>

          <!-- NOMBRES Y APELLIDOS -->
          <div class="form-group mb-1">
            <h3 class="text-sm font-bold mb-2 text-secondary tracking-wide uppercase">Nombre Completo</h3>
            <div style="display: flex; gap: 15px; width: 100%;">
              <input 
                type="text" 
                v-model="form.firstName"
                class="input-form" style="flex: 1;"
                placeholder="NOMBRES"
              />
              <input 
                type="text" 
                v-model="form.lastName"
                class="input-form" style="flex: 1;"
                placeholder="APELLIDOS"
              />
            </div>
          </div>

          <!-- EMAIL -->
          <div class="form-group mb-1">
            <h3 class="text-sm font-bold mb-2 text-secondary tracking-wide uppercase">Email</h3>
            <input 
              type="email" 
              v-model="form.email"
              class="input-form w-full" 
              placeholder="CORREO ELECTRÓNICO"
            />
          </div>

          <!-- CONTRASEÑA -->
          <div class="form-group mb-1">
            <h3 class="text-sm font-bold mb-2 text-secondary tracking-wide uppercase">Contraseña</h3>
            <input 
              type="password" 
              v-model="form.password"
              class="input-form w-full" 
              placeholder="CONTRASEÑA"
            />
          </div>

          <!-- ROL -->
          <div class="form-group mb-1">
            <h3 class="text-sm font-bold mb-2 text-secondary tracking-wide uppercase">Rol</h3>
            <div class="flex items-center gap-6 mt-2">
              <label class="flex items-center gap-2 cursor-pointer radio-label">
                <input type="radio" value="student" v-model="form.role" class="custom-radio" />
                <span>ESTUDIANTE</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer radio-label">
                <input type="radio" value="teacher" v-model="form.role" class="custom-radio" />
                <span>DOCENTE</span>
              </label>
            </div>
          </div>

          <!-- CÓDIGO DOCENTE -->
          <div class="form-group mb-1" v-if="form.role === 'teacher'">
            <h3 class="text-sm font-bold mb-2 text-secondary tracking-wide uppercase">CÓDIGO DOCENTE (SOLO SI APLICA)</h3>
            <input 
              type="text" 
              v-model="form.teacherCode"
              class="input-form w-full" 
              placeholder="CÓDIGO"
            />
          </div>

          <button 
            type="submit" 
            class="btn-primary w-full mt-4"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Registrando...</span>
            <span v-else>REGISTRARSE</span>
          </button>
          
        </form>
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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';

const api = useApi();
const router = useRouter();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'student',
  teacherCode: ''
});

const isLoading = ref(false);
const message = ref('');
const isError = ref(true);

const handleRegister = async () => {
  message.value = '';
  
  if (!form.firstName || !form.email || !form.password) {
    message.value = 'Por favor completa los campos obligatorios.';
    isError.value = true;
    return;
  }

  if (form.role === 'teacher' && !form.teacherCode) {
    message.value = 'El código docente es requerido.';
    isError.value = true;
    return;
  }

  isLoading.value = true;
  
  try {
    const name = `${form.firstName} ${form.lastName}`.trim();
    await api.register({
      name,
      email: form.email,
      password: form.password,
      role: form.role,
      teacherCode: form.teacherCode
    });
    
    isError.value = false;
    message.value = '¡Registro exitoso! Redirigiendo al login...';
    
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    isError.value = true;
    if (error.response && error.response.status === 400) {
      message.value = error.response._data?.message || 'Verifica los datos e inténtalo de nuevo.';
    } else if (error.response && error.response.status === 403) {
      message.value = error.response._data?.message || 'Código de docente inválido.';
    } else {
      message.value = 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.radio-label {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}

.custom-radio {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-color);
}
</style>

