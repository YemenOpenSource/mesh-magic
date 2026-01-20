<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <Button
    aria-label="Download mesh"
    aria-description="Download mesh to file"
    size="default"
    class="text-sidebar-primary-foreground shadow"
    v-bind="$attrs"
    @click="emit('click')"
  >
    Download
  </Button>
</template>
