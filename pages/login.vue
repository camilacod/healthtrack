<script setup lang="ts">
const form = reactive({ email: '', password: '' })
const error = ref('')

// Image Carousel Logic
const images = [
  '/images/stock1.jpg',
  '/images/stock2.jpg',
  '/images/stock3.webp',
  '/images/stock4.webp'
]
const currentImageIndex = ref(0)

onMounted(() => {
  setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % images.length
  }, 4000) // Change every 4 seconds
})

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
  <div class="login-container">
    <!-- Left Side: Form -->
    <div class="form-section">
      <div class="form-content">
        <h1 class="title">Log in</h1>
        <p class="subtitle">Welcome back.</p>
        
        <div class="stack">
           <!-- Email Login -->
           
           <div class="input-group">
             <label>Email</label>
             <input class="input" v-model="form.email" placeholder="name@example.com" />
           </div>

           <div class="input-group">
             <label>Password</label>
             <input class="input" v-model="form.password" type="password" placeholder="Enter your password" />
           </div>

           <button class="btn btn-primary" @click="submit">Log in</button>
           
           <p v-if="error" class="error-msg">{{ error }}</p>
           
           <p class="signup-link">
             Don't have an account? <NuxtLink to="/signup">Sign up</NuxtLink>
           </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Image Placeholder -->
    <div class="image-section">
      <div class="image-placeholder">
        <div class="carousel-container">
           <transition name="fade">
             <div 
               :key="images[currentImageIndex]"
               class="carousel-slide"
               :style="{ backgroundImage: `url(${images[currentImageIndex]})` }"
             >
               <div class="tech-overlay"></div>
             </div>
           </transition>
           
           <div class="tech-accent-corner top-left"></div>
           <div class="tech-accent-corner bottom-right"></div>
           
           <div class="carousel-content">
             <!-- <h2 class="tech-title">OPTIMIZA TU <span class="highlight">BIOLOGÍA</span></h2> -->
             <!-- <p class="tech-subtitle">Seguimiento avanzado para el humano moderno.</p> -->
             
             <div class="tech-indicators">
               <span 
                 v-for="(img, index) in images" 
                 :key="index" 
                 class="indicator"
                 :class="{ active: currentImageIndex === index }"
                 @click="currentImageIndex = index"
               ></span>
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ... previous styles ... */

.login-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-cream);
}

.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  z-index: 2; /* Ensure form is above any overflow */
}


.form-content {
  width: 100%;
  max-width: 400px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.logo-img {
  height: 80px;
  width: auto;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: var(--text-sub);
  margin-bottom: 2rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  background: var(--secondary);
  color: var(--white);
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

.error-msg {
  color: #b00020;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-sub);
  font-size: 0.9rem;
}

.signup-link a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}


.image-section {
  display: none;
  flex: 1.2; /* Give image slightly more space */
  background: #0F172A; /* Dark navy base */
  padding: 0;
  position: relative;
  overflow: hidden;
}

@media (min-width: 900px) {
  .image-section {
    display: flex;
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 0; /* Remove radius for full bleed or keep if desired, removing for tech look */
  position: relative;
  overflow: hidden;
}

.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: grayscale(40%) contrast(120%); /* Edgy look */
}

.tech-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.8) 100%);
  background-size: 4px 4px;
  /* Scanline effect */
  background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  background-size: 100% 2px, 3px 100%;
}

.carousel-content {
  position: absolute;
  bottom: 10%;
  left: 10%;
  z-index: 10;
  color: white;
  max-width: 80%;
}

.tech-title {
  font-family: 'Courier New', monospace; /* Monospace for tech feel */
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.tech-title .highlight {
  color: var(--secondary);
  text-shadow: 0 0 10px var(--secondary);
}

.tech-subtitle {
  font-family: sans-serif;
  font-size: 1.1rem;
  opacity: 0.8;
  letter-spacing: 1px;
  margin-bottom: 2rem;
  border-left: 3px solid var(--secondary);
  padding-left: 1rem;
}

.tech-indicators {
  display: flex;
  gap: 10px;
}

.indicator {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--secondary);
  box-shadow: 0 0 8px var(--secondary);
}

/* Tech Accents */
.tech-accent-corner {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid transparent;
  z-index: 5;
}

.tech-accent-corner.top-left {
  top: 2rem;
  left: 2rem;
  border-top: 2px solid var(--secondary);
  border-left: 2px solid var(--secondary);
}

.tech-accent-corner.bottom-right {
  bottom: 2rem;
  right: 2rem;
  border-bottom: 2px solid var(--secondary);
  border-right: 2px solid var(--secondary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>

