<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { fetchStatsSummary, type StatsSummary, type StatsSummaryRow } from '../utils/stats'

const summary = ref<StatsSummary | null>(null)
const selectedRegion = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const regionOptions = computed(() => summary.value?.regions ?? [])

async function loadStats() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    summary.value = await fetchStatsSummary(selectedRegion.value)
  } catch {
    errorMessage.value = '统计数据暂时无法加载。请确认 Cloudflare Pages Function 和 D1 绑定已经配置。'
  } finally {
    isLoading.value = false
  }
}

function onRegionChange() {
  void loadStats()
}

function formatRegion(region: string) {
  return region === 'XX' ? '未知地区' : region
}

function rowWidth(row: StatsSummaryRow) {
  return `${Math.max(2, Math.min(100, row.percentage))}%`
}

onMounted(() => {
  void loadStats()
})
</script>

<template>
  <div class="stats-page">
    <section class="stats-hero">
      <p class="stats-kicker">ARKTI 全网统计</p>
      <h1>人格分布</h1>
      <p>这里汇总所有完成测试后的匿名结果。你可以按 Cloudflare 自动识别的访问地区筛选。</p>
    </section>

    <section class="stats-toolbar">
      <label>
        地区
        <select v-model="selectedRegion" :disabled="isLoading" @change="onRegionChange">
          <option value="">全部地区</option>
          <option v-for="item in regionOptions" :key="item.region" :value="item.region">
            {{ formatRegion(item.region) }} · {{ item.count }}
          </option>
        </select>
      </label>

      <button type="button" :disabled="isLoading" @click="loadStats">
        {{ isLoading ? '刷新中' : '刷新' }}
      </button>
    </section>

    <section v-if="errorMessage" class="stats-empty">
      {{ errorMessage }}
    </section>

    <template v-else-if="summary">
      <section class="stats-total">
        <span>样本数</span>
        <strong>{{ summary.total }}</strong>
      </section>

      <section v-if="summary.total === 0" class="stats-empty">
        还没有统计样本。完成一次测试后，这里会开始出现聚合数据。
      </section>

      <section v-else class="stats-grid">
        <article class="stats-panel">
          <h2>角色占比</h2>
          <div class="stats-list">
            <div v-for="row in summary.characters" :key="row.key" class="stats-row">
              <div class="stats-row-head">
                <span>{{ row.label }}</span>
                <strong>{{ row.percentage.toFixed(1) }}%</strong>
              </div>
              <div class="stats-track">
                <span :style="{ width: rowWidth(row) }"></span>
              </div>
              <p>{{ row.count }} 次</p>
            </div>
          </div>
        </article>

        <article class="stats-panel">
          <h2>MBTI 占比</h2>
          <div class="stats-list compact">
            <div v-for="row in summary.mbti" :key="row.key" class="stats-row">
              <div class="stats-row-head">
                <span>{{ row.label }}</span>
                <strong>{{ row.percentage.toFixed(1) }}%</strong>
              </div>
              <div class="stats-track">
                <span :style="{ width: rowWidth(row) }"></span>
              </div>
              <p>{{ row.count }} 次</p>
            </div>
          </div>
        </article>

        <article class="stats-panel">
          <h2>原型占比</h2>
          <div class="stats-list compact">
            <div v-for="row in summary.archetypes" :key="row.key" class="stats-row">
              <div class="stats-row-head">
                <span>{{ row.label }}</span>
                <strong>{{ row.percentage.toFixed(1) }}%</strong>
              </div>
              <div class="stats-track">
                <span :style="{ width: rowWidth(row) }"></span>
              </div>
              <p>{{ row.count }} 次</p>
            </div>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<style scoped>
.stats-page {
  min-height: 100vh;
  background: #f7f9fb;
  color: #2f3a45;
  padding: 64px 20px;
}

.stats-hero,
.stats-toolbar,
.stats-total,
.stats-grid,
.stats-empty {
  max-width: 1120px;
  margin-left: auto;
  margin-right: auto;
}

.stats-hero {
  margin-bottom: 28px;
}

.stats-kicker {
  margin: 0 0 8px;
  color: #2f996a;
  font-weight: 800;
}

.stats-hero h1 {
  margin: 0;
  font-size: clamp(38px, 6vw, 68px);
  line-height: 1.05;
}

.stats-hero p:last-child {
  max-width: 680px;
  margin: 18px 0 0;
  color: #61707e;
  font-size: 17px;
  line-height: 1.7;
}

.stats-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
}

.stats-toolbar label {
  display: grid;
  gap: 6px;
  color: #61707e;
  font-size: 13px;
  font-weight: 700;
}

.stats-toolbar select,
.stats-toolbar button {
  min-height: 42px;
  border: 1px solid #dce4eb;
  border-radius: 8px;
  background: #fff;
  color: #2f3a45;
  font-weight: 700;
}

.stats-toolbar select {
  min-width: 220px;
  padding: 0 12px;
}

.stats-toolbar button {
  padding: 0 18px;
  cursor: pointer;
}

.stats-total {
  margin-bottom: 18px;
  padding: 18px 20px;
  border: 1px solid #e4ebf1;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-total span {
  color: #61707e;
  font-weight: 700;
}

.stats-total strong {
  font-size: 34px;
}

.stats-empty {
  border: 1px dashed #d6e0e8;
  border-radius: 8px;
  padding: 24px;
  background: #fff;
  color: #61707e;
  line-height: 1.7;
}

.stats-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 18px;
}

.stats-panel {
  border: 1px solid #e4ebf1;
  border-radius: 8px;
  background: #fff;
  padding: 20px;
}

.stats-panel:first-child {
  grid-row: span 2;
}

.stats-panel h2 {
  margin: 0 0 16px;
  font-size: 22px;
}

.stats-list {
  display: grid;
  gap: 14px;
}

.stats-list.compact {
  gap: 12px;
}

.stats-row {
  display: grid;
  gap: 7px;
}

.stats-row-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 14px;
  font-weight: 800;
}

.stats-row-head strong {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.stats-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef3f6;
}

.stats-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #2f996a;
}

.stats-row p {
  margin: 0;
  color: #7a8793;
  font-size: 12px;
}

@media (max-width: 860px) {
  .stats-page {
    padding: 36px 14px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-panel:first-child {
    grid-row: auto;
  }
}
</style>
