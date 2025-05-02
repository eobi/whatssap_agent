const axios = require('axios');
const { FLIGHT_API_ENDPOINT } = require('../config/constants');
const sessionManager = require('./session-manager');

/**
 * Get flight information from API
 * @param {string} query - Flight search query
 * @param {Object} userInfo - User information
 * @returns {Promise<Object>} Flight search results
 */
async function getFlightInfo(query, userInfo) {
  try {
    console.log(`Making API request for query: "${query}" from user: ${userInfo.userName}`);
    
    // Check if we have an existing session for this chat
    const chatId = userInfo.chatId;
    const existingSessionId = sessionManager.getSession(chatId);
    
    let apiRequestData = {
      query: query,
      user: userInfo.userNumber
    };
    
    // Add session ID to request if it exists
    if (existingSessionId) {
      console.log(`Using existing session ID: ${existingSessionId} for user: ${userInfo.userName}`);
      apiRequestData.sessionId = existingSessionId;
    } else {
      console.log(`No existing session for user: ${userInfo.userName}, creating new session`);
    }
    
    // In a real implementation, you would uncomment this to call an actual API
    // const response = await axios.post(FLIGHT_API_ENDPOINT, apiRequestData);
    // 
    // // If the API returns a session ID, store it
    // if (response.data.sessionId) {
    //   sessionManager.setSession(chatId, response.data.sessionId);
    //   console.log(`New session created with ID: ${response.data.sessionId} for user: ${userInfo.userName}`);
    // }
    // 
    // return response.data;
    
    // For demo purposes, simulate API response with a mock session ID
    // This is where you'd integrate with your actual API
    const mockSessionId = existingSessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Store the session (either new or reuse existing)
    if (!existingSessionId) {
      sessionManager.setSession(chatId, mockSessionId);
      console.log(`New session created with ID: ${mockSessionId} for user: ${userInfo.userName}`);
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate random flight data
    const mockFlights = [
      {
        flightNumber: 'BA' + Math.floor(Math.random() * 1000),
        departure: 'London Heathrow (LHR)',
        arrival: 'New York JFK (JFK)',
        departureTime: '10:30',
        arrivalTime: '13:45',
        price: '$' + (Math.floor(Math.random() * 500) + 300)
      },
      {
        flightNumber: 'EK' + Math.floor(Math.random() * 1000),
        departure: 'Dubai (DXB)',
        arrival: 'Singapore (SIN)',
        departureTime: '14:15',
        arrivalTime: '02:30',
        price: '$' + (Math.floor(Math.random() * 800) + 500)
      },
      {
        flightNumber: 'AF' + Math.floor(Math.random() * 1000),
        departure: 'Paris (CDG)',
        arrival: 'Tokyo (HND)',
        departureTime: '21:00',
        arrivalTime: '17:20',
        price: '$' + (Math.floor(Math.random() * 900) + 600)
      }
    ];
    
    return {
      success: true,
      flights: mockFlights,
      query: query,
      sessionId: mockSessionId
    };
  } catch (error) {
    console.error('Error fetching flight information:', error);
    return {
      success: false,
      error: 'Unable to fetch flight information at this time.'
    };
  }
}

module.exports = {
  getFlightInfo
};