<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { ensureAdsenseScript, getAdsenseClient, requestAdsenseSlot } from '../utils/adsense'

const props = withDefaults(defineProps<{
  slot: string
  label?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
}>(), {
  label: '广告',
  format: 'auto',
})

const adsenseClient = getAdsenseClient()
const trimmedSlot = computed(() => props.slot.trim())
const isEnabled = computed(() => adsenseClient.length > 0 && trimmedSlot.value.length > 0)

onMounted(() => {
  if (!isEnabled.value) {
    return
  }

  ensureAdsenseScript()
  requestAdsenseSlot()
})
</script>

<template>
  <section v-if="isEnabled" class="adsense-block" aria-label="广告位">
    <div class="adsense-head">
      <span>{{ label }}</span>
    </div>
    <ins
      class="adsbygoogle adsense-slot"
      style="display:block"
      :data-ad-client="adsenseClient"
      :data-ad-slot="trimmedSlot"
      :data-ad-format="format"
      data-full-width-responsive="true"
    ></ins>
  </section>
</template>

<style scoped>
.adsense-block {
  border: 1px solid #e7eaed;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;
}

.adsense-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #7b8690;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.adsense-slot {
  min-height: 120px;
}
</style>
