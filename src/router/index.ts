import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../pages/HomePage.vue') },
    { path: '/intro', name: 'intro', component: () => import('../pages/IntroPage.vue') },
    { path: '/quiz', name: 'quiz', component: () => import('../pages/QuizPage.vue') },
    { path: '/result', name: 'result', component: () => import('../pages/ResultPage.vue') },
    { path: '/characters', name: 'characters', component: () => import('../pages/CharactersPage.vue') },
    { path: '/about', name: 'about', component: () => import('../pages/AboutPage.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
