import { toast } from "vue-sonner";
import { useDebounceFn } from "@vueuse/core";
import type { MeshConfig } from "./useMeshGradient";

/**
 * Represents a saved gradient with metadata.
 */
export type SavedGradient = {
  /** Unique identifier for the saved gradient. */
  id: string;
  /** User-defined name for the gradient. */
  name: string;
  /** The mesh gradient configuration. */
  config: MeshConfig;
  /** Timestamp when the gradient was saved. */
  createdAt: number;
  /** Timestamp when the gradient was last updated. */
  updatedAt: number;
};

const STORAGE_KEY = "mesh-magic-saved-gradients";
const MAX_SAVED_GRADIENTS = 50; // Limit to prevent localStorage bloat

/**
 * Generates a unique ID for saved gradients.
 * @returns A unique string ID.
 */
const generateId = () => `gradient-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Generates a default name for a new gradient.
 * @param existingNames - Array of existing gradient names.
 * @returns A unique gradient name.
 */
const generateDefaultName = (existingNames: string[]): string => {
  let counter = 1;
  let name = `Gradient ${counter}`;
  
  while (existingNames.includes(name)) {
    counter++;
    name = `Gradient ${counter}`;
  }
  
  return name;
};

/**
 * Deep clones an object using structuredClone (faster than JSON methods).
 * Falls back to JSON methods for older browsers or incompatible objects.
 */
const deepClone = <T>(obj: T): T => {
  try {
    if (typeof structuredClone !== "undefined") {
      return structuredClone(obj);
    }
  } catch {
    // Fall through to JSON method if structuredClone fails
  }
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Composable for managing saved gradients in localStorage.
 */
export function useSavedGradients() {
  const savedGradients = useState<SavedGradient[]>("saved-gradients", () => []);
  const isLoaded = useState<boolean>("saved-gradients-loaded", () => false);

  /**
   * Loads saved gradients from localStorage.
   */
  const loadFromStorage = () => {
    if (!import.meta.client) return; // Only run on client-side
    if (isLoaded.value) return; // Already loaded
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        savedGradients.value = JSON.parse(stored);
      }
      isLoaded.value = true;
    } catch (error) {
      console.error("Failed to load saved gradients:", error);
      toast.error("Failed to load saved gradients");
    }
  };

  /**
   * Saves gradients to localStorage with debouncing to prevent excessive writes.
   */
  const saveToStorage = useDebounceFn(() => {
    if (!import.meta.client) return; // Only run on client-side
    
    try {
      // Limit the number of saved gradients
      const gradientsToSave = savedGradients.value.slice(0, MAX_SAVED_GRADIENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gradientsToSave));
      
      // Update the state if we trimmed any gradients
      if (gradientsToSave.length < savedGradients.value.length) {
        savedGradients.value = gradientsToSave;
        toast.info("Storage limit reached", {
          description: `Only the ${MAX_SAVED_GRADIENTS} most recent gradients are kept`,
        });
      }
    } catch (error) {
      console.error("Failed to save gradients:", error);
      toast.error("Failed to save gradients");
    }
  }, 300); // Debounce by 300ms

  /**
   * Saves the current gradient configuration.
   * @param config - The mesh gradient configuration to save.
   * @param name - Optional custom name for the gradient.
   * @returns The saved gradient object.
   */
  const saveGradient = (config: MeshConfig, name?: string): SavedGradient => {
    const existingNames = savedGradients.value.map((g) => g.name);
    const gradientName = name || generateDefaultName(existingNames);
    
    const newGradient: SavedGradient = {
      id: generateId(),
      name: gradientName,
      config: deepClone(config),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    savedGradients.value.unshift(newGradient);
    saveToStorage();

    toast.success("Gradient saved", {
      description: `"${gradientName}" has been saved to your collection`,
    });

    return newGradient;
  };

  /**
   * Deletes a saved gradient.
   * @param id - The ID of the gradient to delete.
   */
  const deleteGradient = (id: string) => {
    const index = savedGradients.value.findIndex((g) => g.id === id);
    if (index === -1) return;

    const gradient = savedGradients.value[index];
    savedGradients.value.splice(index, 1);
    saveToStorage();

    toast.success("Gradient deleted", {
      description: `"${gradient?.name}" has been removed`,
    });
  };

  /**
   * Renames a saved gradient.
   * @param id - The ID of the gradient to rename.
   * @param newName - The new name for the gradient.
   */
  const renameGradient = (id: string, newName: string) => {
    const gradient = savedGradients.value.find((g) => g.id === id);
    if (!gradient) return;

    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast.error("Invalid name", {
        description: "Gradient name cannot be empty",
      });
      return;
    }

    gradient.name = trimmedName;
    gradient.updatedAt = Date.now();
    saveToStorage();

    toast.success("Gradient renamed", {
      description: `Renamed to "${trimmedName}"`,
    });
  };

  /**
   * Loads a saved gradient into the current configuration.
   * @param gradient - The saved gradient to load.
   * @param config - The current mesh config ref to update.
   */
  const loadGradient = (gradient: SavedGradient, config: Ref<MeshConfig>) => {
    config.value = deepClone(gradient.config);
    
    toast.success("Gradient loaded", {
      description: `"${gradient.name}" is now active`,
    });
  };

  /**
   * Updates an existing saved gradient with new configuration.
   * @param id - The ID of the gradient to update.
   * @param config - The new configuration.
   */
  const updateGradient = (id: string, config: MeshConfig) => {
    const gradient = savedGradients.value.find((g) => g.id === id);
    if (!gradient) return;

    gradient.config = deepClone(config);
    gradient.updatedAt = Date.now();
    saveToStorage();

    toast.success("Gradient updated", {
      description: `"${gradient.name}" has been updated`,
    });
  };

  /**
   * Duplicates a saved gradient.
   * @param id - The ID of the gradient to duplicate.
   */
  const duplicateGradient = (id: string) => {
    const gradient = savedGradients.value.find((g) => g.id === id);
    if (!gradient) return;

    const newName = `${gradient.name} (Copy)`;
    
    const duplicate: SavedGradient = {
      id: generateId(),
      name: newName,
      config: deepClone(gradient.config),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    savedGradients.value.unshift(duplicate);
    saveToStorage();

    toast.success("Gradient duplicated", {
      description: `Created "${newName}"`,
    });
  };

  return {
    savedGradients,
    saveGradient,
    deleteGradient,
    renameGradient,
    loadGradient,
    updateGradient,
    duplicateGradient,
    loadFromStorage,
  };
}
