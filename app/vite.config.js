import { defineConfig } from "vite";
import httpProxy from "http-proxy";
import react from "@vitejs/plugin-react";

httpProxy.createProxyServer();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },
  resolve: {
    alias: {
      src: "/src",
      components: "/src/components",
      layouts: "/src/layouts",
      pages: "/src/pages",
      stores: "/src/stores",
      hooks: "/src/hooks",
      images: "/src/images",
      utils: "/src/utils",
      config: "/src/config",
    },
  },
  server: {
    host: true,
    port: 8882,
    proxy: {
      "/api": {
        target: "http://csx_server:8880",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace("/api", ""),
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
});
