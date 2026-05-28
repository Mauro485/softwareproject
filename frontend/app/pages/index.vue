<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header flex justify-between items-center p-6 w-full max-w-6xl mx-auto">
      <NuxtLink to="/">
        <img src="/logo-git.png" alt="Git Logo" class="header-logo" style="max-height: 50px; width: auto;" />
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
      <div class="panel p-8 flex flex-col gap-4 w-full mx-auto" style="max-width: 320px;">
        <NuxtLink to="/login" class="btn-primary text-center">INICIAR SESIÓN</NuxtLink>
        <NuxtLink to="/register" class="btn-secondary text-center">REGISTRARSE</NuxtLink>
        <NuxtLink to="/dashboard" class="btn-secondary text-center">ENTRAR COMO INVITADO</NuxtLink>
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
// Home Component
</script>

<style scoped>
.description-box {
  background: transparent;
  border: none;
}
</style>

