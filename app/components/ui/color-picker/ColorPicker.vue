<script setup lang="ts">
import {
  ColorPickerRoot,
  ColorPickerBody,
  ColorPickerPreview,
  ColorPickerSaturation,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerInput,
  ColorPickerLabel,
  ColorPickerSwatch,
  ColorPickerSection,
  ColorPickerRow,
} from ".";
import type { ColorValue, ColorPickerProps } from "./types";

const props = defineProps<ColorPickerProps>();
const modelValue = defineModel<ColorValue | string>();
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
    v-slot="{ hsv, format: currentFormat }"
  >
    <ColorPickerPreview />
    <ColorPickerBody>
      <ColorPickerSaturation class="mb-2" />

      <ColorPickerSection class="gap-4">
        <!-- Hue Slider -->
        <ColorPickerSection>
          <ColorPickerRow class="justify-between px-0.5">
            <ColorPickerLabel>Hue</ColorPickerLabel>
            <ColorPickerLabel class="font-mono normal-case">
              {{ Math.round(hsv.h) }}°
            </ColorPickerLabel>
          </ColorPickerRow>
          <ColorPickerHue orientation="horizontal" class="h-3 rounded-full" />
        </ColorPickerSection>

        <!-- Alpha Slider -->
        <ColorPickerSection v-if="!props.disableAlpha">
          <ColorPickerRow class="justify-between px-0.5">
            <ColorPickerLabel>Alpha</ColorPickerLabel>
            <ColorPickerLabel class="font-mono normal-case">
              {{ Math.round(hsv.a * 100) }}%
            </ColorPickerLabel>
          </ColorPickerRow>
          <ColorPickerAlpha orientation="horizontal" class="h-3 rounded-full" />
        </ColorPickerSection>

        <!-- Input Section -->
        <ColorPickerSection>
          <ColorPickerLabel>{{ currentFormat }}</ColorPickerLabel>
          <ColorPickerRow>
            <ColorPickerSwatch />
            <ColorPickerInput />
          </ColorPickerRow>
        </ColorPickerSection>
      </ColorPickerSection>
    </ColorPickerBody>
  </ColorPickerRoot>
</template>
