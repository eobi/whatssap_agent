const sessionManager = require('../lib/session-manager');

// Command line utility to manage sessions
const command = process.argv[2];

switch (command) {
  case 'list':
    const sessions = sessionManager.getAllValidSessions();
    console.log('Current Active Sessions:');
    sessions.forEach(session => {
      const expiresIn = Math.floor((session.expiresAt - Date.now()) / (60 * 60 * 1000));
      console.log(`ChatID: ${session.chatId}, SessionID: ${session.sessionId}, Expires in: ${expiresIn} hours`);
    });
    break;
    
  case 'cleanup':
    sessionManager.cleanupExpiredSessions();
    console.log('Expired sessions cleanup completed');
    break;
    
  default:
    console.log('Unknown command. Available commands: list, cleanup');
}

// Close database connection when done
sessionManager.close();