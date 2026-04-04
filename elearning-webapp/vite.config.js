import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — cached longest, changes least often
          'vendor-react': ['react', 'react-dom'],
          // Routing
          'vendor-router': ['react-router-dom'],
          // Charts (heavy, only used in Dashboard)
          'vendor-charts': ['recharts'],
          // Video player + its streaming deps (hls, dash) — isolated so other pages don't load it
          'vendor-player': ['react-player'],
        },
      },
    },
    // Raise the warning threshold slightly (streaming libs are legitimately large)
    chunkSizeWarningLimit: 600,
  },
})