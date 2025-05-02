// auth-service.js
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Database = require('better-sqlite3');
const fs = require('fs');

/**
 * Handles authentication with the flight API service
 * @returns {Object} Authentication service
 */
class AuthService {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8000';
    this.defaultToken = process.env.DEFAULT_API_TOKEN || '';
    this.userTokens = new Map(); // In-memory cache of user tokens
    this.initTokenDatabase();
  }

  /**
   * Initialize the token database
   */
  initTokenDatabase() {
    try {
      // Ensure the data directory exists
      const dbDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new Database(path.join(dbDir, 'tokens.db'));
      
      // Create tokens table if it doesn't exist
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS user_tokens (
          phone_number TEXT PRIMARY KEY,
          token TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `).run();

      console.log('Token database initialized');
      
      // Load existing tokens into memory
      this.loadTokensFromDatabase();
    } catch (error) {
      console.error('Failed to initialize token database:', error);
    }
  }

  /**
   * Load tokens from database into memory
   */
  loadTokensFromDatabase() {
    try {
      const tokens = this.db.prepare('SELECT phone_number, token FROM user_tokens').all();
      
      tokens.forEach(row => {
        this.userTokens.set(row.phone_number, row.token);
      });
      
      console.log(`Loaded ${tokens.length} user tokens from database`);
    } catch (error) {
      console.error('Error loading tokens from database:', error);
    }
  }

  /**
   * Authenticate and get token for a user
   * @param {string} phoneNumber - User phone number
   * @returns {Promise<string>} Authentication token
   */
  async authenticate(phoneNumber) {
    try {
      // Normalize the phone number for consistent storage
      const normalizedNumber = this.normalizePhoneNumber(phoneNumber);
      
      // Check if we already have a token for this user
      if (this.userTokens.has(normalizedNumber)) {
        console.log(`Using existing token for ${normalizedNumber}`);
        return this.userTokens.get(normalizedNumber);
      }
      
      const url = `${this.baseUrl}/api/auth/login/`;
      
      const response = await axios.post(url, {
        phone_number: normalizedNumber
      }, {
        headers: {
          'Authorization': `Token ${this.defaultToken}`, // Use default token for auth
          'Content-Type': 'application/json'
        }
      });
      
      // Handle response according to your API's response format
      if (response.data && response.data.token) {
        const userToken = response.data.token;
        
        // Store the token both in memory and in database
        this.userTokens.set(normalizedNumber, userToken);
        this.saveTokenToDatabase(normalizedNumber, userToken);
        
        console.log(`New token obtained and stored for ${normalizedNumber}`);
        return userToken;
      }
      
      console.log('No token received from API, using default token');
      return this.defaultToken;
    } catch (error) {
      console.error('Authentication error:', error.message);
      
      // If authentication fails, return the default token
      // so the system can continue operating with default credentials
      return this.defaultToken;
    }
  }

  /**
   * Save a user token to the database
   * @param {string} phoneNumber - User phone number
   * @param {string} token - User token
   */
  saveTokenToDatabase(phoneNumber, token) {
    try {
      const now = Date.now();
      
      this.db.prepare(`
        INSERT INTO user_tokens (phone_number, token, created_at)
        VALUES (?, ?, ?)
        ON CONFLICT(phone_number) DO UPDATE SET
          token = excluded.token,
          created_at = excluded.created_at
      `).run(phoneNumber, token, now);
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  }

  /**
   * Get the authentication token for a specific user
   * @param {string} phoneNumber - User phone number
   * @returns {string} User-specific token or default token
   */
  getToken(phoneNumber) {
    if (!phoneNumber) {
      return this.defaultToken;
    }
    
    const normalizedNumber = this.normalizePhoneNumber(phoneNumber);
    return this.userTokens.get(normalizedNumber) || this.defaultToken;
  }

  /**
   * Normalize a phone number for consistent storage
   * @param {string} phoneNumber - Phone number to normalize
   * @returns {string} Normalized phone number
   */
  normalizePhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let normalized = phoneNumber.replace(/\D/g, '');
    
    // Ensure it has country code (add Nigeria code if needed)
    if (!normalized.startsWith('234') && !normalized.startsWith('1')) {
      if (normalized.startsWith('0')) {
        normalized = '234' + normalized.substring(1);
      } else {
        normalized = '234' + normalized;
      }
    }
    
    return normalized;
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Create a singleton instance
const authService = new AuthService();

// Ensure the database is closed properly on process exit
process.on('exit', () => {
  authService.close();
});

process.on('SIGINT', () => {
  authService.close();
});

module.exports = authService;