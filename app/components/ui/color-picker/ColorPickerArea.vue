<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useMouseInElement, useEventListener } from "@vueuse/core";
import { cn } from "~/lib/utils";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
  }>(),
  {
    class: "",
  },
);

const emit = defineEmits<{
  (e: "change", { x, y }: { x: number; y: number }): void;
}>();

const areaRef = ref<HTMLDivElement | null>(null);
const { elementX, elementY, elementWidth, elementHeight } =
  useMouseInElement(areaRef);
const isDragging = ref(false);

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

let rafId: number | null = null;

const updatePosition = () => {
  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    const w = elementWidth.value ?? 0;
    const h = elementHeight.value ?? 0;

    if (w && h) {
      const x = clamp(elementX.value / w);
      const y = clamp(elementY.value / h);
      emit("change", { x, y });
    }
    rafId = null;
  });
};

const onPointerDown = (e: PointerEvent) => {
  isDragging.value = true;
  updatePosition();
  const el = areaRef.value as HTMLElement;
  if (el && typeof el.setPointerCapture === "function") {
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to set pointer capture", err);
    }
  }
};

const onPointerUp = (e: PointerEvent) => {
  isDragging.value = false;
  const el = areaRef.value as HTMLElement;
  if (el && typeof el.releasePointerCapture === "function") {
    try {
      el.releasePointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to release pointer capture", err);
    }
  }
};

useEventListener(window, "pointermove", () => {
  if (isDragging.value) {
    updatePosition();
  }
});

useEventListener(window, "pointerup", onPointerUp);

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    ref="areaRef"
    class="relative h-full w-full cursor-crosshair touch-none select-none"
    :class="cn(props.class)"
    @pointerdown="onPointerDown"
  >
    <slot />
  </div>
</template>
