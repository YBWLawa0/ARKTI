import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initI18n } from './i18n'

initI18n()
const app = createApp(App)

let revealObserver: IntersectionObserver | null = null
const getRevealObserver = () => {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      const intersecting = entries.filter(e => e.isIntersecting)
      
      intersecting.forEach(entry => {
        const el = entry.target as HTMLElement
        el.classList.add('reveal-active')
        revealObserver!.unobserve(el)
      })

      
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' })
  }
  return revealObserver
}

app.directive('reveal', {
  mounted(el: HTMLElement) {
    el.classList.add('reveal-init')
    getRevealObserver().observe(el)
  },
  unmounted(el: HTMLElement) {
    if (revealObserver) {
      revealObserver.unobserve(el)
    }
  }
})

app.use(router).mount('#app')


