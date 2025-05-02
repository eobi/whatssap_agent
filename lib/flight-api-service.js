// flight-api-service.js
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const authService = require('./auth-service');
const sessionManager = require('./session-manager');

/**
 * Service to interact with the flight API
 */
class FlightApiService {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:8000';
  }

  /**
   * Send a message to the flight conversation API
   * @param {string} message - User message to process
   * @param {string} userNumber - User's WhatsApp number
   * @param {string} chatId - WhatsApp chat ID
   * @returns {Promise<Object>} API response
   */
  async sendMessage(message, userNumber, chatId) {
    try {
      const url = `${this.baseUrl}/flightgpt/api/conversation/`;
      
      // Get user-specific token
      const token = authService.getToken(userNumber);
      
      // Get existing session ID if available
      const sessionId = sessionManager.getSession(chatId) || '';
      console.log(`Using session ID: ${sessionId || 'new session'} for user ${userNumber}`);

      const payload = {
        message: message,
        session_id: sessionId
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Store session ID if it's a new session
      if (response.data && response.data.session_id) {
        sessionManager.setSession(chatId, response.data.session_id);
        console.log(`Session stored: ${response.data.session_id}`);
      }

      return this._processApiResponse(response.data);
    } catch (error) {
      console.error('Flight API error:', error.message);
      return {
        success: false,
        message: 'Sorry, I encountered an error while processing your request. Please try again later.'
      };
    }
  }

  /**
   * Process the API response to extract WhatsApp formatted message
   * @param {Object} apiResponse - Response from the flight API
   * @returns {Object} Processed response
   */
  _processApiResponse(apiResponse) {
    if (!apiResponse) {
      return {
        success: false,
        message: 'No response received from the flight API.'
      };
    }

    try {
      // Extract the whatsapp_response if available (this is the preferred format)
      if (apiResponse.whatsapp_response) {
        return {
          success: true,
          sessionId: apiResponse.session_id,
          isNewSession: apiResponse.is_new_session,
          message: apiResponse.whatsapp_response
        };
      }
      
      // Fall back to main_response if available
      if (apiResponse.main_response) {
        return {
          success: true,
          sessionId: apiResponse.session_id,
          isNewSession: apiResponse.is_new_session,
          message: apiResponse.main_response
        };
      }
      
      // If neither is available, try to extract from conversation or responses
      const fallbackMessage = this._fallbackMessageExtraction(apiResponse);
      
      return {
        success: true,
        sessionId: apiResponse.session_id,
        isNewSession: apiResponse.is_new_session === true,
        message: fallbackMessage
      };
    } catch (error) {
      console.error('Error processing API response:', error);
      return {
        success: false,
        message: 'Sorry, I had trouble processing the flight information. Please try again.'
      };
    }
  }

  /**
   * Extract message content from conversation as a fallback
   * @param {Object} apiResponse - API response object
   * @returns {string} Extracted message
   */
  _fallbackMessageExtraction(apiResponse) {
    if (apiResponse.responses && apiResponse.responses.length > 0) {
      // Join all agent responses
      return apiResponse.responses
        .map(response => response.content)
        .join('\n\n');
    }

    if (apiResponse.conversation && 
        apiResponse.conversation.messages && 
        apiResponse.conversation.messages.length > 0) {
      // Find the last agent message
      const agentMessages = apiResponse.conversation.messages
        .filter(msg => msg.role === 'agent')
        .map(msg => msg.content);
      
      if (agentMessages.length > 0) {
        return agentMessages[agentMessages.length - 1];
      }
    }

    return 'I received flight information but couldn\'t format it properly. Please try a more specific request.';
  }
}

// Create a singleton instance
const flightApiService = new FlightApiService();

module.exports = flightApiService;

