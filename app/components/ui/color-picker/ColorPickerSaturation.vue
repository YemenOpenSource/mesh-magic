<script setup lang="ts">
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";
import { COLOR_PICKER_KEY, type ColorPickerContext } from "./types";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const colorPickerContext = inject<ColorPickerContext>(COLOR_PICKER_KEY);
const currentColor = computed(() => colorPickerContext?.color.value);
const previewColor = computed(() => colorPickerContext?.previewColor.value);

const hueHex = computed(() => previewColor.value?.hex);
const backgroundStyle = computed(() => ({
  background: `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)),
  linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),
  ${hueHex.value}`,
}));

const indicatorPos = computed(() => {
  const hsv = colorPickerContext?.hsv.value;
  if (!hsv) return { left: "50%", top: "50%" };
  const s = clamp(hsv.s, 0, 1);
  const v = clamp(hsv.v, 0, 1);
  return {
    left: `${s * 100}%`,
    top: `${(1 - v) * 100}%`,
  };
});

const saturationRef = ref<HTMLDivElement | null>(null);
const { elementX, elementY, elementWidth, elementHeight, isOutside } =
  useMouseInElement(saturationRef);
const isDragging = ref(false);
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

let rafId: number | null = null;
const updateColorFromPosition = () => {
  if (!colorPickerContext || rafId || isOutside.value) return;

  rafId = requestAnimationFrame(() => {
    const w = elementWidth.value ?? 0;
    const h = elementHeight.value ?? 0;
    if (w && h) {
      const s = clamp(elementX.value / w, 0, 1);
      const v = clamp(1 - elementY.value / h, 0, 1);
      colorPickerContext.setHsv({ s, v });
    }
    rafId = null;
  });
};

const onPointerDown = (e?: PointerEvent) => {
  isDragging.value = true;
  updateColorFromPosition();
  if (e && (e.target as Element).setPointerCapture) {
    try {
      (e.target as Element).setPointerCapture((e as PointerEvent).pointerId);
    } catch (err) {
      console.warn("Failed to set pointer capture", err);
    }
  }
};
const onPointerUp = (e?: PointerEvent) => {
  isDragging.value = false;
  if (e && (e.target as Element).releasePointerCapture) {
    try {
      (e.target as Element).releasePointerCapture(
        (e as PointerEvent).pointerId,
      );
    } catch (err) {
      console.warn("Failed to release pointer capture", err);
    }
  }
};

useEventListener(window, "pointermove", () => {
  if (!isDragging.value) return;
  updateColorFromPosition();
});
useEventListener(window, "pointerup", onPointerUp);
</script>

<template>
  <div
    ref="saturationRef"
    class="relative h-full cursor-crosshair overflow-hidden w-full aspect-square rounded-lg bg-neutral-300 dark:bg-neutral-800 forced-colors:bg-[GrayText]"
    :class="cn(props.class)"
    :style="backgroundStyle"
    @pointerdown="onPointerDown"
  >
    <div
      role="presentation"
      class="absolute -translate-x-1/2 -translate-y-1/2 size-4.5 rounded-full border-2 border-white box-border"
      :style="{
        left: indicatorPos.left,
        top: indicatorPos.top,
        backgroundColor: currentColor?.hex,
        touchAction: 'none',
        forcedColorAdjust: 'none',
        boxShadow: 'black 0px 0px 0px 1px, black 0px 0px 0px 1px inset',
      }"
    />
  </div>
</template>
