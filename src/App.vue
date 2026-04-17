<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from './i18n'
import { useQuiz } from './composables/useQuiz'

const route = useRoute()
const { locale, localeOptions, setLocale, t } = useI18n()
const quiz = useQuiz()

const isLangOpen = ref(false)
const isMobileMenuOpen = ref(false)
const langDropdownRef = ref<HTMLElement | null>(null)
const mobileMenuRef = ref<HTMLElement | null>(null)

const currentLabel = computed(() => {
  return localeOptions.find(o => o.code === locale.value)?.label || 'Language'
})

const toggleLangDropdown = () => {
  isLangOpen.value = !isLangOpen.value
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const selectLanguage = (code: string) => {
  setLocale(code as never)
  isLangOpen.value = false
  isMobileMenuOpen.value = false
}

const closeLangDropdown = (e: MouseEvent) => {
  if (langDropdownRef.value && !langDropdownRef.value.contains(e.target as Node)) {
    isLangOpen.value = false
  }
}

const closeMobileDropdown = (e: MouseEvent) => {
  if (mobileMenuRef.value && !mobileMenuRef.value.contains(e.target as Node)) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeLangDropdown)
  document.addEventListener('click', closeMobileDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeLangDropdown)
  document.removeEventListener('click', closeMobileDropdown)
})

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
    isLangOpen.value = false
  },
)

const showRecentResult = computed(() => route.path !== '/result')
const showFooter = computed(() => route.path !== '/quiz')
const showLiveMetricsToggle = computed(() => route.path === '/quiz' && !!quiz.latestResult.value)

const ANNOUNCEMENT_STORAGE_KEY = 'arkti:announcement:last-seen-version'
const ANNOUNCEMENT_VERSION = '2026-04-16-v2'
const announcementTitle = computed(() => t('app.announcement.title'))
const announcementBody = computed(() => t('app.announcement.body'))
const isAnnouncementVisible = ref(false)

const closeAnnouncement = () => {
  isAnnouncementVisible.value = false
  try {
    localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, ANNOUNCEMENT_VERSION)
  } catch (error) {
    console.warn('Failed to persist announcement state:', error)
  }
}

onMounted(() => {
  try {
    const lastSeenVersion = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)
    if (lastSeenVersion !== ANNOUNCEMENT_VERSION) {
      isAnnouncementVisible.value = true
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, ANNOUNCEMENT_VERSION)
    }
  } catch (error) {
    console.warn('Failed to read announcement state:', error)
    isAnnouncementVisible.value = true
  }
})
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink class="brand-lockup" to="/">
        <div class="brand-logo" aria-hidden="true">
          <img src="/mrfz.png" alt="" width="40" height="40" />
        </div>
        <span class="brand-name">ARKTI</span>
      </RouterLink>

      <nav class="site-nav">
        <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; color: #333e49; font-weight: 600; text-decoration: none;" :title="t('app.nav.githubTitle')">
          <svg style="width: 18px; height: 18px; color: #3ba17c;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          <span class="nav-star-text" style="font-size: 15px;">{{ t('app.nav.star') }} 🌟</span>
        </a>
        <div class="lang-dropdown" :class="{ 'is-open': isLangOpen }" ref="langDropdownRef">
          <button class="lang-dropdown-trigger" type="button" @click.prevent="toggleLangDropdown" :aria-label="t('app.language.label')" :aria-expanded="isLangOpen">
            {{ currentLabel }}
            <span class="arrow"></span>
          </button>
          <transition name="dropdown">
            <ul class="lang-dropdown-menu" v-show="isLangOpen" role="listbox">
              <li 
                v-for="option in localeOptions" 
                :key="option.code"
                role="option"
                :aria-selected="option.code === locale"
                :class="{ active: option.code === locale }"
                @click.stop="selectLanguage(option.code)"
              >
                {{ option.label }}
              </li>
            </ul>
          </transition>
        </div>
        <RouterLink to="/characters">{{ t('app.nav.characters') }}</RouterLink>
        <RouterLink to="/about">{{ t('app.nav.about') }}</RouterLink>
        <RouterLink to="/result" v-if="showRecentResult">{{ t('app.nav.result') }}</RouterLink>
        <RouterLink to="/quiz" class="button button-primary nav-cta">{{ t('app.nav.cta') }}</RouterLink>
      </nav>

      <div class="mobile-nav" ref="mobileMenuRef">
        <button
          type="button"
          class="mobile-menu-button"
          :aria-expanded="isMobileMenuOpen"
          :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
          @click.stop="toggleMobileMenu"
        >
          <span v-if="isMobileMenuOpen">✕</span>
          <span v-else>☰</span>
        </button>

        <transition name="dropdown">
          <div v-show="isMobileMenuOpen" class="mobile-menu-panel">
            <a
              href="https://github.com/YBWLawa0/ARKTI"
              target="_blank"
              rel="noopener noreferrer"
              class="mobile-menu-item mobile-github-link"
              :title="t('app.nav.githubTitle')"
              @click="closeMobileMenu"
            >
              <svg
                style="width: 18px; height: 18px; color: #3ba17c;"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {{ t('app.nav.star') }} 🌟
            </a>

            <div class="mobile-lang-group">
              <p class="mobile-lang-title">{{ t('app.language.label') }}</p>
              <button
                v-for="option in localeOptions"
                :key="`mobile-${option.code}`"
                type="button"
                class="mobile-lang-option"
                :class="{ active: option.code === locale }"
                @click="selectLanguage(option.code)"
              >
                {{ option.label }}
              </button>
            </div>

            <RouterLink to="/characters" class="mobile-menu-item" @click="closeMobileMenu">
              {{ t('app.nav.characters') }}
            </RouterLink>
            <RouterLink to="/about" class="mobile-menu-item" @click="closeMobileMenu">
              {{ t('app.nav.about') }}
            </RouterLink>
            <RouterLink to="/result" class="mobile-menu-item" @click="closeMobileMenu">
              {{ t('app.nav.result') }}
            </RouterLink>
            <RouterLink to="/quiz" class="mobile-menu-item mobile-cta" @click="closeMobileMenu">
              {{ t('app.nav.cta') }}
            </RouterLink>
          </div>
        </transition>
      </div>
    </header>

    <transition name="announcement-fade">
      <aside
        v-if="isAnnouncementVisible"
        class="release-announcement"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          class="release-announcement-close"
          :aria-label="t('app.announcement.closeAria')"
          @click="closeAnnouncement"
        >
          ×
        </button>
        <p class="release-announcement-tag">NEW</p>
        <h2>{{ announcementTitle }}</h2>
        <p>{{ announcementBody }}</p>
      </aside>
    </transition>

    <main class="site-main">
      <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
    </main>

    <transition name="floating-live-toggle-fade">
      <button
        v-if="showLiveMetricsToggle && !quiz.liveMetricsVisible.value"
        type="button"
        class="nav-live-toggle floating-live-toggle"
        :class="{ active: quiz.liveMetricsVisible.value }"
        :aria-pressed="quiz.liveMetricsVisible.value"
        :aria-label="t('app.liveMetricsToggle.aria')"
        :title="t('app.liveMetricsToggle.title')"
        @click="quiz.toggleLiveMetricsPanel()"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      </button>
    </transition>

    <footer v-if="showFooter" class="site-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">{{ t('app.footer.sections.test') }}</h3>
          <RouterLink to="/quiz" class="footer-link">{{ t('app.footer.links.startQuiz') }}</RouterLink>
          <RouterLink to="/result" class="footer-link">{{ t('app.footer.links.latestResult') }}</RouterLink>
          <RouterLink to="/quiz" class="footer-link">{{ t('app.footer.links.types') }}</RouterLink>
          <RouterLink to="/characters" class="footer-link">{{ t('app.footer.links.characters') }}</RouterLink>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">{{ t('app.footer.sections.project') }}</h3>
          <RouterLink to="/result" class="footer-link">{{ t('app.footer.links.resultStructure') }}</RouterLink>
          <RouterLink to="/about" class="footer-link">{{ t('app.footer.links.boundaries') }}</RouterLink>
          <RouterLink to="/about" class="footer-link">{{ t('app.footer.links.roadmap') }}</RouterLink>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">{{ t('app.footer.sections.reminders') }}</h3>
          <p class="footer-note">{{ t('app.footer.notes.result') }}</p>
          <p class="footer-note">{{ t('app.footer.notes.localOnly') }}</p>
          <p class="footer-note">{{ t('app.footer.notes.disclaimer') }}</p>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">{{ t('app.footer.sections.status') }}</h3>
          <p class="footer-note">{{ t('app.footer.notes.frontend') }}</p>
          <p class="footer-note">{{ t('app.footer.notes.stats') }}</p>
          <p class="footer-note">{{ t('app.footer.notes.library') }}</p>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">{{ t('app.footer.sections.openSource') }}</h3>
          <p class="footer-note">{{ t('app.footer.notes.likeIt') }}</p>
          <a href="https://github.com/YBWLawa0/ARKTI" target="_blank" rel="noopener noreferrer" class="footer-link cta-star" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: #3ba17c; margin-top: 4px;">
            <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            {{ t('app.footer.notes.star') }}
          </a>
        </div>
        <div class="footer-section">
          <h3 class="footer-title">{{ t('app.footer.sections.links') }}</h3>
          <p class="footer-note">
            {{ t('app.footer.notes.acgtiPrefix') }}
            <a href="https://acgti.tianxingleo.top/#/" target="_blank" rel="noopener noreferrer" style="color: #3ba17c; text-decoration: none; font-weight: 600;">https://acgti.tianxingleo.top/#/</a>
          </p>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-copyright">© 2026 ARKTI Project</p>
        <div class="footer-social">
          <RouterLink to="/" :title="t('app.footer.social.home')">{{ t('app.footer.social.home') }}</RouterLink>
          <RouterLink to="/quiz" :title="t('app.footer.social.quiz')">{{ t('app.footer.social.quiz') }}</RouterLink>
          <RouterLink to="/characters" :title="t('app.footer.social.characters')">{{ t('app.footer.social.characters') }}</RouterLink>
          <RouterLink to="/about" :title="t('app.footer.social.about')">{{ t('app.footer.social.about') }}</RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

