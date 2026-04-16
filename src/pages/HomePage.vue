<template>
  <div class="home">
    <section class="hero">
      <div class="container hero-inner">
        <h1 class="hero-title">{{ t('home.heroTitle') }}</h1>
        <p class="hero-subtitle">{{ t('home.heroSubtitle') }}</p>
        <div style="display: flex; gap: 16px; justify-content: center; align-items: center; margin-top: 2rem; flex-wrap: wrap;">
          <RouterLink to="/quiz" class="hero-button" style="margin-top: 0;">{{ t('home.start') }}</RouterLink>
          <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.125rem; font-weight: 700; color: #fff; background: rgba(59, 161, 124, 0.9); padding: 0.8rem 2rem; border-radius: 50px; text-decoration: none; border: 2px solid transparent; transition: all 0.2s;">
            <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            {{ t('home.starProject') }}
          </a>
        </div>
        <div class="hero-relay">
          <p class="hero-relay-title">{{ t('home.relayTitle') }}</p>
          <p class="hero-relay-copy">{{ t('home.relayCopy') }}</p>
          <button class="hero-relay-button" type="button" @click="copyQuizLink">{{ t('home.relayButton') }}</button>
          <p v-if="relayFeedback" class="hero-relay-feedback">{{ relayFeedback }}</p>
        </div>
        <p class="hero-relay-credit">
          本项目二创自
          <a href="https://acgti.tianxingleo.top" target="_blank" rel="noopener noreferrer"> ACGTI </a>
          欢迎大家访问
        </p>
      </div>

      <div class="hero-wave"></div>

      <div class="hero-scene" aria-hidden="true">
        <div class="tree tree-1"></div>
        <div class="tree tree-2"></div>
        <div class="tree tree-3"></div>
        <div class="stone stone-1"></div>
        <div class="stone stone-2"></div>
        <div class="person person-1"></div>
        <div class="person person-2"></div>
        <div class="campfire"></div>
        <div class="person person-3"></div>
        <div class="person person-4"></div>
      </div>
    </section>

    <section class="stats" v-reveal>
      <div class="container stat-grid">
        <div v-for="item in stats" :key="item.label" class="stat-item">
          <p class="stat-value" :style="{ color: item.color }">{{ item.value }}</p>
          <p class="stat-label">{{ item.label }}</p>
        </div>
      </div>
    </section>

    <section v-if="homeAdSlot" class="ad-section">
      <div class="container">
        <AdsenseSlot :slot="homeAdSlot" :label="t('app.common.sponsored')" />
      </div>
    </section>

    <section class="feature feature-light" v-reveal>
      <div class="container feature-layout">
        <article>
          <p class="feature-tag tag-green">Personality Types</p>
          <h2 class="feature-title">{{ t('home.featureA.title') }}</h2>
          <p class="feature-copy">{{ t('home.featureA.copy') }}</p>
          <div class="feature-actions">
            <RouterLink to="/quiz" class="btn btn-green">{{ t('home.featureA.button') }}</RouterLink>
            <RouterLink to="/quiz" class="link-green">{{ t('home.featureA.link') }}</RouterLink>
          </div>
        </article>
        <aside class="feature-illustration office-1" aria-hidden="true">
          <div class="window"></div>
          <div class="window"></div>
          <div class="figure a"></div>
          <div class="figure b"></div>
          <div class="figure c"></div>
          <div class="desk"></div>
        </aside>
      </div>
    </section>

    <section class="feature feature-alt" v-reveal>
      <div class="container feature-layout reverse">
        <aside class="feature-illustration office-2" aria-hidden="true">
          <div class="figure d"></div>
          <div class="figure e"></div>
          <div class="figure f"></div>
          <div class="desk"></div>
        </aside>
        <article>
          <p class="feature-tag tag-blue">Results</p>
          <h2 class="feature-title">{{ t('home.featureB.title') }}</h2>
          <p class="feature-copy">{{ t('home.featureB.copy') }}</p>
          <RouterLink to="/quiz" class="btn btn-blue">{{ t('home.featureB.button') }}</RouterLink>
        </article>
      </div>
    </section>

    <section class="testimonials" v-reveal>
      <div class="quote-badge">“</div>
      <div class="container">
        <p class="testimonial-tag">Testimonials</p>
        <h2 class="testimonial-title">{{ t('home.testimonialsTitle') }}</h2>

        <div class="testimonial-track">
          <article v-for="item in testimonials" :key="item.name" class="testimonial-card">
            <div class="card-top" :style="{ backgroundColor: item.color }"></div>
            <div class="card-body">
              <div class="profile-row">
                <div class="avatar" :style="{ background: item.avatar }"></div>
                <div>
                  <h3>{{ item.name }}</h3>
                  <p :style="{ color: item.color }">{{ item.role }} ({{ item.type }})</p>
                </div>
              </div>
              <p class="quote">{{ item.quote }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- GitHub Star Call to Action -->
    <section class="feature feature-light text-center" style="padding-top: 5rem; padding-bottom: 5rem;">
      <div class="container">
        <h2 class="feature-title" style="margin-bottom: 1rem;">{{ t('home.ossTitle') }}</h2>
        <p class="feature-copy" style="max-width: 600px; margin: 0 auto 2.5rem;">{{ t('home.ossCopy') }}</p>
        <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" class="btn btn-green" style="display: inline-flex; justify-content: center; align-items: center; gap: 0.5rem; max-width: 250px; margin: 0 auto;">
          <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          {{ t('home.ossButton') }}
        </a>
      </div>
    </section>

    <section class="cta">
      <div class="cta-top-wave"></div>
      <div class="container cta-inner">
        <h2>{{ t('home.ctaTitle') }}</h2>
        <RouterLink to="/quiz" class="hero-button">{{ t('home.ctaButton') }}</RouterLink>
      </div>
      <div class="cta-bottom-wave"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import AdsenseSlot from '../components/AdsenseSlot.vue'
import { useI18n } from '../i18n'

const homeAdSlot = String(import.meta.env.VITE_ADSENSE_SLOT_HOME ?? '').trim()
const { t, tm } = useI18n()
const relayFeedback = ref('')

const stats = computed(() => tm<Array<{ value: string; label: string; color: string }>>('home.stats'))

const testimonialBase = [
  {
    name: "Benny",
    role: "ARCHITECT",
    type: "INTJ",
    color: "#8a609d",
    avatar: "linear-gradient(135deg, #f7b2b2 0%, #f3d3d3 100%)",
    quote: "结果非常细，像拿着镜子把我的习惯和思考方式都照了出来。",
  },
  {
    name: "Nicole",
    role: "ADVOCATE",
    type: "INFJ",
    color: "#3ba17c",
    avatar: "linear-gradient(135deg, #b8d7ff 0%, #d6e6ff 100%)",
    quote: "终于有一个结果把我解释清楚了，不再觉得自己和别人不一样。",
  },
  {
    name: "Caroline",
    role: "DEFENDER",
    type: "ISFJ",
    color: "#4298b4",
    avatar: "linear-gradient(135deg, #bdebc9 0%, #dff5e6 100%)",
    quote: "优势和盲点写得很准确，尤其是关系与工作场景建议，实用度很高。",
  },
  {
    name: "Marta",
    role: "COMMANDER",
    type: "ENTJ",
    color: "#8a609d",
    avatar: "linear-gradient(135deg, #ffe6a8 0%, #fff1cb 100%)",
  },
]

const testimonials = computed(() =>
  testimonialBase.map((item, index) => ({
    ...item,
    quote: tm<string[]>('home.testimonials')[index] ?? '',
  })),
)

async function copyQuizLink() {
  try {
    const link = new URL('/quiz', window.location.href).toString()
    await navigator.clipboard.writeText(link)
    relayFeedback.value = t('home.relayFeedback')
  } catch {
    relayFeedback.value = t('app.common.copyFail')
  }
}
</script>

<style scoped>
.home {
  background: #fff;
  color: #333;
}

.container {
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
}

.hero {
  position: relative;
  padding: 5.5rem 0 14rem;
  background: #4899a3;
  overflow: hidden;
}

.hero-inner {
  text-align: center;
  position: relative;
  z-index: 3;
  color: #fff;
}

.hero-title {
  margin: 0;
  font-size: clamp(2.2rem, 5.5vw, 3.5rem);
  line-height: 1.15;
  font-weight: 800;
}

.hero-subtitle {
  max-width: 760px;
  margin: 1.4rem auto 2.2rem;
  font-size: clamp(1rem, 2.4vw, 1.35rem);
  opacity: 0.95;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 0 2rem;
  border-radius: 999px;
  background: #9474a4;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 26px rgba(89, 58, 104, 0.28);
  transition: transform 0.2s ease;
}

.hero-button:hover {
  transform: translateY(-2px);
}

.hero-relay {
  width: min(720px, 100%);
  margin: 1.5rem auto 0;
  padding: 1.1rem 1.25rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(6px);
}

.hero-relay-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.hero-relay-copy {
  margin: 0.45rem 0 0;
  font-size: 0.96rem;
  line-height: 1.7;
  opacity: 0.92;
}

.hero-relay-credit {
  width: min(720px, 100%);
  margin: 0.8rem auto 0;
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.95;
  color: #ffffff;
}

.hero-relay-credit a {
  color: #f5c451;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.hero-relay-credit a:hover {
  opacity: 0.88;
}

.hero-relay-button {
  margin-top: 0.9rem;
  min-height: 42px;
  padding: 0 1.2rem;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #2f3a45;
  font-weight: 800;
  cursor: pointer;
}

.hero-relay-feedback {
  margin: 0.65rem 0 0;
  font-size: 0.88rem;
  font-weight: 700;
  opacity: 0.95;
}

.hero-wave {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 160px;
  background: #fff;
  clip-path: polygon(0 35%, 12% 25%, 50% 58%, 82% 18%, 100% 32%, 100% 100%, 0 100%);
  z-index: 2;
}

.hero-scene {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  width: min(1180px, 92vw);
  height: 240px;
  z-index: 1;
}

.tree {
  position: absolute;
  bottom: 40px;
  width: 0;
  height: 0;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-bottom: 72px solid #4f9e6c;
}

.tree-1 { left: 12%; }
.tree-2 {
  left: 22%;
  border-left-width: 34px;
  border-right-width: 34px;
  border-bottom-width: 96px;
  border-bottom-color: #3b7a52;
}
.tree-3 {
  right: 14%;
  border-left-width: 36px;
  border-right-width: 36px;
  border-bottom-width: 104px;
}

.stone {
  position: absolute;
  bottom: 24px;
  background: #9fa6ad;
  border-radius: 16px 16px 8px 8px;
}

.stone-1 {
  left: 29%;
  width: 54px;
  height: 38px;
  transform: skewX(-12deg);
}

.stone-2 {
  right: 24%;
  width: 64px;
  height: 44px;
  transform: skewX(12deg);
}

.person {
  position: absolute;
  bottom: 34px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
}

.person::after {
  content: "";
  position: absolute;
  top: 31px;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 64px;
  border-radius: 16px 16px 10px 10px;
  background: currentColor;
}

.person-1 {
  left: 33%;
  color: #68b6ce;
  background: #4298b4;
}

.person-2 {
  left: 42%;
  color: #5aa273;
  background: #d5dbe3;
}

.person-3 {
  left: 59%;
  color: #e1c152;
  background: #57616f;
}

.person-4 {
  left: 70%;
  color: #a683b5;
  background: #8a609d;
}

.campfire {
  position: absolute;
  left: 50%;
  bottom: 48px;
  transform: translateX(-50%);
  width: 40px;
  height: 56px;
  background: #f2c244;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.campfire::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 58px;
  height: 10px;
  border-radius: 999px;
  background: #7e3c28;
}

.stats {
  padding: 4.5rem 0;
}

.ad-section {
  padding: 0 0 3rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  text-align: center;
}

.stat-value {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
  font-weight: 800;
}

.stat-label {
  margin: 0.7rem 0 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
}

.feature {
  position: relative;
  padding: 5.5rem 0;
  overflow: hidden;
}

.feature::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(170deg, #f7f8f9 0%, #fff 55%);
  z-index: 0;
}

.feature-alt::before {
  background: linear-gradient(192deg, #f7f8f9 0%, #fff 58%);
}

.feature-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}

.reverse {
  grid-template-columns: 1fr 1fr;
}

.feature-tag {
  margin: 0 0 1rem;
  font-size: 0.78rem;
  letter-spacing: 0.13em;
  font-weight: 800;
  text-transform: uppercase;
}

.tag-green { color: #3ba17c; }
.tag-blue { color: #4298b4; }

.feature-title {
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 2.7rem);
  line-height: 1.2;
}

.feature-copy {
  margin: 1.3rem 0 1.8rem;
  color: #666;
  font-size: 1.125rem;
  line-height: 1.75;
}

.feature-actions {
  display: flex;
  gap: 1.1rem;
  flex-wrap: wrap;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  border-radius: 999px;
  padding: 0 1.6rem;
  color: #fff;
  font-weight: 700;
}

.btn-green { background: #3ba17c; }
.btn-blue { background: #4298b4; }
.link-green {
  color: #3ba17c;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
}

.feature-illustration {
  height: 390px;
  border-radius: 18px;
  border: 1px solid #e7ebee;
  background: #fff;
  box-shadow: 0 20px 50px rgba(20, 33, 45, 0.08);
  position: relative;
  overflow: hidden;
}

.feature-illustration::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(246, 248, 249, 0.8);
  clip-path: polygon(0 0, 100% 6%, 100% 96%, 0 100%);
}

.office-1 .window {
  position: absolute;
  top: 42px;
  width: 36%;
  height: 96px;
  background: #d7e7ef;
  border-radius: 8px;
}

.office-1 .window:first-child { left: 8%; }
.office-1 .window:last-child { right: 8%; }

.figure {
  position: absolute;
  bottom: 52px;
  width: 58px;
  border-radius: 12px 12px 6px 6px;
}

.office-1 .a {
  left: 24%;
  height: 170px;
  background: #5aa273;
}

.office-1 .b {
  left: 44%;
  height: 136px;
  background: #8a609d;
}

.office-1 .c {
  left: 63%;
  height: 154px;
  background: #68b6ce;
}

.office-2 .d {
  left: 26%;
  height: 132px;
  background: #8a609d;
}

.office-2 .e {
  left: 48%;
  height: 176px;
  background: #5aa273;
}

.office-2 .f {
  left: 68%;
  height: 156px;
  background: #e5b540;
}

.desk {
  position: absolute;
  bottom: 26px;
  left: 10%;
  width: 80%;
  height: 16px;
  border-radius: 8px;
  background: #51575f;
}

.testimonials {
  padding: 5.5rem 0;
  position: relative;
}

.quote-badge {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%) rotate(12deg);
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #e5b540;
  color: #fff;
  font-size: 3rem;
  font-family: Georgia, serif;
  line-height: 1.3;
  text-align: center;
  box-shadow: 0 10px 24px rgba(131, 96, 17, 0.28);
}

.testimonial-tag {
  text-align: center;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #e5b540;
  font-weight: 800;
  font-size: 0.75rem;
  margin: 1.6rem 0 0;
}

.testimonial-title {
  text-align: center;
  margin: 0.6rem 0 2.6rem;
  font-size: clamp(1.9rem, 4.5vw, 2.8rem);
}

.testimonial-track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(280px, 360px);
  gap: 1.2rem;
  overflow-x: auto;
  padding: 0.4rem 0.2rem 1.2rem;
  scroll-snap-type: x mandatory;
}

.testimonial-card {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(32, 38, 46, 0.1);
  overflow: hidden;
  scroll-snap-align: center;
}

.card-top {
  height: 6px;
}

.card-body {
  padding: 1.4rem;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 999px;
}

.profile-row h3 {
  margin: 0;
  font-size: 1.05rem;
}

.profile-row p {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  font-weight: 700;
}

.quote {
  margin: 1rem 0 0;
  color: #555;
  line-height: 1.7;
  font-size: 0.95rem;
}

.cta {
  margin-top: 1rem;
  position: relative;
  background: #46a27e;
  padding: 8rem 0;
  overflow: hidden;
}

.cta-top-wave,
.cta-bottom-wave {
  position: absolute;
  left: 0;
  right: 0;
  height: 84px;
  background: #fff;
}

.cta-top-wave {
  top: 0;
  clip-path: polygon(0 0, 100% 0, 100% 12%, 48% 100%, 0 42%);
}

.cta-bottom-wave {
  bottom: 0;
  clip-path: polygon(0 78%, 52% 22%, 100% 90%, 100% 100%, 0 100%);
}

.cta-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
}

.cta-inner h2 {
  margin: 0 0 2rem;
  font-size: clamp(2rem, 4.5vw, 3rem);
  line-height: 1.2;
}

@media (max-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 1.8rem;
  }

  .feature-layout,
  .reverse {
    grid-template-columns: 1fr;
  }

  .feature-illustration {
    height: 320px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding-top: 4.2rem;
    padding-bottom: 11.5rem;
  }

  .hero-scene {
    height: 170px;
  }

  .person::after {
    width: 28px;
    height: 48px;
    top: 28px;
  }

  .tree,
  .stone,
  .person-4 {
    display: none;
  }

  .testimonial-track {
    grid-auto-columns: minmax(260px, 86vw);
  }

  .cta {
    padding: 7rem 0;
  }
}
</style>
