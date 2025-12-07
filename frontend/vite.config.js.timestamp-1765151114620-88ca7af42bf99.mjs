// vite.config.js
import { defineConfig } from "file:///home/runner/workspace/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///home/runner/workspace/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5e3,
    headers: {
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3000 http://localhost:5000 ws://localhost:* wss:; frame-ancestors 'self'; form-action 'self'; base-uri 'self'; object-src 'none'"
    },
    allowedHosts: true,
    cors: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 5e3
  },
  build: {
    // Optimize chunk strategy for faster first load
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react")) {
            return "react-core";
          }
          if (id.includes("node_modules/react-router-dom")) {
            return "react-router";
          }
          if (id.includes("node_modules/@mui/material")) {
            return "mui-core";
          }
          if (id.includes("node_modules/@mui/icons-material")) {
            return "mui-icons";
          }
          if (id.includes("node_modules/axios")) {
            return "api";
          }
          if (id.includes("node_modules/i18next")) {
            return "i18n";
          }
          if (id.includes("node_modules/socket.io-client")) {
            return "socket";
          }
          if (id.includes("components/Sidebar") || id.includes("components/UnifiedHeader")) {
            return "heavy-components";
          }
          if (id.includes("components/Admin")) {
            return "admin-components";
          }
          if (id.includes("pages/Tender") || id.includes("pages/Offer") || id.includes("pages/Bid")) {
            return "tender-pages";
          }
          if (id.includes("pages/Invoice") || id.includes("pages/Financial") || id.includes("pages/Budget")) {
            return "financial-pages";
          }
          if (id.includes("pages/Admin") || id.includes("pages/SuperAdmin") || id.includes("pages/User")) {
            return "admin-pages";
          }
        }
      }
    },
    // Larger limit for better loading
    chunkSizeWarningLimit: 1e3,
    // Minify aggressively
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true
      }
    },
    // Enable source maps only in dev
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Increase report size
    reportCompressedSize: false,
    // Optimize lib entry point
    lib: void 0
  },
  // Optimize resolution
  resolve: {
    alias: {
      "@": "/src",
      "@assets": "/src/assets",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@hooks": "/src/hooks",
      "@utils": "/src/utils",
      "@contexts": "/src/contexts"
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/icons-material",
      "axios",
      "i18next",
      "react-i18next"
    ],
    exclude: ["@vitest/ui"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3Jrc3BhY2UvZnJvbnRlbmQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHBvcnQ6IDUwMDAsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ1gtRnJhbWUtT3B0aW9ucyc6ICdTQU1FT1JJR0lOJyxcbiAgICAgICdYLUNvbnRlbnQtVHlwZS1PcHRpb25zJzogJ25vc25pZmYnLFxuICAgICAgJ1JlZmVycmVyLVBvbGljeSc6ICdzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJyxcbiAgICAgICdDb250ZW50LVNlY3VyaXR5LVBvbGljeSc6XG4gICAgICAgIFwiZGVmYXVsdC1zcmMgJ3NlbGYnOyBzY3JpcHQtc3JjICdzZWxmJyAndW5zYWZlLWlubGluZScgJ3Vuc2FmZS1ldmFsJyBjZG4uanNkZWxpdnIubmV0OyBzdHlsZS1zcmMgJ3NlbGYnICd1bnNhZmUtaW5saW5lJyBmb250cy5nb29nbGVhcGlzLmNvbSBjZG4uanNkZWxpdnIubmV0OyBmb250LXNyYyAnc2VsZicgZm9udHMuZ3N0YXRpYy5jb207IGltZy1zcmMgJ3NlbGYnIGRhdGE6IGh0dHBzOjsgY29ubmVjdC1zcmMgJ3NlbGYnIGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCBodHRwOi8vbG9jYWxob3N0OjUwMDAgd3M6Ly9sb2NhbGhvc3Q6KiB3c3M6OyBmcmFtZS1hbmNlc3RvcnMgJ3NlbGYnOyBmb3JtLWFjdGlvbiAnc2VsZic7IGJhc2UtdXJpICdzZWxmJzsgb2JqZWN0LXNyYyAnbm9uZSdcIixcbiAgICB9LFxuICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcbiAgICBjb3JzOiB0cnVlLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTozMDAwJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICB3czogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICBwb3J0OiA1MDAwLFxuICB9LFxuICBidWlsZDoge1xuICAgIC8vIE9wdGltaXplIGNodW5rIHN0cmF0ZWd5IGZvciBmYXN0ZXIgZmlyc3QgbG9hZFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICAvLyBDb3JlIGRlcGVuZGVuY2llc1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0JykpIHtcbiAgICAgICAgICAgIHJldHVybiAncmVhY3QtY29yZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LXJvdXRlci1kb20nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdyZWFjdC1yb3V0ZXInO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AbXVpL21hdGVyaWFsJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnbXVpLWNvcmUnO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AbXVpL2ljb25zLW1hdGVyaWFsJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnbXVpLWljb25zJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvYXhpb3MnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdhcGknO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9pMThuZXh0JykpIHtcbiAgICAgICAgICAgIHJldHVybiAnaTE4bic7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3NvY2tldC5pby1jbGllbnQnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdzb2NrZXQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBTcGxpdCBsYXJnZSBjb21wb25lbnRzXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdjb21wb25lbnRzL1NpZGViYXInKSB8fCBpZC5pbmNsdWRlcygnY29tcG9uZW50cy9VbmlmaWVkSGVhZGVyJykpIHtcbiAgICAgICAgICAgIHJldHVybiAnaGVhdnktY29tcG9uZW50cyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIEFkbWluIGNvbXBvbmVudHNcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NvbXBvbmVudHMvQWRtaW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuICdhZG1pbi1jb21wb25lbnRzJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUGFnZXMgZ3JvdXBlZCBieSBmZWF0dXJlXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3BhZ2VzL1RlbmRlcicpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcygncGFnZXMvT2ZmZXInKSB8fFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3BhZ2VzL0JpZCcpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RlbmRlci1wYWdlcyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwYWdlcy9JbnZvaWNlJykgfHxcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwYWdlcy9GaW5hbmNpYWwnKSB8fFxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ3BhZ2VzL0J1ZGdldCcpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZpbmFuY2lhbC1wYWdlcyc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdwYWdlcy9BZG1pbicpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcygncGFnZXMvU3VwZXJBZG1pbicpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcygncGFnZXMvVXNlcicpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2FkbWluLXBhZ2VzJztcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gTGFyZ2VyIGxpbWl0IGZvciBiZXR0ZXIgbG9hZGluZ1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICAvLyBNaW5pZnkgYWdncmVzc2l2ZWx5XG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIG9ubHkgaW4gZGV2XG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAvLyBPcHRpbWl6ZSBDU1NcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgLy8gSW5jcmVhc2UgcmVwb3J0IHNpemVcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsXG4gICAgLy8gT3B0aW1pemUgbGliIGVudHJ5IHBvaW50XG4gICAgbGliOiB1bmRlZmluZWQsXG4gIH0sXG4gIC8vIE9wdGltaXplIHJlc29sdXRpb25cbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6ICcvc3JjJyxcbiAgICAgICdAYXNzZXRzJzogJy9zcmMvYXNzZXRzJyxcbiAgICAgICdAY29tcG9uZW50cyc6ICcvc3JjL2NvbXBvbmVudHMnLFxuICAgICAgJ0BwYWdlcyc6ICcvc3JjL3BhZ2VzJyxcbiAgICAgICdAaG9va3MnOiAnL3NyYy9ob29rcycsXG4gICAgICAnQHV0aWxzJzogJy9zcmMvdXRpbHMnLFxuICAgICAgJ0Bjb250ZXh0cyc6ICcvc3JjL2NvbnRleHRzJyxcbiAgICB9LFxuICB9LFxuICAvLyBPcHRpbWl6ZSBkZXBlbmRlbmN5IHByZS1idW5kbGluZ1xuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbXG4gICAgICAncmVhY3QnLFxuICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAncmVhY3Qtcm91dGVyLWRvbScsXG4gICAgICAnQG11aS9tYXRlcmlhbCcsXG4gICAgICAnQG11aS9pY29ucy1tYXRlcmlhbCcsXG4gICAgICAnYXhpb3MnLFxuICAgICAgJ2kxOG5leHQnLFxuICAgICAgJ3JlYWN0LWkxOG5leHQnLFxuICAgIF0sXG4gICAgZXhjbHVkZTogWydAdml0ZXN0L3VpJ10sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBK1EsU0FBUyxvQkFBb0I7QUFDNVMsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixN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
