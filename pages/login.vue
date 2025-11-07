<script setup lang="ts">
const form = reactive({ email: '', password: '' })
const error = ref('')

async function submit() {
  error.value = ''
  try {
    const res = await $fetch('/api/auth/login', { method: 'POST', body: form })
    // fetch session to decide where to go
    const me = await $fetch('/api/auth/me')
    if (me?.isAdmin) navigateTo('/admin')
    else navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e?.data?.message || 'Error al iniciar sesión'
  }
}
</script>

<template>
  <div style="min-height: 100dvh; display: grid; place-items: center">
    <div class="card stack" style="min-width: 320px; max-width: 420px">
      <h1 class="title">Iniciar sesión</h1>
      <input class="input" v-model="form.email" placeholder="Email" />
      <input class="input" v-model="form.password" type="password" placeholder="Contraseña" />
      <button class="btn" @click="submit">Entrar</button>
      <p v-if="error" style="color: #b00020">{{ error }}</p>
      <NuxtLink class="link" to="/signup">¿No tienes cuenta? Crear cuenta</NuxtLink>
    </div>
  </div>
</template>

