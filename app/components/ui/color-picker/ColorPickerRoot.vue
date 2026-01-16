<script setup lang="ts">
import { Popover } from "../popover";
import { formatColor, parseColor } from "./color.utils";

import {
  COLOR_PICKER_KEY,
  type ColorPickerContext,
  type ColorPickerProps,
  type ColorValue,
  type HsvColor,
  type OklchColor,
  type RgbColor,
} from "./types";

const props = withDefaults(defineProps<ColorPickerProps>(), {
  format: "hex",
  disabled: false,
  disableAlpha: false,
  side: "bottom",
  align: "center",
  sideOffset: 4,
});

const colorModel = defineModel<ColorValue | string>({ default: "#000000" });
const openModel = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  (e: "change", value: ColorValue): void;
}>();

// --- SMART MODEL SYNC ---
// The interactive source of truth (preserves Hue/Saturation when V=0)
const hsvRef = ref<HsvColor>(parseColor(colorModel.value).hsv);
// The preview base color (the vibrant hue used for picker backgrounds)
const previewColorRef = ref<ColorValue>(
  parseColor({ h: hsvRef.value.h, s: 1, v: 1, a: 1 }),
);

// Flag to prevent reactivity loops
let isInternalUpdate = false;

// Keeps track of the last known consistent state to detect external property changes
const lastSyncedColor = ref<ColorValue>(parseColor(colorModel.value));

const syncInternal = (
  newColor: ColorValue,
  updateModel = false,
  hsvOverride?: HsvColor,
) => {
  isInternalUpdate = true;
  lastSyncedColor.value = JSON.parse(JSON.stringify(newColor));

  // If we need to sync back to the user's model
  if (updateModel) {
    if (typeof colorModel.value === "object" && colorModel.value !== null) {
      Object.assign(colorModel.value, newColor);
    } else {
      colorModel.value = formatColor(newColor, props.format);
    }
  }

  // Update Hue Slider base preview
  previewColorRef.value = parseColor({
    h: hsvOverride?.h ?? newColor.hsv.h,
    s: 1,
    v: 1,
    a: 1,
  });

  // Update Internal HSV (preserving resolution)
  hsvRef.value = hsvOverride ? { ...hsvOverride } : { ...newColor.hsv };

  emit("change", newColor);

  nextTick(() => {
    isInternalUpdate = false;
  });
};

// 1. React to external model changes (including deep property changes)
watch(
  () => colorModel.value,
  (newVal) => {
    if (isInternalUpdate) return;

    // Detect which property changed to determine the driver
    const current = lastSyncedColor.value;
    let driver: string | ColorValue | RgbColor | HsvColor | OklchColor = newVal;

    if (typeof newVal === "object" && newVal !== null) {
      if (newVal.hex !== current.hex) {
        driver = newVal.hex;
      } else if (JSON.stringify(newVal.rgb) !== JSON.stringify(current.rgb)) {
        driver = newVal.rgb;
      } else if (JSON.stringify(newVal.hsv) !== JSON.stringify(current.hsv)) {
        driver = newVal.hsv;
      } else {
        return; // No meaningful change
      }
    }

    const consistent = parseColor(driver);
    syncInternal(consistent, true); // Re-sync to fill in other properties
  },
  { deep: true, immediate: true },
);

// 2. Methods for internal components
const updateHsv = (hsvUpdate: Partial<HsvColor>) => {
  const newHsv = { ...hsvRef.value, ...hsvUpdate };
  if (hsvUpdate.h !== undefined) {
    newHsv.h = Math.max(0, Math.min(360, Math.round(hsvUpdate.h)));
  }
  const consistent = parseColor(newHsv);
  syncInternal(consistent, true, newHsv);
};

const setColor = (newColor: ColorValue | string) => {
  syncInternal(parseColor(newColor), true);
};

const setPreviewColor = (newColor: ColorValue) => {
  previewColorRef.value = newColor;
};

provide<ColorPickerContext>(COLOR_PICKER_KEY, {
  hsv: hsvRef,
  color: lastSyncedColor,
  previewColor: previewColorRef,
  setHsv: updateHsv,
  emitColorChange: (newColor: ColorValue) => {
    emit("change", newColor);
  },
  setColor,
  setPreviewColor,
  disabled: computed(() => props.disabled),
  disableAlpha: computed(() => props.disableAlpha),
  open: computed(() => openModel.value),
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
      :color="lastSyncedColor"
      :preview-color="previewColorRef"
      :set-hsv="updateHsv"
      :set-color="setColor"
      :set-preview-color="setPreviewColor"
      :open="openModel"
      :format="props.format"
    />
  </Popover>
</template>
