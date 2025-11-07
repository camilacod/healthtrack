<script setup lang="ts">
const supplements = ref<any[]>([])
const me = ref<any>(null)
const error = ref('')

async function load() {
  try {
    me.value = await $fetch('/api/auth/me')
    supplements.value = (await $fetch('/api/supplements')) as any[]
  } catch (e: any) {
    error.value = e?.data?.message || 'Error cargando datos'
  }
}

async function add(s: any) {
  try {
    await $fetch('/api/user/supplements', {
      method: 'POST',
      body: { supplementId: s.id, relation: 'uses' },
    })
    alert('Agregado a tus suplementos')
  } catch (e: any) {
    error.value = e?.data?.message || 'Error agregando suplemento'
  }
}

onMounted(load)
</script>

<template>
  <div class="stack" style="padding: 2rem; max-width: 1000px; margin: 0 auto">
    <header class="row" style="justify-content: space-between; align-items: center">
      <h1 class="title">Tu Panel</h1>
      <NuxtLink to="/" class="link">Inicio</NuxtLink>
    </header>

    <div class="card">
      <p v-if="me">Hola, <strong>{{ me.user?.username || me.user?.email }}</strong></p>
      <div class="row">
        <NuxtLink v-if="me?.isAdmin" class="btn" to="/admin">Ir a Admin</NuxtLink>
        <form @submit.prevent="() => {}">
          <button class="btn secondary" @click.prevent="$fetch('/api/auth/logout', { method: 'POST' }).then(() => navigateTo('/'))">Salir</button>
        </form>
      </div>
    </div>

    <section class="card stack">
      <h2 class="title">Suplementos disponibles</h2>
      <p v-if="!supplements.length">No hay suplementos cargados aún.</p>
      <table v-else>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Marca</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in supplements" :key="s.id">
            <td>{{ s.name }}</td>
            <td>{{ s.brand }}</td>
            <td><button class="btn" @click="add(s)">Agregar</button></td>
          </tr>
        </tbody>
      </table>
    </section>

    <p v-if="error" style="color: #b00020">{{ error }}</p>
  </div>
</template>

