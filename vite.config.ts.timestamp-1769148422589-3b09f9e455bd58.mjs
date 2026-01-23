// vite.config.ts
import { defineConfig } from "file:///E:/%E8%AE%A1%E5%88%92%E7%A8%8B%E5%BA%8F/node_modules/vite/dist/node/index.js";
import react from "file:///E:/%E8%AE%A1%E5%88%92%E7%A8%8B%E5%BA%8F/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///E:/%E8%AE%A1%E5%88%92%E7%A8%8B%E5%BA%8F/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "\u65F6\u5149\u6E05\u5355 & \u5F85\u529E",
        short_name: "\u65F6\u5149\u6E05\u5355",
        description: "Modern Time Planner & Todo PWA",
        theme_color: "#f97316",
        background_color: "#fcfaf8",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "https://cdn-icons-png.flaticon.com/512/2921/2921226.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "https://cdn-icons-png.flaticon.com/512/2921/2921226.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  server: {
    port: 3e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxcdThCQTFcdTUyMTJcdTdBMEJcdTVFOEZcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFx1OEJBMVx1NTIxMlx1N0EwQlx1NUU4RlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovJUU4JUFFJUExJUU1JTg4JTkyJUU3JUE4JThCJUU1JUJBJThGL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ21hc2tlZC1pY29uLnN2ZyddLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdcdTY1RjZcdTUxNDlcdTZFMDVcdTUzNTUgJiBcdTVGODVcdTUyOUUnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdcdTY1RjZcdTUxNDlcdTZFMDVcdTUzNTUnLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTW9kZXJuIFRpbWUgUGxhbm5lciAmIFRvZG8gUFdBJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyNmOTczMTYnLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmNmYWY4JyxcclxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXHJcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9jZG4taWNvbnMtcG5nLmZsYXRpY29uLmNvbS81MTIvMjkyMS8yOTIxMjI2LnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdodHRwczovL2Nkbi1pY29ucy1wbmcuZmxhdGljb24uY29tLzUxMi8yOTIxLzI5MjEyMjYucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDBcclxuICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMk8sU0FBUyxvQkFBb0I7QUFDeFEsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZSx3QkFBd0IsaUJBQWlCO0FBQUEsTUFDeEUsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1QsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
