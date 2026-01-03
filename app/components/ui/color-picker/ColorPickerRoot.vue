<script setup lang="ts">
import { Popover } from "../popover";
import { parseColor } from "./color.utils";

import {
  COLOR_PICKER_KEY,
  type ColorPickerContext,
  type ColorValue,
  type HsvColor, // Assuming HsvColor is also from types
} from "./types";

const color = defineModel<ColorValue>({ required: true });

const emit = defineEmits<{
  (e: "change", value: ColorValue): void;
}>();

// The interactive source of truth (preserves Hue/Saturation when V=0)
const hsvRef = ref<HsvColor>(color.value.hsv);
// The preview base color (the vibrant hue used for picker backgrounds)
const previewColorRef = ref<ColorValue>(
  parseColor({ ...color.value.hsv, s: 1, v: 1 }),
);

// Flag to prevent reactivity loops and jitter during internal updates
let isInternalUpdate = false;

// Function to update the HSV state and sync others
const updateHsv = (hsvUpdate: Partial<HsvColor>) => {
  isInternalUpdate = true;
  const newHsv = { ...hsvRef.value, ...hsvUpdate };
  hsvRef.value = newHsv;

  // Derive the new ColorValue from this HSV
  const newColor = parseColor(newHsv);
  color.value = newColor;

  // We only update the preview color if Hue changed
  if (hsvUpdate.h !== undefined) {
    previewColorRef.value = parseColor({
      h: hsvUpdate.h,
      s: 1,
      v: 1,
      a: 1,
    });
  }

  emit("change", newColor);
  // Reset flag after the current tick to allow the watcher to skip
  nextTick(() => {
    isInternalUpdate = false;
  });
};

// Sync internal hsvRef when the model changes externally
watch(
  () => color.value,
  (newVal) => {
    // Skip if this change originated from internal updateHsv to avoid jitter
    if (isInternalUpdate) return;

    // If it's materially different, update our high-precision reference
    // but preserve Hue if it's a grayscale change
    const incomingHsv = newVal.hsv;
    if (incomingHsv.v > 0 && incomingHsv.s > 0) {
      hsvRef.value = incomingHsv;
    } else {
      hsvRef.value = {
        ...hsvRef.value,
        a: incomingHsv.a,
        v: incomingHsv.v,
      };
    }
  },
  { deep: true },
);

provide<ColorPickerContext>(COLOR_PICKER_KEY, {
  hsv: hsvRef,
  color: color,
  previewColor: previewColorRef,
  setHsv: updateHsv,
  emitColorChange: (newColor: ColorValue) => {
    emit("change", newColor);
  },
  setColor: (newColor: ColorValue) => {
    color.value = newColor;
    hsvRef.value = newColor.hsv;
  },
  setPreviewColor: (newColor: ColorValue) => {
    previewColorRef.value = newColor;
  },
});

onUpdated(() => {
  console.log("updated");
});
</script>

<template>
  <section class="p-4 flex flex-col gap-4">
    <Popover as-child>
      <slot />
    </Popover>
  </section>
</template>
