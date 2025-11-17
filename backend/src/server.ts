import app from './app';
import env from './config/env';
import logger from './utils/logger';
import prisma from './config/database';

const PORT = env.PORT || 5000;

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await testDatabaseConnection();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 MediCare API running on port ${PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🌍 API Version: ${env.API_VERSION}`);
      logger.info(`📍 URL: http://localhost:${PORT}/api/${env.API_VERSION}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        logger.info('HTTP server closed');
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
