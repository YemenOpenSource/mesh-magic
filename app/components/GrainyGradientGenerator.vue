<script setup lang="ts">
import { parseColor } from "~/components/ui/color-picker/color.utils";
import {
  SidebarRoot,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarContent,
} from "~/components/sidebar";
import { Input } from "~/components/ui/input";
import { ColorPicker } from "~/components/ui/color-picker";
import ExportActions from "~/components/ExportActions.vue";

const config = reactive({
  baseColor1: parseColor("#4f46e5"),
  baseColor2: parseColor("#db2777"),
  noiseOpacity: 0.2,
});

const gradientStyle = computed(() => {
  return `linear-gradient(45deg, ${config.baseColor1.hex}, ${config.baseColor2.hex})`;
});

const noiseStyle = computed(() => ({
  backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
  opacity: config.noiseOpacity,
  mixBlendMode: "overlay",
}));

const onDownloadImage = () => {
  alert("Download Image to be implemented");
};
</script>

<template>
  <div class="bg-background flex min-h-dvh flex-col lg:flex-row">
    <!-- Preview -->
    <div
      class="relative order-2 flex flex-1 items-center justify-center overflow-hidden lg:order-1"
    >
      <div
        class="relative flex h-full w-full items-center justify-center overflow-hidden"
        :style="{ background: gradientStyle }"
      >
        <div
          class="pointer-events-none absolute inset-0"
          :style="noiseStyle as any"
        />
        <span
          class="relative z-10 text-4xl font-bold text-white mix-blend-overlay"
          >PREVIEW</span
        >
      </div>
    </div>

    <!-- Sidebar -->
    <SidebarRoot>
      <SidebarHeader>
        <SidebarTitle>Grainy Gradient</SidebarTitle>
        <SidebarDescription>Add texture to your gradients</SidebarDescription>
      </SidebarHeader>

      <SidebarContent class="space-y-6">
        <div class="space-y-2">
          <span class="text-sm font-medium">Colors</span>
          <div class="flex gap-2">
            <ColorPicker v-model="config.baseColor1" />
            <ColorPicker v-model="config.baseColor2" />
          </div>
        </div>

        <div class="space-y-2">
          <span class="text-sm font-medium"
            >Noise Opacity: {{ Math.round(config.noiseOpacity * 100) }}%</span
          >
          <Input
            v-model.number="config.noiseOpacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
          />
        </div>

        <ExportActions
          :css="`background: ${gradientStyle};\nposition: relative;\n/* Add noise overlay pseudo-element manually or use a div with background-image */`"
          @download-image="onDownloadImage"
        />
      </SidebarContent>
    </SidebarRoot>
  </div>
</template>
