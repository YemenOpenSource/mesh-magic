<script setup lang="ts">
import { PopoverTrigger } from "../popover";
import type { ColorPickerContext, ProviderKey } from "./types";
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const color = inject<ColorPickerContext>("color-picker" as ProviderKey);
const backgroundColor = computed(() => color?.color?.value);
</script>

<template>
  <PopoverTrigger :as-child="true">
    <Button
      :class="cn('size-10 p-0 rounded-md', props.class)"
      :style="{ backgroundColor: backgroundColor }"
      aria-label="Select Color"
    />
  </PopoverTrigger>
</template>
