import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/@mediapipe/pose/*",
          dest: "./pose/",
        },
        {
          src: "./node_modules/@mediapipe/selfie_segmentation/*",
          dest: "./selfie_segmentation/",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["@artcom/r3f-mediapipe-particles"],
  },
})
