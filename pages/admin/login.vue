<script setup lang="ts">
const form = reactive({ email: '', password: '' })
const error = ref('')

async function submit() {
  error.value = ''
  try {
    const res = await $fetch('/api/auth/login', { method: 'POST', body: form })
    if (res?.isAdmin) {
      navigateTo('/admin')
    } else {
      error.value = 'You do not have administrator permissions'
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Login failed'
  }
}
</script>

<template>
  <div class="admin-login-container">
    <div class="login-layout">
      <div class="logo-container">
        <img src="/images/logo.png" alt="HealthTrack Logo" class="logo-img" />
      </div>
      
      <div class="divider"></div>

      <div class="card stack">
        <h1 class="title">Admin Panel</h1>
        
        <div class="input-group">
          <label>Email</label>
          <input class="input" v-model="form.email" placeholder="name@example.com" />
        </div>
        
        <div class="input-group">
          <label>Password</label>
          <input class="input" v-model="form.password" type="password" placeholder="Enter your password" />
        </div>

        <button class="btn btn-secondary" @click="submit">Enter</button>
        
        <p v-if="error" class="error-msg">{{ error }}</p>
        
        <div class="back-link">
           <NuxtLink to="/login">Back to User Login</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-cream);
  padding: 1rem;
}

.login-layout {
  display: flex;
  flex-direction: row; /* Side-by-side by default */
  align-items: center;
  gap: 4rem; /* Space between logo and card */
  width: 100%;
  max-width: 900px;
  justify-content: center;
}

@media (max-width: 768px) {
  .login-layout {
    flex-direction: column;
    gap: 2rem;
  }
}

.divider {
  width: 1px;
  background-color: rgba(0,0,0,0.1);
  height: 400px; /* Matches approx card height */
  margin: 0 2rem;
}

@media (max-width: 768px) {
  .divider {
    display: none; /* Hide on mobile */
  }
}

.card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 400px;
  height: 100%; /* Ensure full height usage if container allows */
  display: flex; /* To justify content if needed */
  flex-direction: column;
  justify-content: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  flex: 1;
  max-width: 300px; /* Limit width on desktop */
}

.logo-img {
  height: auto;
  width: 100%;
  max-width: 280px; /* Reasonable max size */
  max-height: 280px;
  object-fit: contain;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 1px;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding-top: 0; 
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem; /* Tighter label-input gap */
}

.input-group label {
  font-weight: 600;
  color: var(--text-main);
  font-size: 0.9rem;
}

.input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.1);
}

.btn-primary {
  background: var(--primary); /* Using primary color for admin to distinguish slightly or match brand */
  color: white;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  width: 100%;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--secondary);
  color: white;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  width: 100%;
}

.error-msg {
  color: #b00020;
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.back-link {
  text-align: center;
  margin-top: 1rem;
}

.back-link a {
  color: var(--text-sub);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link a:hover {
  color: var(--primary);
}
</style>
