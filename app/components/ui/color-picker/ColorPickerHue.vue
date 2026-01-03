<script setup lang="ts">
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";
import { ref, computed } from "vue";
import { COLOR_PICKER_KEY, type ColorPickerContext } from "./types";
import { Color } from "./color.utils";
import { useMouseInElement, useEventListener } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    orientation?: "horizontal" | "vertical";
  }>(),
  {
    class: "",
    orientation: "horizontal",
  },
);

const colorPickerContext = inject<ColorPickerContext>(COLOR_PICKER_KEY);
const currentPreviewColor = computed(
  () => colorPickerContext?.previewColor.value,
);

// Generate a hue gradient across 0..360°
const hueStops = computed(() => {
  const stops: string[] = [];
  for (let h = 0; h <= 360; h += 30) {
    stops.push(new Color({ h, s: 1, v: 1, a: 1 }).hex);
  }
  return stops;
});

const backgroundStyle = computed(() => ({
  backgroundImage: `linear-gradient(${
    props.orientation === "horizontal" ? "to right" : "to bottom"
  }, ${hueStops.value.join(", ")})`,
}));

// Indicator: position base on orientation
const indicatorPos = computed(() => {
  const h = currentPreviewColor.value?.hsv?.h ?? 0;
  const percent = `${(Math.max(0, Math.min(360, h)) / 360) * 100}%`;
  return props.orientation === "horizontal"
    ? { left: percent, top: "50%" }
    : { left: "50%", top: percent };
});

const hueRef = ref<HTMLDivElement | null>(null);
const { elementX, elementY, elementWidth, elementHeight, isOutside } =
  useMouseInElement(hueRef);
const isDragging = ref(false);

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

let rafId: number | null = null;
// Update hue from pointer position
const updateHueFromPosition = () => {
  if (!colorPickerContext || rafId || isOutside.value) return;

  rafId = requestAnimationFrame(() => {
    const w = elementWidth.value ?? 0;
    const h = elementHeight.value ?? 0;
    if (w && h) {
      let percent = 0;
      if (props.orientation === "horizontal") {
        percent = clamp(elementX.value, 0, w) / w;
      } else {
        percent = clamp(elementY.value, 0, h) / h;
      }
      const hue = percent * 360;
      colorPickerContext.setHsv({ h: hue });
    }
    rafId = null;
  });
};

const onPointerDown = (e?: PointerEvent) => {
  isDragging.value = true;
  updateHueFromPosition();
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
  updateHueFromPosition();
});
useEventListener(window, "pointerup", onPointerUp);
</script>

<template>
  <div
    ref="hueRef"
    class="relative h-10 cursor-crosshair overflow-hidden w-full rounded bg-neutral-300 dark:bg-neutral-800 forced-colors:bg-[GrayText]"
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
        backgroundColor: currentPreviewColor?.hex ?? '#000',
        touchAction: 'none',
        forcedColorAdjust: 'none',
        boxShadow: 'black 0px 0px 0px 1px, black 0px 0px 0px 1px inset',
      }"
    />
  </div>
</template>
