<script setup lang="ts">
import ColorPickeRoot from "./ColorPickeRoot.vue";
import ColorPickerBody from "./ColorPickerBody.vue";
import ColorPickerPreview from "./ColorPickerPreview.vue";
import ColorPickerHeader from "./ColorPickerHeader.vue";
import type { ColorPickerContext, ProviderKey } from "./types";

const color = ref("#fff");
provide<ColorPickerContext, ProviderKey>("color-picker", {
  color: color,
});
</script>

<template>
  <!-- <ClientOnly> -->
  <ColorPickeRoot>
    <ColorPickerPreview />
    <ColorPickerBody>
      <ColorPickerHeader v-model:color="color" />

      <!-- </ColorPickerHeader> -->
    </ColorPickerBody>
    <!-- <ColorPickerSwatches />
        <ColorPickerSaturation />



        <ColorPickerHue />
        <ColorPickerAlpha />
        <ColorPickerInputs /> -->
  </ColorPickeRoot>
  <!-- </ClientOnly> -->
</template>
