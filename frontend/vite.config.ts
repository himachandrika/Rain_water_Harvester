import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		port: Number(process.env.VITE_PORT) || 5173,
		host: process.env.VITE_HOST || 'localhost',
		proxy: {
			'/api': {
				target: process.env.VITE_API_URL || 'http://localhost:4000',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api/, '')
			}
		}
	},
	build: {
		outDir: 'dist',
		sourcemap: false,
		minify: 'terser',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					charts: ['chart.js', 'react-chartjs-2'],
					maps: ['leaflet', 'react-leaflet']
				}
			}
		},
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		}
	},
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version)
	}
});
