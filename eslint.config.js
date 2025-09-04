import globals from "globals";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  prettierConfig,
  {
    rules: {
      // 你可以在这里覆盖或添加规则
    },
  },
];
