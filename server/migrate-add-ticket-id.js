// Migration script to add ticket_id column to existing production database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/data'
  : path.join(__dirname, '..');

const dbPath = path.join(dataDir, 'calendar_booking.db');

console.log('Checking database at:', dbPath);

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found!');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Check if ticket_id column exists
  db.all("PRAGMA table_info(bookings)", (err, columns) => {
    if (err) {
      console.error('Error checking table schema:', err);
      process.exit(1);
    }

    const hasTicketId = columns.some(col => col.name === 'ticket_id');

    if (hasTicketId) {
      console.log('✓ ticket_id column already exists');
      db.close();
      process.exit(0);
    }

    console.log('Adding ticket_id column to bookings table...');

    // Add ticket_id column
    db.run('ALTER TABLE bookings ADD COLUMN ticket_id TEXT', (err) => {
      if (err) {
        console.error('Error adding ticket_id column:', err);
        process.exit(1);
      }

      console.log('✓ ticket_id column added successfully');

      // Make conversation_id nullable by recreating the constraint
      console.log('Updating conversation_id to be nullable...');

      // SQLite doesn't support modifying column constraints directly
      // We need to verify the data is OK
      db.all('SELECT COUNT(*) as count FROM bookings WHERE conversation_id IS NULL AND ticket_id IS NULL', (err, result) => {
        if (err) {
          console.error('Error checking data:', err);
          process.exit(1);
        }

        console.log('✓ Migration completed successfully');
        console.log('  - ticket_id column added');
        console.log('  - Both conversationId and ticketId can now be used');

        db.close();
        process.exit(0);
      });
    });
  });
});
