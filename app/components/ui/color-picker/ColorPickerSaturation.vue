<script setup lang="ts">
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";
import { COLOR_PICKER_KEY, type ColorPickerContext } from "./types";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const colorPickerContext = inject<ColorPickerContext>(COLOR_PICKER_KEY);
const previewColor = computed(() => colorPickerContext?.previewColor.value);

const hueHex = computed(() => previewColor.value?.hex);
const backgroundStyle = computed(() => ({
  background: `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)),
  linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),
  ${hueHex.value}`,
}));
</script>

<template>
  <div
    class="h-full w-full aspect-square rounded-lg bg-neutral-300 dark:bg-neutral-800 forced-colors:bg-[GrayText]"
    :class="cn(props.class)"
    :style="backgroundStyle"
  >
    <slot />
  </div>
</template>
