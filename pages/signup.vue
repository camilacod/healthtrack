<script setup lang="ts">
const form = reactive({ email: '', username: '', password: '' })
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await $fetch('/api/auth/signup', { method: 'POST', body: form })
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message || 'Error al crear cuenta'
  }
}
</script>

<template>
  <div style="min-height: 100dvh; display: grid; place-items: center">
    <div class="card stack" style="min-width: 320px; max-width: 460px">
      <h1 class="title">Crear cuenta</h1>
      <input class="input" v-model="form.email" placeholder="Email" />
      <input class="input" v-model="form.username" placeholder="Nombre de usuario (opcional)" />
      <input class="input" v-model="form.password" type="password" placeholder="Contraseña (min 8)" />
      <button class="btn" @click="submit">Crear</button>
      <p v-if="error" style="color: #b00020">{{ error }}</p>
      <NuxtLink class="link" to="/login">¿Ya tienes cuenta? Inicia sesión</NuxtLink>
    </div>
  </div>
</template>

