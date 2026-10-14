<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import HomePage from './index.vue';
import DocsPage from './DocsPage.vue';

const route = useRoute();

type WalletRuntime = {
  conf: { set: (config: { buildIn: 'on' }) => void };
  mount: (options: { accountSlot: string; modalRoot: string; count: string }) => void;
};

onMounted(() => {
  const runtime = (window as Window & { wc?: WalletRuntime }).wc;
  if (!runtime) return;

  runtime.conf.set({ buildIn: 'on' });
  runtime.mount({ accountSlot: 'account-slot', modalRoot: 'modal-root', count: 'wallet-count' });
});
</script>

<template>
  <main class="shell">
    <HomePage v-show="route.path !== '/developers'" />
    <DocsPage v-if="route.path === '/developers'" />
    <div id="modal-root"></div>
  </main>
</template>