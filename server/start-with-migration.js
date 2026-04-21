// Start script that runs migration before starting the server
const { execSync } = require('child_process');

console.log('Running database migration...');

try {
  execSync('node server/migrate-add-ticket-id.js', { stdio: 'inherit' });
  console.log('Migration completed, starting server...');
  require('./index.js');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
