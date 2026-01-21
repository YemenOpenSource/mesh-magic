
<script setup lang="ts">
import { Delete02Icon, Edit02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/vue";
import { useSavedGradients, type SavedGradient } from "~/composables/useSavedGradients";
import { useMeshGradient } from "~/composables/useMeshGradient";

const open = defineModel<boolean>("open", { default: false });

const { savedGradients, loadGradient, deleteGradient, renameGradient, duplicateGradient, loadFromStorage } = useSavedGradients();
const { config } = useMeshGradient();

const editingId = ref<string | null>(null);
const editingName = ref("");

// Load from storage when dialog opens
watch(open, (isOpen) => {
  if (isOpen && import.meta.client) {
    loadFromStorage();
  }
});

onMounted(() => {
  if (import.meta.client) {
    loadFromStorage();
  }
});

const startEditing = (id: string, currentName: string) => {
  editingId.value = id;
  editingName.value = currentName;
};

const saveEdit = (id: string) => {
  if (editingName.value.trim()) {
    renameGradient(id, editingName.value);
  }
  editingId.value = null;
  editingName.value = "";
};

const cancelEdit = () => {
  editingId.value = null;
  editingName.value = "";
};

const handleLoadGradient = (gradient: SavedGradient) => {
  loadGradient(gradient, config);
  open.value = false;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-2xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>My Gradients</DialogTitle>
        <DialogDescription>
          Load, rename, or delete your saved gradients
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="savedGradients.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <p class="text-muted-foreground text-sm">
          No saved gradients yet. Save your current gradient to get started!
        </p>
      </div>

      <div
        v-else
        class="space-y-3 overflow-y-auto max-h-[50vh] pr-2"
      >
        <div
          v-for="gradient in savedGradients"
          :key="gradient.id"
          class="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
        >
          <div class="flex items-start gap-3">
            <!-- Preview -->
            <div
              class="relative w-20 h-20 rounded-md overflow-hidden shrink-0 border cursor-pointer"
              @click="handleLoadGradient(gradient)"
            >
              <div
                class="absolute inset-0"
                :style="{
                  backgroundColor: gradient.config.baseColor?.hex || '#020617',
                }"
              >
                <div
                  v-for="layer in gradient.config.layers"
                  :key="layer.id"
                  class="absolute"
                  :style="{
                    left: `${layer.x[0]}%`,
                    top: `${layer.y[0]}%`,
                    width: `${layer.size}px`,
                    height: `${layer.size}px`,
                    backgroundColor: layer.color?.hex || '#000',
                    opacity: (layer.opacity?.[0] ?? 100) / 100,
                    filter: `blur(${layer.blur[0] || 0}px)`,
                    borderRadius: layer.borderRadius || '50%',
                    transform: 'translate(-50%, -50%)',
                  }"
                />
              </div>
            </div>

            <!-- Info and Actions -->
            <div class="flex-1 min-w-0">
              <div
                v-if="editingId === gradient.id"
                class="flex items-center gap-2 mb-2"
              >
                <Input
                  v-model="editingName"
                  class="h-8"
                  @keydown.enter="saveEdit(gradient.id)"
                  @keydown.esc="cancelEdit"
                />
                <Button
                  size="sm"
                  @click="saveEdit(gradient.id)"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  @click="cancelEdit"
                >
                  Cancel
                </Button>
              </div>
              <div
                v-else
                class="flex items-start justify-between gap-2"
              >
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium truncate">
                    {{ gradient.name }}
                  </h3>
                  <p class="text-xs text-muted-foreground">
                    {{ gradient.config.layers.length }} layers • Updated {{ formatDate(gradient.updatedAt) }}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-8 w-8"
                    @click="startEditing(gradient.id, gradient.name)"
                  >
                    <HugeiconsIcon
                      :icon="Edit02Icon"
                      class="h-4 w-4"
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-8 w-8"
                    @click="duplicateGradient(gradient.id)"
                  >
                    <HugeiconsIcon
                      :icon="Copy01Icon"
                      class="h-4 w-4"
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-8 w-8 text-destructive hover:text-destructive"
                    @click="deleteGradient(gradient.id)"
                  >
                    <HugeiconsIcon
                      :icon="Delete02Icon"
                      class="h-4 w-4"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          @click="open = false"
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
