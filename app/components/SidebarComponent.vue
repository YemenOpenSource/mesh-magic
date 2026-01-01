<script setup lang="ts">
import ColorPicker from "./ui/color-picker/ColorPicker.vue";
</script>

<template>
  <SidebarRoot>
    <SidebarHeader>
      <SidebarTitle>Mesh Gradient</SidebarTitle>
      <SidebarDescription>
        Customize your gradient with precision
      </SidebarDescription>
    </SidebarHeader>

    <SidebarContent>
      <!-- Base color -->
      <ColorPicker />
    </SidebarContent>
  </SidebarRoot>
</template>
