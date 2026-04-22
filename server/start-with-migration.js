// Start script that runs migrations before starting the server
const { execSync } = require('child_process');

console.log('Running database migrations...');

try {
  execSync('node server/migrate-add-ticket-id.js', { stdio: 'inherit' });
  execSync('node server/migrate-add-email.js', { stdio: 'inherit' });
  console.log('Migrations completed, starting server...');
  require('./index.js');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
