import 'dotenv/config';
import app from './app';
import { initializeBuckets } from '../shared/config/minio'; // Cập nhật lại đường dẫn tới config MinIO

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  // Khởi tạo MinIO (Bỏ qua nếu chưa cài đặt Docker)
  try {
    await initializeBuckets();
  } catch (error) {
    console.warn('⚠️  MinIO chưa sẵn sàng — File upload sẽ không hoạt động.');
    console.warn('   Chạy: docker-compose up -d  để khởi động MinIO');
  }

  app.listen(Number(PORT), HOST, () => {
    console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
    console.log(`📋 Health check API: http://${HOST}:${PORT}/health`);
  });
}

bootstrap();