const axios = require('axios');
const { FLIGHT_API_ENDPOINT } = require('../config/constants');

/**
 * Get flight information from API
 * @param {string} query - Flight search query
 * @param {Object} userInfo - User information
 * @returns {Promise<Object>} Flight search results
 */
async function getFlightInfo(query, userInfo) {
  try {
    console.log(`Making API request for query: "${query}" from user: ${userInfo.userName}`);
    
    // In a real implementation, you would uncomment this to call an actual API
    // const response = await axios.post(FLIGHT_API_ENDPOINT, {
    //   query: query,
    //   user: userInfo.userNumber
    // });
    // return response.data;
    
    // For demo purposes, return mock data
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
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      flights: mockFlights,
      query: query
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