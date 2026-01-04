<script setup lang="ts">
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";
import { Color } from "./color.utils";

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
</script>

<template>
  <div
    class="h-10 w-full rounded bg-neutral-300 dark:bg-neutral-800 forced-colors:bg-[GrayText]"
    :class="cn(props.class)"
    :style="backgroundStyle"
  >
    <slot />
  </div>
</template>
