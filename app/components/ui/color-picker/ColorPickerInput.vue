<script setup lang="ts">
import { cn } from "~/lib/utils";
import { Input } from "../input";
import type { HTMLAttributes } from "vue";
import { COLOR_PICKER_KEY, type ColorPickerContext } from "./types";
import { formatColor, parseColor } from "./color.utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const context = inject<ColorPickerContext>(COLOR_PICKER_KEY);
if (!context)
  throw new Error("ColorPickerInput must be used within ColorPickerRoot");

const { color, disabled, setColor, format } = context;

const localValue = ref("");

// Sync local value when context color or format changes
watch(
  [() => color.value, () => format.value],
  ([newColor, newFormat]) => {
    const formatted = formatColor(
      newColor,
      newFormat as "hex" | "rgb" | "hsv" | "oklch",
    );
    if (formatted.toLowerCase() !== localValue.value.toLowerCase()) {
      localValue.value = formatted;
    }
  },
  { immediate: true, deep: true },
);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  localValue.value = value;
  const parsed = parseColor(value);
  if (parsed) {
    // Only update if it's materially different to avoid jitter
    if (
      formatColor(parsed, format.value as "hex" | "rgb" | "hsv" | "oklch") !==
      formatColor(color.value, format.value as "hex" | "rgb" | "hsv" | "oklch")
    ) {
      setColor(parsed);
    }
  }
};
</script>

<template>
  <Input
    :value="localValue"
    :disabled="disabled"
    :class="cn('font-mono', props.class)"
    @input="handleInput"
  />
</template>
