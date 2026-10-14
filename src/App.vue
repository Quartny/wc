<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

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
    <nav class="topbar">
      <RouterLink class="brand" to="/">
        <span class="brand-mark"><img src="/ethereum.svg" alt=""></span>
        <span>wc app</span>
      </RouterLink>
      <div class="nav">
        <RouterLink to="/developers">Developers</RouterLink>
      </div>
      <div id="account-slot">
        <button class="connect-button compact" data-wc-open>Connect wallet <span></span></button>
      </div>
    </nav>
    <RouterView />
    <div id="modal-root"></div>
  </main>
</template>