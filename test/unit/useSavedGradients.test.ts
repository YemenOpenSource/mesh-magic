import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { MeshConfig } from "../../app/composables/useMeshGradient";
import { parseColor } from "../../app/components/ui/color-picker/color.utils";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

// Mock vue-sonner
vi.mock("vue-sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useDebounceFn to execute immediately in tests
vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual("@vueuse/core");
  return {
    ...actual,
    useDebounceFn: (fn: (...args: unknown[]) => unknown) => fn, // Execute immediately without debounce
  };
});

// Mock useState to use regular ref in tests
const stateMap = new Map<string, unknown>();

mockNuxtImport("useState", () => {
  return <T>(key: string, init?: () => T) => {
    if (!stateMap.has(key)) {
      stateMap.set(key, ref(init ? init() : undefined));
    }
    return stateMap.get(key);
  };
});

describe("useSavedGradients", () => {
  const mockConfig: MeshConfig = {
    baseColor: parseColor("#020617"),
    layers: [
      {
        id: 1,
        color: parseColor("#ff0000"),
        x: [50],
        y: [50],
        blur: [100],
        opacity: [80],
        size: 64,
        borderRadius: "50%",
      },
    ],
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Clear the state map between tests
    const keys = Array.from(stateMap.keys());
    keys.forEach((key) => stateMap.delete(key));
  });

  // Dynamically import the composable after mocks are set up
  const getComposable = async () => {
    const module = await import("../../app/composables/useSavedGradients");
    return module.useSavedGradients;
  };

  describe("saveGradient", () => {
    it("should save a gradient with auto-generated name", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, savedGradients } = useSavedGradients();

      const saved = saveGradient(mockConfig);

      expect(saved.name).toBe("Gradient 1");
      expect(savedGradients.value).toHaveLength(1);
    });

    it("should save a gradient with custom name", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, savedGradients } = useSavedGradients();

      const saved = saveGradient(mockConfig, "My Custom Gradient");

      expect(saved.name).toBe("My Custom Gradient");
      expect(savedGradients.value[0]?.name).toBe("My Custom Gradient");
    });

    it("should persist to localStorage", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient } = useSavedGradients();

      saveGradient(mockConfig, "Test Gradient");

      const stored = localStorage.getItem("mesh-magic-saved-gradients");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("Test Gradient");
    });
  });

  describe("deleteGradient", () => {
    it("should delete a gradient by id", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, deleteGradient, savedGradients } =
        useSavedGradients();

      const saved = saveGradient(mockConfig, "To Delete");
      expect(savedGradients.value).toHaveLength(1);

      deleteGradient(saved.id);
      expect(savedGradients.value).toHaveLength(0);
    });

    it("should update localStorage after deletion", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, deleteGradient } = useSavedGradients();

      const saved = saveGradient(mockConfig);
      deleteGradient(saved.id);

      const stored = localStorage.getItem("mesh-magic-saved-gradients");
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });
  });

  describe("renameGradient", () => {
    it("should rename a gradient", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, renameGradient, savedGradients } =
        useSavedGradients();

      const saved = saveGradient(mockConfig, "Old Name");
      renameGradient(saved.id, "New Name");

      expect(savedGradients.value[0]?.name).toBe("New Name");
    });

    it("should trim whitespace from new name", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, renameGradient, savedGradients } =
        useSavedGradients();

      const saved = saveGradient(mockConfig);
      renameGradient(saved.id, "  Trimmed Name  ");

      expect(savedGradients.value[0]?.name).toBe("Trimmed Name");
    });
  });

  describe("loadGradient", () => {
    it("should load a gradient into the config ref", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, loadGradient } = useSavedGradients();
      const configRef = ref<MeshConfig>({
        baseColor: parseColor("#000000"),
        layers: [],
      });

      const testConfig: MeshConfig = {
        baseColor: parseColor("#020617"),
        layers: [
          {
            id: 1,
            color: parseColor("#ff0000"),
            x: [50],
            y: [50],
            blur: [100],
            opacity: [80],
            size: 64,
            borderRadius: "50%",
          },
        ],
      };

      const saved = saveGradient(testConfig);
      loadGradient(saved, configRef);

      expect(configRef.value.layers[0]?.x[0]).toBe(50);
    });
  });

  describe("duplicateGradient", () => {
    it("should create a copy of a gradient", async () => {
      const useSavedGradients = await getComposable();
      const { saveGradient, duplicateGradient, savedGradients } =
        useSavedGradients();

      const saved = saveGradient(mockConfig, "Original");
      duplicateGradient(saved.id);

      expect(savedGradients.value).toHaveLength(2);
      expect(savedGradients.value[0]?.name).toBe("Original (Copy)");
    });
  });

  describe("loadFromStorage", () => {
    it("should load gradients from localStorage on initialization", async () => {
      const testData = [
        {
          id: "test-1",
          name: "Test Gradient",
          config: mockConfig,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      localStorage.setItem(
        "mesh-magic-saved-gradients",
        JSON.stringify(testData),
      );

      const useSavedGradients = await getComposable();
      const { savedGradients, loadFromStorage } = useSavedGradients();
      loadFromStorage();

      expect(savedGradients.value).toHaveLength(1);
      expect(savedGradients.value[0]?.name).toBe("Test Gradient");
    });

    it("should handle empty localStorage", async () => {
      const useSavedGradients = await getComposable();
      const { savedGradients, loadFromStorage } = useSavedGradients();
      loadFromStorage();

      expect(savedGradients.value).toHaveLength(0);
    });
  });
});
