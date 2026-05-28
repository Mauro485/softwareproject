<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/">
        <img src="/logo-git.png" alt="Git Logo" class="header-logo" style="max-height: 50px; width: auto;" />
      </NuxtLink>
      <div class="header-title text-xl font-medium">INICIAR SESIÓN</div>
    </header>

    <!-- Main Content -->
    <main class="main-content flex justify-center items-center flex-grow px-4 mt-8">
      <div class="panel login-card p-10">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
          
          <!-- Error Alert -->
          <div v-if="errorMessage" class="error-alert p-3 rounded-lg text-sm text-center">
            {{ errorMessage }}
          </div>

          <div class="form-group flex flex-col">
            <input 
              type="email" 
              id="email" 
              v-model="email"
              class="input-form" 
              placeholder="CORREO ELECTRÓNICO"
            />
          </div>

          <div class="form-group flex flex-col">
            <input 
              type="password" 
              id="password" 
              v-model="password"
              class="input-form" 
              placeholder="CONTRASEÑA"
            />
          </div>

          <button 
            type="submit" 
            class="btn-primary w-full mt-2"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Cargando...</span>
            <span v-else>INGRESAR</span>
          </button>
          
          <div class="links text-center flex flex-col gap-3 mt-4 text-sm">
            <a href="#" class="text-primary hover:underline">¿OLVIDASTE TU CONTRASEÑA?</a>
            <div class="mt-2">
              <span class="text-secondary">¿NO TIENES CUENTA? </span><br />
              <NuxtLink to="/register" class="font-bold text-primary hover:underline text-base mt-1 inline-block">REGISTRARSE</NuxtLink>
            </div>
          </div>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const api = useApi();
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Complete los campos para iniciar sesión';
    return;
  }

  isLoading.value = true;

  try {
    await api.login(email.value, password.value);
    router.push('/dashboard');
  } catch (error) {
    if (error.response && error.response._data && error.response._data.message) {
      errorMessage.value = error.response._data.message;
    } else {
      errorMessage.value = 'Error de conexión con el servidor.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 340px;
}

.text-primary {
  color: var(--primary-color);
}
.hover\:underline:hover {
  text-decoration: underline;
}
</style>

