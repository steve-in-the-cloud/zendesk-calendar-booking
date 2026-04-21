// Migration script to add ticket_id column and make conversation_id nullable
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
  // Check if migration is needed
  db.all("PRAGMA table_info(bookings)", (err, columns) => {
    if (err) {
      console.error('Error checking table schema:', err);
      process.exit(1);
    }

    const hasTicketId = columns.some(col => col.name === 'ticket_id');
    const conversationIdCol = columns.find(col => col.name === 'conversation_id');
    const isConversationIdNullable = conversationIdCol && conversationIdCol.notnull === 0;

    if (hasTicketId && isConversationIdNullable) {
      console.log('✓ Migration already completed - database schema is up to date');
      db.close();
      process.exit(0);
    }

    console.log('Starting migration: Adding ticket_id and making conversation_id nullable...');

    // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Error starting transaction:', err);
        process.exit(1);
      }

      // Create new table with correct schema
      db.run(`
        CREATE TABLE bookings_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          booking_type_id INTEGER,
          conversation_id TEXT,
          ticket_id TEXT,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          customer_message TEXT,
          google_event_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (booking_type_id) REFERENCES booking_types (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating new table:', err);
          db.run('ROLLBACK');
          process.exit(1);
        }

        // Copy existing data
        db.run(`
          INSERT INTO bookings_new (id, booking_type_id, conversation_id, ticket_id, start_time, end_time, customer_message, google_event_id, created_at)
          SELECT id, booking_type_id, conversation_id, NULL, start_time, end_time, customer_message, google_event_id, created_at
          FROM bookings
        `, (err) => {
          if (err) {
            console.error('Error copying data:', err);
            db.run('ROLLBACK');
            process.exit(1);
          }

          // Drop old table
          db.run('DROP TABLE bookings', (err) => {
            if (err) {
              console.error('Error dropping old table:', err);
              db.run('ROLLBACK');
              process.exit(1);
            }

            // Rename new table
            db.run('ALTER TABLE bookings_new RENAME TO bookings', (err) => {
              if (err) {
                console.error('Error renaming table:', err);
                db.run('ROLLBACK');
                process.exit(1);
              }

              // Commit transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('Error committing transaction:', err);
                  db.run('ROLLBACK');
                  process.exit(1);
                }

                console.log('✓ Migration completed successfully!');
                console.log('  - ticket_id column added');
                console.log('  - conversation_id is now nullable');
                console.log('  - Both conversationId and ticketId can now be used');

                db.close();
                process.exit(0);
              });
            });
          });
        });
      });
    });
  });
});
