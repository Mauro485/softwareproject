<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/">
        <img src="/logo-unicordoba.png" alt="Logo Universidad de Córdoba" class="header-logo">
      </NuxtLink>
      <div class="header-title text-xl font-medium text-gradient">OVA: Introducción a Git</div>
    </header>

    <!-- Main Content -->
    <main class="main-content flex flex-col items-center mt-8 px-4 w-full max-w-5xl mx-auto flex-grow">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 text-center text-gradient">Aprende Git desde Cero</h1>
      
      <!-- Descripción Box (Empty) -->
      <div class="description-box w-full text-center py-2 px-4 mb-8">
      </div>

      <!-- Action Buttons Box -->
      <div class="panel p-8 flex flex-col gap-4 w-full max-w-md mx-auto">
        <NuxtLink to="/login" class="btn-primary text-center">INICIAR SESIÓN</NuxtLink>
        <NuxtLink to="/register" class="btn-secondary text-center">REGISTRARSE</NuxtLink>
        <NuxtLink to="/dashboard" class="btn-secondary text-center">ENTRAR COMO INVITADO</NuxtLink>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer-global w-full text-center">
      <p>Diseño y Desarrollo de Software Educativo III<br />Departamento de Informática Educativa<br />Universidad de Córdoba<br />2026</p>
    </footer>
  </div>
</template>

<script setup>
// Home Component
</script>

<style scoped>
.description-box {
  background: transparent;
  border: none;
}
</style>
