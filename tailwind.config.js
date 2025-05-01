```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "node_modules/preline/dist/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"),
    require("preline/plugin"),
    require("@tailwindcss/forms"),
  ],
  daisyui: {
    themes: [
      {
        black: {
          primary:         "#3b82f6", // blue-500
          "primary-content":"#ffffff",
          secondary:       "#10b981", // emerald-500
          "secondary-content":"#ffffff",
          accent:          "#22d3ee", // cyan-400
          "accent-content": "#000000",
          neutral:         "#1f2937", // gray-800
          "neutral-content":"#d1d5db", // gray-300
          "base-100":      "#111827", // gray-900
          "base-200":      "#1e293b", // gray-800
          "base-300":      "#374151", // gray-700
          "base-content":  "#f9fafb", // gray-50
          info:            "#0ea5e9", // sky-500
          "info-content":  "#ffffff",
          success:         "#22c55e", // green-500
          "success-content":"#ffffff",
          warning:         "#f59e0b", // amber-500
          "warning-content":"#000000",
          error:           "#ef4444", // red-500
          "error-content": "#ffffff",
          "--radius-selector": "0rem",
          "--radius-field":    "0rem",
          "--radius-box":      "0rem",
          "--size-selector":   "0.25rem",
          "--size-field":      "0.25rem",
          "--border":          "1px",
          "--depth":           "0",
          "--noise":           "0"
        }
      },
      {
        silk: {
          primary:         "#0d9488", // teal-600
          "primary-content":"#ffffff",
          secondary:       "#3b82f6", // blue-500
          "secondary-content":"#ffffff",
          accent:          "#14b8a6", // teal-400
          "accent-content": "#000000",
          neutral:         "#64748b", // slate-500
          "neutral-content":"#f1f5f9", // slate-100
          "base-100":      "#f8fafc", // slate-50
          "base-200":      "#e2e8f0", // slate-200
          "base-300":      "#cbd5e1", // slate-300
          "base-content":  "#0f172a", // slate-900
          info:            "#0284c7", // sky-600
          "info-content":  "#ffffff",
          success:         "#059669", // emerald-600
          "success-content":"#ffffff",
          warning:         "#d97706", // amber-600
          "warning-content":"#ffffff",
          error:           "#b91c1c", // red-700
          "error-content": "#ffffff",
          "--radius-selector": "0.5rem",
          "--radius-field":    "0.5rem",
          "--radius-box":      "1rem",
          "--size-selector":   "0.25rem",
          "--size-field":      "0.25rem",
          "--border":          "1px",
          "--depth":           "1",
          "--noise":           "0"
        }
      },
      // Built‑in DaisyUI themes
      "synthwave",
      "light",
      "dark",
      "luxury"
    ]
  }
};
```