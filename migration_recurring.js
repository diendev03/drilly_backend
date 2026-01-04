const dbPromise = require('./src/config/database');

async function runMigration() {
    let connection;
    try {
        connection = await dbPromise;
        console.log('Connected to database for migration...');

        // 1. Create recurring_transactions table
        const createRecurringTable = `
      CREATE TABLE IF NOT EXISTS recurring_transactions (
	id INT AUTO_INCREMENT PRIMARY KEY,
	account_id INT NOT NULL,
	wallet_id INT,
	type ENUM('income', 'expense') NOT NULL,
	category INT,
	amount DECIMAL(15, 2) NOT NULL,
	note TEXT,
	frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
	start_date DATE NOT NULL,
	start_day INT NOT NULL,
	next_run_date DATE NOT NULL,
	status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
        await connection.query(createRecurringTable);
        console.log('Checked/Created recurring_transactions table.');

        // 2. Alter transaction table
        // Check if columns exist first to avoid errors on re-run, or just use try-catch for each ALTER
        try {
            await connection.query(`ALTER TABLE transaction ADD COLUMN source_recurring_id INT NULL`);
            console.log('Added source_recurring_id column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('source_recurring_id already exists.');
            else throw e;
        }

        try {
            await connection.query(`ALTER TABLE transaction ADD COLUMN run_date DATE NULL`);
            console.log('Added run_date column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('run_date already exists.');
            else throw e;
        }

        try {
            await connection.query(`ALTER TABLE transaction ADD COLUMN created_from ENUM('MANUAL', 'RECURRING') DEFAULT 'MANUAL'`);
            console.log('Added created_from column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('created_from already exists.');
            else throw e;
        }

        // 3. Add Unique Index
        try {
            await connection.query(`CREATE UNIQUE INDEX uniq_recurring_run ON transaction (source_recurring_id, run_date)`);
            console.log('Created unique index uniq_recurring_run.');
        } catch (e) {
            if (e.code === 'ER_DUP_KEYNAME') console.log('Index uniq_recurring_run already exists.');
            else throw e;
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
