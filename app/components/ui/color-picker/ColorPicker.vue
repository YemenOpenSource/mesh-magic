<script setup lang="ts">
import {
  ColorPickerRoot,
  ColorPickerBody,
  ColorPickerPreview,
  ColorPickerSaturation,
  ColorPickerHue,
  ColorPickerArea,
  ColorPickerIndicator,
} from ".";
import type { ColorValue, ColorPickerProps } from "./types";

const props = defineProps<ColorPickerProps>();
const modelValue = defineModel<ColorValue | string>({ required: true });
const open = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  (e: "change", value: ColorValue): void;
}>();
</script>

<template>
  <ColorPickerRoot
    v-bind="props"
    v-model="modelValue"
    v-model:open="open"
    @change="(val) => emit('change', val)"
    v-slot="{
      hsv,
      color: selectedColor,
      previewColor,
      setHsv,
      format: currentFormat,
    }"
  >
    <ColorPickerPreview />
    <ColorPickerBody>
      <ColorPickerSaturation class="overflow-hidden mb-2">
        <ColorPickerArea @change="({ x, y }) => setHsv({ s: x, v: 1 - y })">
          <ColorPickerIndicator
            :left="hsv.s * 100"
            :top="(1 - hsv.v) * 100"
            :color="selectedColor.hex"
            class="size-4"
          />
        </ColorPickerArea>
      </ColorPickerSaturation>

      <div class="flex flex-col gap-4">
        <!-- Hue Slider -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between px-0.5">
            <span
              class="text-[11px] font-medium text-muted-foreground uppercase tracking-tight"
              >Hue</span
            >
            <span class="text-[11px] font-mono text-muted-foreground"
              >{{ Math.round(hsv.h) }}°</span
            >
          </div>
          <ColorPickerHue
            orientation="horizontal"
            class="h-3.5 rounded-full overflow-hidden"
          >
            <ColorPickerArea @change="({ x }) => setHsv({ h: x * 360 })">
              <ColorPickerIndicator
                :left="(hsv.h / 360) * 100"
                :top="50"
                :color="previewColor.hex"
                class="size-4"
              />
            </ColorPickerArea>
          </ColorPickerHue>
        </div>

        <!-- Input Section -->
        <div class="space-y-1.5">
          <span
            class="text-[11px] font-medium text-muted-foreground uppercase tracking-tight"
            >{{ currentFormat }}</span
          >
          <div class="flex gap-2">
            <div
              class="size-9 rounded-md border shrink-0 shadow-inner"
              :style="{ backgroundColor: selectedColor.hex }"
            />
            <ColorPickerInput class="h-9 text-xs" />
          </div>
        </div>
      </div>

      <!-- <slot name="extra" v-bind="{ hsv, color: selectedColor }" /> -->
    </ColorPickerBody>
  </ColorPickerRoot>
</template>
