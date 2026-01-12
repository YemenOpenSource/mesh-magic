<script setup lang="ts">
type SidebarContext = {
  collapsed: boolean;
};

const collapsed = ref(false);

provide<SidebarContext>("sidebar", {
  get collapsed() {
    return collapsed.value;
  },
});
</script>

<template>
  <aside
    class="bg-card border-border flex h-dvh w-full flex-col overflow-y-auto border-t lg:w-96 lg:border-t-0 lg:border-l"
  >
    <slot />
  </aside>
</template>
