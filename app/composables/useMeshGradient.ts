import { parseColor } from "~/components/ui/color-picker/color.utils";
import type { ColorValue } from "~/components/ui/color-picker/types";
import { themes } from "~/utils/themes";

const BASE_COLOR = "#020617";

/* Types */
export type Layer = {
  id: number;
  color: ColorValue;
  x: number[];
  y: number[];
  blur: number[];
  size: number;
  borderRadius: string;
};

export type MeshConfig = {
  baseColor: ColorValue;
  layers: Layer[];
};

type Region =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

/* Helpers */
export const randomHex = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateOrganicRadius = () => {
  const r = () => Math.floor(Math.random() * 50 + 30) + "%";
  return `${r()} ${r()} ${r()} ${r()} / ${r()} ${r()} ${r()} ${r()}`;
};

const randomRegion = (): Region => {
  const regions: Region[] = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "center",
  ];
  return regions[Math.floor(Math.random() * regions.length)] as Region;
};

const randomPositionByRegion = () => {
  switch (randomRegion()) {
    case "top-left":
      return { x: rand(5, 35), y: rand(5, 35) };
    case "top-right":
      return { x: rand(65, 95), y: rand(5, 35) };
    case "bottom-left":
      return { x: rand(5, 35), y: rand(65, 95) };
    case "bottom-right":
      return { x: rand(65, 95), y: rand(65, 95) };
    case "center":
    default:
      return { x: rand(35, 65), y: rand(35, 65) };
  }
};

const makeLayer = (color?: ColorValue): Layer => {
  const { x, y } = randomPositionByRegion();

  return {
    id: Date.now() + Math.random(),
    color: color ?? parseColor(randomHex()),
    x: [x],
    y: [y],
    size: rand(40, 50),
    blur: [rand(80, 90)],
    borderRadius: generateOrganicRadius(),
  };
};

const config = ref<MeshConfig>({
  baseColor: parseColor(BASE_COLOR),
  layers:
    themes.cosmic?.map((c) => ({
      id: Math.random() + Date.now(),
      color: c,
      x: [rand(35, 65)],
      y: [rand(35, 65)],
      size: rand(40, 50),
      blur: [rand(80, 90)],
      borderRadius: generateOrganicRadius(),
    })) ?? [],
});

export function useMeshGradient() {
  const addLayer = (color?: ColorValue) => {
    config.value.layers.push(makeLayer(color));
  };

  const removeLayer = (index: number) => {
    config.value.layers.splice(index, 1);
  };

  const duplicateLayer = (index: number) => {
    const source = config.value.layers[index];
    if (!source) return;
    const dup = { ...source, id: Date.now() + Math.random() };
    config.value.layers.splice(index + 1, 0, dup);
  };

  const updateLayer = (index: number, layer: Layer) => {
    config.value.layers.splice(index, 1, layer);
  };

  const randomize = (minLayers = 3, maxLayers = 8, newBaseColor?: string) => {
    if (newBaseColor) {
      config.value.baseColor = parseColor(newBaseColor);
    }

    const count = Math.floor(
      Math.random() * (maxLayers - minLayers + 1) + minLayers,
    );

    const newLayers: Layer[] = [];
    for (let i = 0; i < count; i++) {
      newLayers.push(makeLayer());
    }
    config.value.layers = newLayers;
  };

  const applyTheme = (name: keyof typeof themes) => {
    const t = themes[name];
    if (!t) return;
    config.value.layers = t.map((c) => makeLayer(c));
  };

  const reset = (defaultBase = BASE_COLOR) => {
    config.value.baseColor = parseColor(defaultBase);
    if (themes.cosmic) {
      config.value.layers = (themes.cosmic as ColorValue[]).map((c) =>
        makeLayer(c),
      );
    } else {
      randomize(3, 7);
    }
  };

  return {
    config,
    addLayer,
    removeLayer,
    duplicateLayer,
    updateLayer,
    randomize,
    applyTheme,
    reset,
  };
}
