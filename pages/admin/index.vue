<script setup lang="ts">
const users = ref<any[]>([])
const admins = ref<any[]>([])
const summary = ref<{ users: number; supplements: number } | null>(null)
const me = ref<any>(null)

async function refreshAll() {
  const [u, a, s] = await Promise.all([
    $fetch('/api/users'),
    $fetch('/api/admins'),
    $fetch('/api/admin/summary'),
  ])
  users.value = u as any[]
  admins.value = a as any[]
  summary.value = s as any
}

onMounted(async () => {
  try {
    me.value = await $fetch('/api/auth/me')
    if (!me.value?.isAdmin) {
      navigateTo('/admin/login')
      return
    }
    await refreshAll()
  } catch {
    navigateTo('/admin/login')
  }
})


const editing = reactive<Record<string, { email: string; username: string }>>({})
function startEdit(u: any) {
  editing[u.id] = { email: u.email, username: u.username || '' }
}

async function saveEdit(id: string) {
  const payload = editing[id]
  await $fetch(`/api/users/${id}`, { method: 'PUT', body: payload })
  delete editing[id]
  await refreshAll()
}

async function removeUser(id: string) {
  if (!confirm('Eliminar usuario?')) return
  await $fetch(`/api/users/${id}`, { method: 'DELETE' })
  await refreshAll()
}

function isAdmin(userId: string) {
  return admins.value.some((a) => a.userId === userId)
}

async function addAdmin(userId: string) {
  await $fetch('/api/admins', { method: 'POST', body: { userId } })
  await refreshAll()
}

async function removeAdmin(userId: string) {
  await $fetch(`/api/admins/${userId}`, { method: 'DELETE' })
  await refreshAll()
}

function cancelEdit(id: string) {
  delete editing[id]
}
</script>

<template>
  <div class="stack" style="padding: 2rem; max-width: 1100px; margin: 0 auto">
    <header class="row" style="justify-content: space-between; align-items: center">
      <h1 class="title">Dashboard de Admin</h1>
      <NuxtLink class="link" to="/">Volver</NuxtLink>
    </header>

    <section class="row" style="gap: 1rem">
      <div class="card" style="flex: 1">
        <div class="title">Usuarios</div>
        <div style="font-size: 2rem; font-weight: 700">{{ summary?.users ?? users.length }}</div>
      </div>
      <div class="card" style="flex: 1">
        <div class="title">Suplementos</div>
        <div style="font-size: 2rem; font-weight: 700">{{ summary?.supplements ?? 0 }}</div>
      </div>
    </section>

    <!-- Crear usuario deshabilitado: sólo los usuarios pueden crear su cuenta -->

    <section class="card stack">
      <h2 class="title">Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Username</th>
            <th>Creado</th>
            <th>Admin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td style="max-width: 220px; overflow: hidden; text-overflow: ellipsis">{{ u.id }}</td>
            <td>
              <template v-if="editing[u.id]">
                <input class="input" v-model="editing[u.id].email" />
              </template>
              <template v-else>{{ u.email }}</template>
            </td>
            <td>
              <template v-if="editing[u.id]">
                <input class="input" v-model="editing[u.id].username" />
              </template>
              <template v-else>{{ u.username }}</template>
            </td>
            <td>{{ new Date(u.createdAt).toLocaleString() }}</td>
            <td>
              <span v-if="isAdmin(u.id)" class="title">Sí</span>
              <span v-else>No</span>
            </td>
            <td class="toolbar">
              <template v-if="editing[u.id]">
                <button class="btn" @click="saveEdit(u.id)">Guardar</button>
                <button class="btn secondary" @click="cancelEdit(u.id)">Cancelar</button>
              </template>
              <template v-else>
                <button class="btn" @click="startEdit(u)">Editar</button>
                <button class="btn secondary" @click="removeUser(u.id)">Eliminar</button>
              </template>
              <template v-if="!isAdmin(u.id)">
                <button class="btn" @click="addAdmin(u.id)">Hacer Admin</button>
              </template>
              <template v-else>
                <button class="btn secondary" @click="removeAdmin(u.id)">Quitar Admin</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
