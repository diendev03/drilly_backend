const dbPromise = require('./src/config/database');

(async () => {
    try {
        const db = await dbPromise;
        const [rows] = await db.execute('SELECT id, name, description FROM features');
        console.log('Features Data:', rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
