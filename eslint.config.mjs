// https://github.com/nuxt/eslint/discussions/618
import withNuxt from "./.nuxt/eslint.config.mjs";
import prettierPlugin from "eslint-plugin-prettier";

export default withNuxt({
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    "vue/block-order": ["error", { order: ["script", "template", "style"] }],
    "vue/attributes-order": [
      "error",
      {
        order: [
          // 1. Place TWO_WAY_BINDING (v-model) first
          "TWO_WAY_BINDING",

          // 2. Put the rest of the recommended Vue groups after
          "DEFINITION",
          "LIST_RENDERING",
          "CONDITIONALS",
          "RENDER_MODIFIERS",
          "GLOBAL",
          "UNIQUE",
          "OTHER_DIRECTIVES",
          "OTHER_ATTR",
          "EVENTS",
          "CONTENT",
        ],
        // You can also enable alphabetical sorting within these groups if desired
        alphabetical: false,
      },
    ],
  },
});
