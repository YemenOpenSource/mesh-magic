<script setup lang="ts">
import Input from "../input/Input.vue";
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const color = defineModel<string>({
  type: String,
  required: false,
  default: "#000000",
});
</script>

<template>
  <div>
    <Input
      v-model="color"
      data-slot="color-picker-header"
      :class="cn(props.class)"
    />
  </div>
</template>
