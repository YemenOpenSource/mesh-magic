<script setup lang="ts">
import { useTimeoutFn } from "@vueuse/core";
import { useSidebar } from "~/components/ui/sidebar/utils";

defineOptions({
  inheritAttrs: false,
});

const { copyMeshCSS, showDots } = useMeshGradient();
const sidebar = useSidebar();
const isCopying = ref(false);

const handleCopy = async () => {
  isCopying.value = true;

  // Record sidebar state
  const wasOpen = sidebar.isMobile.value
    ? sidebar.openMobile.value
    : sidebar.open.value;
  const wasShowDots = showDots.value;

  // Close sidebar
  if (sidebar.isMobile.value) {
    sidebar.setOpenMobile(false);
  } else {
    sidebar.setOpen(false);
  }
  // Hide dots
  showDots.value = false;

  // Wait for sidebar transition
  const { start } = useTimeoutFn(async () => {
    await copyMeshCSS();

    // Restore sidebar state if it was open
    if (wasOpen) {
      if (sidebar.isMobile.value) {
        sidebar.setOpenMobile(true);
      } else {
        sidebar.setOpen(true);
      }
    }
    // Restore dots
    showDots.value = wasShowDots;
    isCopying.value = false;
  }, 400);

  start();
};
</script>

<template>
  <Button
    aria-label="Copy CSS"
    aria-description="Copy CSS to clipboard"
    size="default"
    class="text-sidebar-primary-foreground shadow"
    v-bind="$attrs"
    :disabled="isCopying"
    @click="handleCopy"
  >
    <LazySpinner v-if="isCopying" />
    <template v-else> Copy CSS </template>
  </Button>
</template>
