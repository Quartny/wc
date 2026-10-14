import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import './wc.ts';
import App from './App.vue';
import HomePage from './index.vue';
import DocsPage from './DocsPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/developers', component: DocsPage },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

router.beforeEach((to) => {
  const isDocsPage = to.path === '/developers';
  document.documentElement.classList.toggle('docs-mode', isDocsPage);
  document.body.classList.toggle('docs-mode', isDocsPage);
  document.title = isDocsPage ? 'Developers | wc app' : 'wc app | Universal wallet provider';
});

router.afterEach(() => window.scrollTo(0, 0));

createApp(App).use(router).mount('#app');