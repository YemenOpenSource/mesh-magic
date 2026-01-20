<script setup lang="ts">
import {
  ArrowDataTransferHorizontalIcon,
  Plus,
  Recycle03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";

const { addLayer, reset, randomize } = useMeshGradient();
</script>

<template>
  <div class="space-y-2">
    <ButtonGroup class="w-full">
      <Button
        aria-label="add-layer-button"
        aria-labelledby="add-layer-button"
        variant="outline"
        class="flex-1"
        @click="addLayer()"
      >
        <HugeiconsIcon :icon="Plus" size="4" />
        Add
      </Button>
      <Button
        aria-label="reset-button"
        aria-labelledby="reset-button"
        variant="outline"
        class="flex-1"
        @click="reset()"
      >
        <HugeiconsIcon :icon="Recycle03Icon" size="4" />
        Reset
      </Button>
    </ButtonGroup>
    <Button
      aria-label="randomize-button"
      aria-labelledby="randomize-button"
      class="w-full flex-2"
      @click="randomize()"
    >
      <HugeiconsIcon :icon="ArrowDataTransferHorizontalIcon" size="4" />
      Randomize
    </Button>
  </div>
</template>
