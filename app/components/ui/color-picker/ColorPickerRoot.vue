<script setup lang="ts">
import { Popover } from "../popover";
import { formatColor, parseColor } from "./color.utils";

import {
  COLOR_PICKER_KEY,
  type ColorPickerContext,
  type ColorPickerProps,
  type ColorValue,
  type HsvColor, // Assuming HsvColor is also from types
} from "./types";

const props = withDefaults(defineProps<ColorPickerProps>(), {
  format: "hex",
  shape: "circle",
  disabled: false,
  disableAlpha: false,
  side: "bottom",
  align: "center",
  sideOffset: 4,
});

const colorModel = defineModel<ColorValue | string>({ required: true });
const openModel = defineModel<boolean>("open", { default: false });

// Normalize the model to ColorValue
const color = computed<ColorValue>({
  get: () => {
    return parseColor(colorModel.value);
  },
  set: (val) => {
    if (typeof colorModel.value === "string") {
      colorModel.value = formatColor(val, props.format);
    } else {
      colorModel.value = val;
    }
  },
});

const emit = defineEmits<{
  (e: "change", value: ColorValue): void;
}>();

// The interactive source of truth (preserves Hue/Saturation when V=0)
const hsvRef = ref<HsvColor>(color.value.hsv);
// The preview base color (the vibrant hue used for picker backgrounds)
const previewColorRef = ref<ColorValue>(
  parseColor({ h: color.value.hsv.h, s: 1, v: 1, a: 1 }),
);

// Flag to prevent reactivity loops and jitter during internal updates
let isInternalUpdate = false;

// Function to update the HSV state and sync others
const updateHsv = (hsvUpdate: Partial<HsvColor>) => {
  isInternalUpdate = true;
  const newHsv = { ...hsvRef.value, ...hsvUpdate };
  if (hsvUpdate.h !== undefined) {
    newHsv.h = Math.max(0, Math.min(360, Math.round(hsvUpdate.h)));
  }
  hsvRef.value = newHsv;

  // Derive the new ColorValue from this HSV
  const newColor = parseColor(newHsv);
  color.value = newColor;

  // Always keep the preview color in sync with the current hue
  previewColorRef.value = parseColor({
    h: newHsv.h,
    s: 1,
    v: 1,
    a: 1,
  });

  emit("change", newColor);
  nextTick(() => {
    isInternalUpdate = false;
  });
};

// Sync internal state when the model changes externally
watch(
  () => color.value,
  (newVal) => {
    if (isInternalUpdate) return;

    const incomingHsv = newVal.hsv;
    // Update active HSV but preserve Hue if it's a grayscale change to prevent visual jump
    if (incomingHsv.s > 0 && incomingHsv.v > 0) {
      hsvRef.value = { ...incomingHsv };
    } else {
      hsvRef.value = {
        ...hsvRef.value,
        s: incomingHsv.s,
        v: incomingHsv.v,
        a: incomingHsv.a,
      };
    }

    // Ensure preview color is updated
    previewColorRef.value = parseColor({
      h: hsvRef.value.h,
      s: 1,
      v: 1,
      a: 1,
    });
  },
  { deep: true },
);

const setColor = (newColor: ColorValue) => {
  color.value = newColor;
  hsvRef.value = newColor.hsv;
  previewColorRef.value = parseColor({ h: newColor.hsv.h, s: 1, v: 1, a: 1 });
};

const setPreviewColor = (newColor: ColorValue) => {
  previewColorRef.value = newColor;
};

provide<ColorPickerContext>(COLOR_PICKER_KEY, {
  hsv: hsvRef,
  color: color as unknown as Ref<ColorValue>,
  previewColor: previewColorRef,
  setHsv: updateHsv,
  emitColorChange: (newColor: ColorValue) => {
    emit("change", newColor);
  },
  setColor,
  setPreviewColor,
  disabled: computed(() => props.disabled),
  disableAlpha: computed(() => props.disableAlpha),
  shape: computed(() => props.shape),
  format: computed(() => props.format),
  popoverProps: {
    side: computed(() => props.side),
    align: computed(() => props.align),
    sideOffset: computed(() => props.sideOffset),
  },
});
</script>

<template>
  <Popover :open="openModel" @update:open="(val) => (openModel = val)">
    <slot
      :hsv="hsvRef"
      :color="color"
      :preview-color="previewColorRef"
      :set-hsv="updateHsv"
      :set-color="setColor"
      :set-preview-color="setPreviewColor"
      :open="openModel"
      :format="props.format"
    />
  </Popover>
</template>
