<template>
  <section class="question-card">
    <div class="question-content">
      <h1 class="question-title">{{ question.text ?? question.prompt ?? '（题干缺失）' }}</h1>
    </div>

    <div class="options-grid">
      <button
        v-for="(option, index) in question.options"
        :key="option.id"
        type="button"
        class="option-button"
        :class="[
          'option-' + index,
          { 'selected': selectedIndex === index }
        ]"
        @click="$emit('select', index)"
      >
        <span class="option-circle"></span>
        <span class="option-label">{{ option.label }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Question } from '../types/quiz'

defineProps<{
  question: Question
  selectedIndex: number
}>()

defineEmits<{
  select: [index: number]
}>()
</script>

<style scoped>
.question-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
  padding: 48px 40px;
  margin-bottom: 32px;
}

.question-content {
  text-align: center;
  margin-bottom: 48px;
}

.question-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  margin: 0;
  font-family: Georgia, serif;
}

.options-grid {
  display: grid;
  gap: 20px;
}

.option-button {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 28px;
  border: 3px solid transparent;
  border-radius: 16px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.option-button:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.option-button.selected {
  border-color: currentColor;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: scale(1.02);
}

.option-button:active {
  transform: scale(0.98);
}

.option-circle {
  flex-shrink: 0;
  border-radius: 50%;
  border: 3px solid currentColor;
  transition: all 0.2s ease;
}

/* Option 0: Largest green circle (Strongly Agree) */
.option-0 {
  color: #33a474;
}
.option-0 .option-circle {
  width: 52px;
  height: 52px;
}
.option-0:hover .option-circle,
.option-0.selected .option-circle {
  background: #33a474;
}

/* Option 1: Medium green circle (Agree) */
.option-1 {
  color: #55c391;
}
.option-1 .option-circle {
  width: 40px;
  height: 40px;
  margin: 0 6px;
}
.option-1:hover .option-circle,
.option-1.selected .option-circle {
  background: #55c391;
}

/* Option 2: Medium purple circle (Disagree) */
.option-2 {
  color: #a481b8;
}
.option-2 .option-circle {
  width: 40px;
  height: 40px;
  margin: 0 6px;
}
.option-2:hover .option-circle,
.option-2.selected .option-circle {
  background: #a481b8;
}

/* Option 3: Largest purple circle (Strongly Disagree) */
.option-3 {
  color: #88619a;
}
.option-3 .option-circle {
  width: 52px;
  height: 52px;
}
.option-3:hover .option-circle,
.option-3.selected .option-circle {
  background: #88619a;
}

.option-label {
  font-size: 18px;
  font-weight: 500;
  color: #495057;
  flex: 1;
}

@media (max-width: 768px) {
  .question-card {
    padding: 32px 24px;
  }

  .question-title {
    font-size: 22px;
  }

  .option-button {
    padding: 16px 20px;
    gap: 16px;
  }

  .option-0 .option-circle,
  .option-3 .option-circle {
    width: 44px;
    height: 44px;
  }

  .option-1 .option-circle,
  .option-2 .option-circle {
    width: 32px;
    height: 32px;
  }

  .option-label {
    font-size: 16px;
  }
}
</style>
