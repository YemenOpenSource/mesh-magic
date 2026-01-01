<script setup lang="ts">
import { Popover } from "../popover";
</script>

<template>
  <section class="p-4 flex flex-col gap-4">
    <Popover as-child>
      <slot />
    </Popover>
  </section>
</template>
