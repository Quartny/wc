<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import docsSource from '../DOCS.mdx?raw';

const renderedDocs = new MarkdownIt({ html: false, linkify: true }).render(docsSource);
</script>

<template>
  <section class="docs-page">
    <div class="docs-content" v-html="renderedDocs"></div>
  </section>
</template>

<style>
.docs-page {
  min-height: calc(100dvh - 92px);
  padding: 64px 28px 96px;
  color: #252b27;
  background: #fffbea;
  font-family: 'Space Grotesk', Manrope, sans-serif;
}

.docs-content {
  width: min(100%, 840px);
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.75;
}

.docs-content h1,
.docs-content h2,
.docs-content h3,
.docs-content h4 {
  color: #252b27;
  line-height: 1.2;
}

.docs-content h1 {
  margin: 0 0 32px;
  font-size: 42px;
}

.docs-content h2 {
  margin: 52px 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(61, 69, 53, .16);
  font-size: 27px;
}

.docs-content h3 {
  margin-top: 32px;
  font-size: 20px;
}

.docs-content a {
  color: #b74f3d;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.docs-content li,
.docs-content p {
  color: #51574e;
}

.docs-content li + li {
  margin-top: 6px;
}

.docs-content pre {
  overflow-x: auto;
  margin: 20px 0;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 8px;
  background: #202824;
  color: #f2f3e9;
  font: 13px/1.65 'DM Mono', monospace;
}

.docs-content :not(pre) > code {
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(61, 69, 53, .08);
  color: #38483d;
  font: 0.9em 'DM Mono', monospace;
}

.docs-content table {
  display: block;
  overflow-x: auto;
  border-collapse: collapse;
}

.docs-content th,
.docs-content td {
  padding: 9px 12px;
  border: 1px solid rgba(61, 69, 53, .16);
  text-align: left;
}

@media (max-width: 780px) {
  .docs-page {
    min-height: calc(100dvh - 76px);
    padding: 40px 22px 64px;
  }

  .docs-content h1 {
    font-size: 34px;
  }

  .docs-content h2 {
    font-size: 23px;
  }
}
</style>