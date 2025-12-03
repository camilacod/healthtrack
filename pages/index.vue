<template>
  <div class="landing-page">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container nav-container">
        <div class="logo">
          <img src="/images/logo.png" alt="HealthTrack Logo" class="logo-img" />
        </div>
        <div class="nav-links">
          <a href="#features">Features</a>
          <a href="#stacks">Stacks</a>
          <a href="#resources">Resources</a>
        </div>
        <div class="nav-actions">
          <NuxtLink to="/login" class="btn-login">Login</NuxtLink>
          <NuxtLink to="/signup" class="btn-signup">Sign Up</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Your Smart<br><span class="highlight">Supplement Tracker</span></h1>
          <p class="hero-sub">Analyze, organize, and optimize your health.</p>
          <div class="hero-buttons">
            <!-- Reuse nav buttons styled slightly differently or generic call to actions -->
          </div>
        </div>
        <div class="hero-image">
          <img src="/images/start.png" alt="HealthTrack App View" class="phone-img" />
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Supplement Tracking Made Easy</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon-box">📷</div>
            <h3>Product Photo</h3>
            <img src="/images/feature1.png" alt="Product Photo Scan" class="feature-phone-img" />
          </div>
         
          <div class="feature-card">
            <div class="icon-box">🔍</div>
            <h3>Search Database</h3>
            <div class="phone-mini"></div>
          </div>
        
        </div>
      </div>
    </section>

    <!-- Stack Builder Section -->
    <section id="stacks" class="stacks-section">
      <div class="container stacks-container">
        <div class="stacks-info">
          <h2>Supplement Stack Builder</h2>
          <p>Group your supplements into "stacks" based on goals and unlock deep insights into what you put in your body. Coming soon: get your StackScore™ analysis.</p>
          <ul class="check-list">
            <li>✅ General Wellness</li>
            <li>✅ Longevity & Healthy Aging</li>
            <li>✅ Sleep Optimization</li>
            <li>✅ Mental Focus & Cognitive Improvement</li>
            <li>✅ Athletic Performance & Recovery</li>
            <li>✅ Stress Management & Adaptation</li>
            <li>✅ Weight Management</li>
          </ul>
        </div>
        <div class="stacks-image">
          <div class="phone-mockup right">
             <div class="mockup-screen">
               <div class="stack-item">🌞 General Wellness</div>
               <div class="stack-item">⚡ Focus</div>
               <div class="stack-item">💤 Sleep</div>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="resources" class="faq-section">
      <div class="container">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary>How does HealthTrack work?</summary>
            <p>HealthTrack uses artificial intelligence to analyze your supplements and help you optimize your daily regimen.</p>
          </details>
          <details class="faq-item">
            <summary>Is it free or do I need a subscription?</summary>
            <p>We offer a free plan with basic features and a premium plan for advanced analytics.</p>
          </details>
          <details class="faq-item">
            <summary>How do I create my Stacks?</summary>
            <p>You can create stacks manually or let our AI suggest combinations based on your goals.</p>
          </details>
          <details class="faq-item">
            <summary>Is my information safe?</summary>
            <p>Yes, your data is encrypted and protected with the highest security standards.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-links">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
          <NuxtLink to="/admin/login" class="admin-link">Admin</NuxtLink>
        </div>
        <div class="social-links">
          <!-- Placeholders for icons -->
          <!-- <span>FB</span> <span>X</span> <span>IG</span> -->
        </div>
        <div class="app-badges">
          <!-- <button class="btn-store">App Store</button> -->
          <!-- <button class="btn-store">Google Play</button> -->
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Variables are now global in assets/css/theme.css */
.landing-page {
  /* Using global variables */
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  background-color: var(--bg-cream);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Navbar */
.navbar {
  padding: 1.5rem 0;
  background: transparent;
}
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 0.5rem;
  margin-left: -29px; /* Pulls logo slightly to the left */
}

@media (max-width: 768px) {
  .logo {
    margin-left: 0;
    font-size: 1.2rem;
  }
  .nav-actions {
    gap: 0.5rem;
  }
  .btn-login, .btn-signup {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }
  .phone-img {
    max-width: 100%;
    height: auto;
  }
}
.nav-links {
  display: none;
}
@media (min-width: 768px) {
  .nav-links {
    display: flex;
    gap: 2rem;
  }
}
.nav-links a {
  text-decoration: none;
  color: var(--primary);
  font-weight: 500;
}
.nav-actions {
  display: flex;
  gap: 1rem;
}
.btn-login, .btn-signup {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
}
.btn-login {
  background: var(--primary);
  color: white;
}
.btn-signup {
  background: var(--secondary);
  color: white;
}

/* Hero */
.hero {
  padding: 4rem 0;
  overflow: hidden;
}
.hero-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Changed from center to flex-start */
  gap: 2rem;
}
@media (min-width: 992px) {
  .hero-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .hero-text {
    max-width: 50%;
  }
  .hero-image {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    margin-bottom: -30px;
    align-items: stretch;
    overflow: visible;
  }
}
.phone-img {
  width: auto;
  height: auto;
  max-height: 400px;
  max-width: none;
  display: block;
  object-fit: contain;
  /* Optional: Add a drop shadow if the image is just a screenshot */
  /* filter: drop-shadow(0 20px 40px rgba(0,0,0,0.15)); */
}
.hero-text h1 {
  font-size: 3rem;
  line-height: 1.0;
  color: var(--primary);
  margin-bottom: 1rem;
}
.hero-sub {
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 2rem;
}

/* Phone Mockup Generic */
.phone-mockup {
  width: 280px;
  height: 550px;
  background: #222;
  border-radius: 35px;
  padding: 10px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  position: relative;
  margin: 0 auto;
}
.mockup-screen {
  background: #fff;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.floating-pill {
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  margin: 5px;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Features */
.features {
  padding: 4rem 0;
  background: #fff;
  margin-top: -2rem; /* Pulls the white section up closer to the hero */
  position: relative;
  z-index: 10; /* Ensures it sits on top if needed, or adjust to 0 to sit behind phone */
  border-radius: 30px 30px 0 0; /* Optional: Softens the transition */
}
.section-title {
  text-align: center;
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 3rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
.feature-card {
  background: var(--bg-cream);
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon-box {
  font-size: 2rem;
  margin-bottom: 1rem;
}
.feature-card h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}
.phone-mini {
  width: 100px;
  height: 160px;
  background: #ddd;
  border-radius: 10px;
  margin-top: auto;
}

.feature-phone-img {
  width: 140px;
  height: auto;
  border-radius: 12px;
  margin-top: auto;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
}

.feature-phone-img:hover {
  transform: translateY(-5px);
}

/* Stacks */
.stacks-section {
  padding: 4rem 0;
}
.stacks-container {
  display: grid;
  gap: 3rem;
}
@media (min-width: 992px) {
  .stacks-container {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }
}
.stacks-info h2 {
  font-size: 2.5rem;
  color: var(--primary);
  line-height: 1.1;
  margin-bottom: 1rem;
}
.check-list {
  list-style: none;
  padding: 0;
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}
@media (min-width: 600px) {
  .check-list {
    grid-template-columns: 1fr 1fr;
  }
}
.stack-item {
  width: 80%;
  padding: 10px;
  background: #f0f0f0;
  margin: 5px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* FAQ */
.faq-section {
  padding: 4rem 0;
  background: #fff;
}
.faq-list {
  max-width: 800px;
  margin: 0 auto;
}
.faq-item {
  border-bottom: 1px solid #eee;
  padding: 1.5rem 0;
}
.faq-item summary {
  font-weight: 600;
  cursor: pointer;
  list-style: none;
  font-size: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.faq-item summary::after {
  content: '+';
  font-size: 1.5rem;
}
.faq-item[open] summary::after {
  content: '-';
}
.faq-item p {
  margin-top: 1rem;
  color: #666;
  line-height: 1.6;
}

/* Footer */
.footer {
  padding: 3rem 0;
  border-top: 1px solid #eee;
}
.footer-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}
@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
  }
}
.footer-links a {
  margin-right: 1.5rem;
  text-decoration: none;
  color: #666;
}
.admin-link {
  color: #999 !important;
  font-size: 0.85rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.admin-link:hover {
  opacity: 1;
}
.social-links span {
  margin: 0 0.5rem;
  cursor: pointer;
}
.btn-store {
  background: #000;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-left: 0.5rem;
  cursor: pointer;
}

.logo-img {
  height: 280px;
  width: auto;
}
</style>
