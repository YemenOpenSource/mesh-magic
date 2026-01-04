<script setup lang="ts">
import {
  ColorPickerRoot,
  ColorPickerBody,
  ColorPickerHeader,
  ColorPickerPreview,
  ColorPickerSaturation,
  ColorPickerHue,
  ColorPickerArea,
  ColorPickerIndicator,
} from ".";
import type { ColorValue } from "./types";
import { parseColor } from "./color.utils";

const color = defineModel<ColorValue>({
  default: () => parseColor("red"),
});
</script>

<template>
  <ColorPickerRoot
    v-model="color"
    v-slot="{ hsv, color: selectedColor, previewColor, setHsv }"
  >
    <ColorPickerPreview />
    <ColorPickerBody>
      <ColorPickerHeader>
        <ColorPickerSaturation class="mb-4">
          <ColorPickerArea @change="({ x, y }) => setHsv({ s: x, v: 1 - y })">
            <ColorPickerIndicator
              :left="hsv.s * 100"
              :top="(1 - hsv.v) * 100"
              :color="selectedColor.hex"
            />
          </ColorPickerArea>
        </ColorPickerSaturation>

        <div class="w-full flex justify-between">
          <span>Hue:</span>
          <span>{{ hsv.h }}°</span>
        </div>
        <ColorPickerHue orientation="horizontal">
          <ColorPickerArea @change="({ x }) => setHsv({ h: x * 360 })">
            <ColorPickerIndicator
              :left="(hsv.h / 360) * 100"
              :top="50"
              :color="previewColor.hex"
            />
          </ColorPickerArea>
        </ColorPickerHue>
      </ColorPickerHeader>
    </ColorPickerBody>
  </ColorPickerRoot>
</template>
