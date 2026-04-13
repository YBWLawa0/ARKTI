<script setup lang="ts">
const props = defineProps<{
  name:
    | 'copy'
    | 'download'
    | 'spinner'
    | 'refresh'
    | 'chart'
    | 'character'
    | 'quote'
    | 'book'
    | 'star'
    | 'warning'
    | 'fallback'
  class?: string
}>()

const paths: Record<string, string[]> = {
  copy: [
    'M9 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z',
    'M5 15V5a2 2 0 0 1 2-2h10',
  ],
  download: [
    'M12 3v11',
    'm7 11 5 5 5-5',
    'M5 21h14',
  ],
  spinner: [
    'M21 12a9 9 0 1 1-6.219-8.56',
  ],
  refresh: [
    'M3 12a9 9 0 0 1 15.364-6.364L21 8',
    'M21 3v5h-5',
    'M21 12a9 9 0 0 1-15.364 6.364L3 16',
    'M8 16H3v5',
  ],
  chart: [
    'M4 20h16',
    'M7 16v-4',
    'M12 16V8',
    'M17 16V4',
  ],
  character: [
    'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z',
    'M4.5 20a7.5 7.5 0 0 1 15 0',
  ],
  quote: [
    'M9 11H5a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4',
    'M19 11h-4a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4',
  ],
  book: [
    'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 0 4 23Z',
    'M4 5.5v15',
    'M8 7h8',
  ],
  star: [
    'm12 3 2.9 5.88 6.49.94-4.7 4.58 1.11 6.45L12 17.77 6.2 20.85l1.11-6.45-4.7-4.58 6.49-.94z',
  ],
  warning: [
    'M12 4 21 20H3Z',
    'M12 9v5',
    'M12 18h.01',
  ],
  fallback: [
    'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z',
    'M4.5 20a7.5 7.5 0 0 1 15 0',
    'M18 6l2-2',
    'M20 6h-4',
  ],
}
</script>

<template>
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.85"
    :class="['app-icon', props.class]"
  >
    <path v-for="path in paths[props.name]" :key="path" :d="path" />
  </svg>
</template>

<style scoped>
.app-icon {
  width: 1em;
  height: 1em;
  flex: none;
}
</style>
