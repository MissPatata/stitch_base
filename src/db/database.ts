import { MikroORM } from '@mikro-orm/core';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import config from './mikro-orm.config';

export let orm: MikroORM;

export async function initDatabase(forceReset = false) {
    console.log('🔍 Checking database initialization...');

    // Ensure database directory exists
    const dbPath = config.dbName as string;
    const dbDir = dirname(dbPath);

    if (!existsSync(dbDir)) {
        console.log(`📁 Creating database directory: ${dbDir}`);
        mkdirSync(dbDir, { recursive: true });
    }

    // Check if database file exists
    const dbExists = existsSync(dbPath);
    console.log(
        `📊 Database file exists: ${dbExists ? '✅' : '❌'} (${dbPath})`,
    );

    // Initialize MikroORM
    orm = await MikroORM.init(config);
    const generator = orm.getSchemaGenerator();

    if (forceReset) {
        console.log(
            '🗑️ Force reset requested - dropping and recreating schema...',
        );
        await generator.dropSchema();
        await generator.createSchema();
        console.log('✅ Schema recreated successfully');
    } else if (!dbExists) {
        console.log("🚀 Database doesn't exist - creating initial schema...");
        await generator.createSchema();
        console.log('✅ Initial schema created successfully');
    } else {
        console.log('🔧 Checking if schema update is needed...');

        try {
            // Check if schema needs updating
            const updateSql = await generator.getUpdateSchemaSQL();

            // Handle both string and array return types
            const sqlStatements = Array.isArray(updateSql)
                ? updateSql
                : [updateSql];
            const hasUpdates =
                sqlStatements.length > 0 &&
                sqlStatements.some(sql => sql.trim());

            if (hasUpdates) {
                console.log('📝 Schema differences detected:');
                sqlStatements.forEach(sql => {
                    if (sql.trim()) console.log(`   ${sql}`);
                });

                console.log('🔄 Updating schema...');
                await generator.updateSchema();
                console.log('✅ Schema updated successfully');
            } else {
                console.log('✅ Schema is up to date');
            }
        } catch (error) {
            console.warn(
                '⚠️ Could not check schema differences, ensuring schema exists...',
            );
            await generator.ensureDatabase();
            await generator.updateSchema();
            console.log('✅ Schema ensured and updated');
        }
    }

    return orm;
}

export function getEntityManager() {
    return orm.em.fork();
}

export async function closeDatabase() {
    if (orm) {
        await orm.close();
    }
}
