import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/**", "drizzle/**", "dist/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "error",
      "no-undef": "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
