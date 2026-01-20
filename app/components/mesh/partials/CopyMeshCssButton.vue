<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const { copyMeshCSS } = useMeshGradient();
</script>

<template>
  <Button
    aria-label="Copy CSS"
    aria-description="Copy CSS to clipboard"
    size="default"
    class="text-sidebar-primary-foreground shadow"
    v-bind="$attrs"
    @click="copyMeshCSS"
  >
    Copy CSS
  </Button>
</template>
