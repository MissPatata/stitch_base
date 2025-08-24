import 'reflect-metadata';
import { initDatabase, closeDatabase } from './database';

/**
 * Database startup script
 * This should be run before starting the application
 * Works for both development and production environments
 */
async function startup() {
    try {
        console.log('🚀 Starting database initialization...');

        // Initialize database (never force reset in production)
        await initDatabase(false);

        console.log('✅ Database startup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database startup failed:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

// Run startup if this file is executed directly
if (require.main === module) {
    startup();
}

export { startup };
