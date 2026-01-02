require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [columns] = await connection.query("SHOW COLUMNS FROM transaction");
        console.log("Transaction Table Columns:");
        columns.forEach(col => console.log(`${col.Field}: ${col.Type}`));

        await connection.end();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkSchema();
