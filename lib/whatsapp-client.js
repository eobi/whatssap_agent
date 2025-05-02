const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { CLIENT_CONFIG } = require('../config/constants.js');
const messageHandler = require('/lib/message-handler');

class WhatsAppClient {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  init() {
    // Initialize the WhatsApp client with local authentication
    this.client = new Client({
      authStrategy: new LocalAuth(),
      ...CLIENT_CONFIG
    });

    // Set up event handlers
    this._setupEventHandlers();

    return this.client.initialize()
      .then(() => {
        this.initialized = true;
        console.log('Initialization successful');
      })
      .catch(err => {
        console.error('Initialization failed:', err);
        throw err;
      });
  }

  _setupEventHandlers() {
    // Handle QR code generation
    this.client.on('qr', (qr) => {
      console.log('QR code received. Scan with your WhatsApp mobile app:');
      qrcode.generate(qr, { small: true });
    });

    // Handle successful authentication
    this.client.on('ready', () => {
      console.log('WhatsApp client is ready and connected!');
    });

    // Handle state changes
    this.client.on('change_state', state => {
      console.log('Client state changed to:', state);
    });

    // Handle disconnections
    this.client.on('disconnected', (reason) => {
      console.log('Client was disconnected:', reason);
      this.initialized = false;
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.client.initialize().catch(console.error);
      }, 5000);
    });

    // Handle all incoming messages
    this.client.on('message', message => {
      messageHandler.handleMessage(this.client, message);
    });

    // Handle message edits
    this.client.on('message_edit', (message, newBody, prevBody) => {
      messageHandler.handleEditedMessage(this.client, message, newBody, prevBody);
    });
  }

  getClient() {
    if (!this.initialized) {
      throw new Error('WhatsApp client is not initialized');
    }
    return this.client;
  }

  async sendMessage(chatId, message) {
    if (!this.initialized) {
      throw new Error('WhatsApp client is not initialized');
    }
    return this.client.sendMessage(chatId, message);
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.initialized = false;
      console.log('WhatsApp client has been destroyed');
    }
  }
}

// Singleton instance
const whatsappClient = new WhatsAppClient();

module.exports = whatsappClient;