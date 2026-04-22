const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use persistent disk in production, local path in development
const dataDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/data'
  : path.join(__dirname, '..');

const dbPath = path.join(dataDir, 'calendar_booking.db');
const db = new sqlite3.Database(dbPath);

console.log('Starting migration: Add requester_email to bookings table...');

db.serialize(() => {
  // Check if column already exists
  db.all("PRAGMA table_info(bookings)", (err, columns) => {
    if (err) {
      console.error('Error checking table schema:', err);
      process.exit(1);
    }

    const hasEmailColumn = columns.some(col => col.name === 'requester_email');

    if (hasEmailColumn) {
      console.log('Column requester_email already exists. Skipping migration.');
      db.close();
      process.exit(0);
    }

    // Add the column
    db.run('ALTER TABLE bookings ADD COLUMN requester_email TEXT', (err) => {
      if (err) {
        console.error('Error adding requester_email column:', err);
        db.close();
        process.exit(1);
      }

      console.log('Successfully added requester_email column to bookings table');
      db.close();
      process.exit(0);
    });
  });
});
