<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/">
        <img src="/logo-unicordoba.png" alt="Logo Universidad de Córdoba" class="header-logo">
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
    <footer class="footer-global w-full text-center">
      <p>Diseño y Desarrollo de Software Educativo III<br />Departamento de Informática Educativa<br />Universidad de Córdoba<br />2026</p>
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
  max-width: 420px;
}

.text-primary {
  color: var(--primary-color);
}
.hover\:underline:hover {
  text-decoration: underline;
}
</style>
