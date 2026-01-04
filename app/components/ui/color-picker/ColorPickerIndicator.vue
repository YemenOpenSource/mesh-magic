<script setup lang="ts">
import { inject, computed, type HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";
import { COLOR_PICKER_KEY, type ColorPickerContext } from "./types";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  type?: "saturation" | "hue" | "alpha";
  left?: string | number;
  top?: string | number;
  color?: string;
}>();

const context = inject<ColorPickerContext>(COLOR_PICKER_KEY);

const indicatorStyle = computed(() => {
  const t = props.type;
  let l = props.left;
  let top = props.top;
  let c = props.color;

  if (context) {
    const { hsv, previewColor, color: selectedColor } = context;

    if (t === "saturation") {
      l ??= hsv.value.s * 100;
      top ??= (1 - hsv.value.v) * 100;
      c ??= selectedColor.value.hex;
    } else if (t === "hue") {
      l ??= (hsv.value.h / 360) * 100;
      top ??= 50;
      c ??= previewColor.value.hex;
    } else if (t === "alpha") {
      l ??= hsv.value.a * 100;
      top ??= 50;
      c ??= selectedColor.value.hex;
    }
  }

  return {
    left: typeof l === "number" ? `${l}%` : l,
    top: typeof top === "number" ? `${top}%` : top,
    backgroundColor: c || "transparent",
    touchAction: "none",
    forcedColorAdjust: "none" as const,
    boxShadow: "0 0 0 2px white, 0 0 4px rgba(0,0,0,0.5)",
  };
});
</script>

<template>
  <div
    role="presentation"
    aria-hidden="true"
    class="absolute z-[1] -translate-x-1/2 -translate-y-1/2 size-4 rounded-full border-2 border-white box-border pointer-events-none"
    :class="cn(props.class)"
    :style="indicatorStyle"
  />
</template>
