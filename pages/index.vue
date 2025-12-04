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
          <a href="#stacks">How It Works</a>
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
            <img src="/images/feature2.png" alt="Search Database" class="feature-phone-img" />
            <!-- <div class="phone-mini"></div> -->
          </div>

          <div class="feature-card">
            <div class="icon-box">🗓️</div>
            <h3>Plan Your Days</h3>
            <img src="/images/feature3.png" alt="Plan Your Days" class="feature-phone-img" />
          </div>
        
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="stacks" class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">Your Journey to Better Health</h2>
        <p class="section-subtitle">From bottle to habit in four simple steps</p>
        
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-icon">📸</div>
            <h3>Snap & Recognize</h3>
            <p>Point your camera at any supplement bottle. Our AI instantly identifies the product and extracts all the details.</p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-icon">✨</div>
            <h3>Request & Expand</h3>
            <p>Don't see your supplement? Submit it for review. Help build the largest community-driven supplement database.</p>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-icon">⚙️</div>
            <h3>Configure & Schedule</h3>
            <p>Set your perfect routine. Choose days, times, and reminders. Morning multivitamin? Evening magnesium? You decide.</p>
          </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <div class="step-icon">📊</div>
            <h3>Track & Thrive</h3>
            <p>Check off your daily doses. Watch your streak grow. Stay consistent and see your progress over time.</p>
          </div>
        </div>

        <div class="cta-banner">
          <div class="cta-content">
            <span class="cta-emoji">💊</span>
            <div class="cta-text">
              <h3>Your supplements deserve better than a forgotten bottle in the cabinet.</h3>
              <p>Start tracking today. Stay consistent. Feel the difference.</p>
            </div>
          </div>
          <NuxtLink to="/signup" class="btn-cta">Get Started Free</NuxtLink>
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
/* ... */

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
  .nav-container {
    flex-direction: column;
    gap: 0.02rem; /* Reduced gap */
  }
  .nav-actions {
    justify-content: center;
    gap: 1rem;
  }
  
  .logo-img {
    height: 80px; /* Reduced size specifically for mobile */
  }

  .hero-content {
    align-items: center;
    text-align: center;
  }
  .hero-text {
    text-align: center;
    width: 100%;
  }
  .hero-image {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .phone-img {
    max-width: 80%; /* Ensure it doesn't touch edges */
    height: auto;
    max-height: 250px; 
    margin: 0 auto;
    object-fit: contain;
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
  height: 280px; /* Fixed height to match content */
  object-fit: cover; /* Ensures image fills the height without distortion */
  border-radius: 12px;
  margin-top: auto;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
}

.feature-phone-img:hover {
  transform: translateY(-5px);
}

/* How It Works */
.how-it-works-section {
  padding: 5rem 0;
}

.section-subtitle {
  text-align: center;
  color: var(--text-sub);
  font-size: 1.15rem;
  margin-top: -2rem;
  margin-bottom: 3rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.step-card {
  background: white;
  padding: 2rem 1.5rem;
  border-radius: 20px;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.step-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.step-number {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: var(--secondary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.step-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.step-card h3 {
  font-size: 1.2rem;
  color: var(--primary);
  margin-bottom: 0.75rem;
}

.step-card p {
  color: var(--text-sub);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

/* CTA Banner */
.cta-banner {
  background: linear-gradient(135deg, var(--primary) 0%, #1a3a5c 100%);
  border-radius: 24px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .cta-banner {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
    padding: 2.5rem 3rem;
  }
}

.cta-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

@media (min-width: 768px) {
  .cta-content {
    justify-content: flex-start;
  }
}

.cta-emoji {
  font-size: 3rem;
  flex-shrink: 0;
}

.cta-text h3 {
  color: white;
  font-size: 1.3rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.cta-text p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.btn-cta {
  background: var(--secondary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
