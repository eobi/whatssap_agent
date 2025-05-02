const Database = require('better-sqlite3');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

class SessionManager {
  constructor() {
    // Ensure the db directory exists
    const dbDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize database
    this.db = new Database(path.join(dbDir, 'sessions.db'));
    this.init();
    
    // Set up scheduled cleanup for expired sessions (runs every hour)
    cron.schedule('0 * * * *', () => {
      this.cleanupExpiredSessions();
      console.log('Scheduled cleanup of expired sessions completed');
    });
  }

  init() {
    // Create sessions table if it doesn't exist
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS sessions (
        chatId TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        expiresAt INTEGER NOT NULL
      )
    `).run();

    console.log('Session database initialized');
  }

  getSession(chatId) {
    const now = Date.now();
    const row = this.db.prepare('SELECT * FROM sessions WHERE chatId = ? AND expiresAt > ?')
      .get(chatId, now);
    
    return row ? row.sessionId : null;
  }

  setSession(chatId, sessionId, ttlHours = 24) {
    const expiresAt = Date.now() + (ttlHours * 60 * 60 * 1000);
    
    // Use upsert pattern to handle both insert and update cases
    this.db.prepare(`
      INSERT INTO sessions (chatId, sessionId, expiresAt)
      VALUES (?, ?, ?)
      ON CONFLICT(chatId) DO UPDATE SET
        sessionId = excluded.sessionId,
        expiresAt = excluded.expiresAt
    `).run(chatId, sessionId, expiresAt);
    
    return sessionId;
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    const result = this.db.prepare('DELETE FROM sessions WHERE expiresAt <= ?').run(now);
    console.log(`Cleaned up ${result.changes} expired sessions`);
  }

  getAllValidSessions() {
    const now = Date.now();
    return this.db.prepare('SELECT * FROM sessions WHERE expiresAt > ?').all(now);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Create a singleton instance
const sessionManager = new SessionManager();

// Ensure the database is closed properly on process exit
process.on('exit', () => {
  sessionManager.close();
});

process.on('SIGINT', () => {
  sessionManager.close();
  process.exit(0);
});

module.exports = sessionManager;