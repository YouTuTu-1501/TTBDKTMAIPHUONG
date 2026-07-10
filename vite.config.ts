import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Thay "quan-ly-trung-tam" bằng đúng tên repository của bạn
  base: '/TTBDKTMAIPHUONG/', 
})
