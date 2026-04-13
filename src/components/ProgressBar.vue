<template>
  <section class="panel progress-panel" :aria-label="label">
    <div class="progress-topline">
      <div>
        <p class="eyebrow">{{ label }}</p>
        <p class="progress-copy">第 {{ current }} / {{ total }} 题</p>
      </div>
      <p class="muted">已作答 {{ answered }} 题</p>
    </div>

    <div class="progress-track" aria-hidden="true">
      <div class="progress-fill" :style="{ width: `${percentage}%` }" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current: number
    total: number
    answered: number
    label?: string
  }>(),
  {
    label: '测试进度',
  },
)

const percentage = computed(() => {
  if (props.total <= 0) return 0
  return Math.min(100, Math.max(0, (props.current / props.total) * 100))
})
</script>

<style scoped>
.progress-panel {
  display: grid;
  gap: 14px;
}

.progress-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
}

.progress-copy {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text);
}

.progress-track {
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-2) 0%, var(--accent) 55%, var(--accent-3) 100%);
  transition: width 220ms ease;
}

@media (max-width: 700px) {
  .progress-topline {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
