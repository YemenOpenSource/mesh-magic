<script setup lang="ts">
import { cn } from "~/lib/utils";
import { inject, computed, type HTMLAttributes } from "vue";
import { COLOR_PICKER_KEY, type ColorPickerContext } from "./types";
import { ColorPickerArea, ColorPickerIndicator } from ".";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    orientation?: "horizontal" | "vertical";
  }>(),
  {
    class: "",
    orientation: "horizontal",
  },
);

const context = inject<ColorPickerContext>(COLOR_PICKER_KEY);
if (!context)
  throw new Error("ColorPickerHue must be used within ColorPickerRoot");

const { hsv, setHsv } = context;

const backgroundStyle = computed(() => ({
  background: `linear-gradient(${
    props.orientation === "horizontal" ? "to right" : "to bottom"
  }, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
}));
</script>

<template>
  <div
    :class="cn('w-full rounded relative overflow-hidden', props.class)"
    :style="backgroundStyle"
  >
    <ColorPickerArea
      :x="hsv.h / 360"
      label="Hue"
      :orientation="props.orientation"
      :aria-value-text="`${Math.round(hsv.h)}°`"
      @change="({ x }) => setHsv({ h: x * 360 })"
    >
      <slot>
        <ColorPickerIndicator type="hue" class="size-4" />
      </slot>
    </ColorPickerArea>
  </div>
</template>
