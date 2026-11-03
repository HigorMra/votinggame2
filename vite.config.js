import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Keep the development server available only on this PC; the production local
// bridge also binds to loopback for OBS Browser Source.
export default defineConfig({ plugins: [react()], server: { host: '127.0.0.1' } })
