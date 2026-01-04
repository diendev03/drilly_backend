const dbPromise = require('./src/config/database');

async function removeExerciseWorkout() {
  let connection;
  try {
    connection = await dbPromise;
    console.log('🔄 Checking for exercise/workout tables...');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log('\n📋 Current tables:', tableNames.join(', '));

    const exerciseWorkoutTables = tableNames.filter(name => 
      name.toLowerCase().includes('exercise') || 
      name.toLowerCase().includes('workout')
    );

    if (exerciseWorkoutTables.length === 0) {
      console.log('\n✅ No exercise/workout tables found. Database is clean!');
      return;
    }

    console.log('\n🗑️  Tables to remove:', exerciseWorkoutTables.join(', '));
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of exerciseWorkoutTables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`   ✅ Dropped: ${table}`);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✨ Successfully removed all exercise/workout tables!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

removeExerciseWorkout();
