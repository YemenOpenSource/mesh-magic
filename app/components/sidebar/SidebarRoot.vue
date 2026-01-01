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
    class="w-full border-t lg:border-t-0 lg:w-96 bg-card border-border lg:border-l flex flex-col"
  >
    <slot />
  </aside>
</template>
