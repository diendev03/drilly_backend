require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Starting migration...");

        // 1. Check if 'images' column exists or 'image_url' exists
        const [columns] = await connection.query("SHOW COLUMNS FROM transaction LIKE 'images'");
        if (columns.length > 0) {
            console.log("'images' column already exists. Skipping rename.");
        } else {
            console.log("Renaming 'image_url' to 'images' and changing type to TEXT...");
            await connection.query("ALTER TABLE transaction CHANGE COLUMN image_url images TEXT");
        }

        // 2. Convert existing plain strings to JSON array
        // Logic: If it doesn't start with '[', wrap it in ["..."]
        console.log("Converting existing data to JSON arrays...");
        await connection.query(`
            UPDATE transaction 
            SET images = CONCAT('["', images, '"]') 
            WHERE images IS NOT NULL 
            AND images != ''
            AND images NOT LIKE '[%'
        `);

        console.log("Migration completed successfully.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
