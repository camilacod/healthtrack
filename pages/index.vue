<template>
  <div style="min-height: 100dvh; display: grid; place-items: center; background: var(--white)">
    <div class="card" style="max-width: 720px; text-align: center">
      <h1 class="title">HealthTrack</h1>
      <p>Bienvenido. Loggea tu salud y mejora tu rendimiento.</p>
      <div class="row" style="justify-content: center; margin-top: 1rem">
        <NuxtLink class="btn" to="/login">Iniciar sesión</NuxtLink>
        <NuxtLink class="btn" to="/signup">Crear cuenta</NuxtLink>
      </div>
    </div>
  </div>
</template>
