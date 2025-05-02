# WhatsApp Flight Bot

A modular WhatsApp bot that responds to flight-related queries in both individual and group chats, with session management and API integration.

## Features

- Listens for any messages in private chats
- Responds to mentions in group chats
- Extracts user information (name, number)
- Maintains user sessions for 24 hours
- Calls the Flight API for information
- Provides formatted flight search results
- Persists sessions across restarts
- Notification API for sending push notifications
- Authentication with the Flight API

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
4. Start the bot:
   ```bash
   npm start
   ```

## Environment Variables

Configure the bot by updating the `.env` file:

```
# API Configuration
API_BASE_URL=http://127.0.0.1:8000
API_TOKEN=your_api_token_here
DEFAULT_API_TOKEN=default_token_for_fallback

# WhatsApp Configuration
WHATSAPP_KEEP_ALIVE=true
WHATSAPP_HEADLESS=true
WHATSAPP_DEBUG=false

# Session Configuration
SESSION_TTL_HOURS=24

# Notification API Configuration
ENABLE_NOTIFICATION_API=true
NOTIFICATION_API_PORT=3000

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password
```

## Usage

### WhatsApp Interaction

1. Scan the QR code that appears on first run with your WhatsApp device
2. Start chatting with the bot in a private conversation
3. In groups, mention the bot to get a response

### Admin Commands

To manage sessions:

```bash
# List all active sessions
npm run sessions list

# Clean up expired sessions
npm run sessions cleanup
```

### Sending Notifications

You can send notifications to users through the API or command-line tool:

```bash
# Send from CLI
npm run notify +2348012345678 "Your flight has been confirmed"
```

Or via API:
```bash
curl -X POST http://localhost:3000/api/notify \
  -H "Authorization: Token your_api_token_here" \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+2348012345678","message":"Your flight is confirmed"}'
```

## Project Structure

```
whatsapp-flight-bot/
├── config/           # Configuration files
├── data/             # Data storage (sqlite, etc.)
├── lib/              # Core functionality
│   ├── auth-service.js       # Authentication with Flight API
│   ├── flight-api-service.js # Flight API integration
│   ├── message-handler.js    # Message processing
│   ├── notification-api.js   # Notification API
│   ├── session-manager.js    # Session management
│   ├── utils.js              # Utility functions
│   └── whatsapp-client.js    # WhatsApp client wrapper
├── tools/            # Admin tools
│   ├── manage-sessions.js   # Session management CLI
│   └── send-notification.js # Notification sending CLI
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── index.js          # Application entry point
├── package.json      # Project metadata
└── README.md         # Project documentation
```

## License

ISC