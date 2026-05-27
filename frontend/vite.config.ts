import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
// style-import plugin removed due to build issues; using manual chunking

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // visualizer generates an interactive bundle report at `dist/stats.html`
    visualizer({ filename: 'dist/stats.html', open: false }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor.react';
            if (id.includes('antd')) return 'vendor.antd';
            if (id.includes('recharts')) return 'vendor.recharts';
            if (id.includes('@reduxjs') || id.includes('react-redux')) return 'vendor.redux';
            if (id.includes('@tanstack') || id.includes('react-query')) return 'vendor.react-query';
            if (id.includes('react-router-dom')) return 'vendor.router';
            if (id.includes('dayjs')) return 'vendor.dayjs';
            if (id.includes('formik') || id.includes('yup')) return 'vendor.form';
            if (id.includes('@ant-design/icons') || id.includes('react-icons')) return 'vendor.icons';
            if (id.includes('axios')) return 'vendor.axios';
            return 'vendor.misc';
          }
        }
      }
    }
  }
})
