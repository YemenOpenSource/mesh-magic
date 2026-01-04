<script setup lang="ts">
import { inject, computed, type HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";
import { COLOR_PICKER_KEY, type ColorPickerContext } from "./types";
import { ColorPickerArea, ColorPickerIndicator } from ".";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const context = inject<ColorPickerContext>(COLOR_PICKER_KEY);
if (!context)
  throw new Error("ColorPickerSaturation must be used within ColorPickerRoot");

const { hsv, previewColor, setHsv } = context;

const backgroundStyle = computed(() => ({
  backgroundColor: previewColor.value?.hex || "#ff0000",
  backgroundImage: `
    linear-gradient(to top, #000, transparent),
    linear-gradient(to right, #fff, transparent)
  `,
}));
</script>

<template>
  <div
    class="h-full w-full aspect-square rounded-lg bg-neutral-300 dark:bg-neutral-800 forced-colors:bg-[GrayText] overflow-hidden"
    :class="cn(props.class)"
    :style="backgroundStyle"
  >
    <ColorPickerArea
      :x="hsv.s"
      :y="1 - hsv.v"
      label="Saturation and brightness"
      :aria-value-text="`Saturation ${Math.round(hsv.s * 100)}%, Brightness ${Math.round(hsv.v * 100)}%`"
      @change="({ x, y }) => setHsv({ s: x, v: 1 - y })"
    >
      <slot>
        <ColorPickerIndicator type="saturation" class="size-4" />
      </slot>
    </ColorPickerArea>
  </div>
</template>
