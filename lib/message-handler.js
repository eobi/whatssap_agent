const utils = require('./utils');
const flightService = require('./flight-service');

/**
 * Process regular messages
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Message object
 */
async function handleMessage(client, message) {
  try {
    // Skip processing for status messages
    const chat = await message.getChat();
    
    // Get message text
    const messageText = message.body;
    
    // Different behavior based on chat type
    if (chat.isGroup) {
      // In groups: Only process messages where the bot is mentioned
      if (message.mentionedIds.includes(client.info.wid._serialized)) {
        console.log('Group mention received:', messageText);
        
        // Extract user information
        const userInfo = await utils.extractContactInfo(message);
        console.log('User info:', userInfo);
        
        // Let the user know we're processing their request
        await client.sendMessage(message.from, 
          `Hi ${userInfo.userName}, I'm looking up information for you. One moment please...`);
        
        // Extract potential flight details from message
        const flightDetails = utils.extractFlightDetails(messageText);
        
        // Get flight information from API
        const query = flightDetails 
          ? `Flights from ${flightDetails.from} to ${flightDetails.to}`
          : messageText;
          
        const flightData = await flightService.getFlightInfo(query, userInfo);
        
        // Format and send response
        const response = utils.formatFlightResponse(flightData, userInfo);
        await client.sendMessage(message.from, response);
        
        // Log the interaction
        console.log(`Responded to ${userInfo.userName} (${userInfo.userNumber}) with information`);
      }
    } else {
      // In private chats: Process all messages
      console.log('Private message received:', messageText);
      
      // Extract user information
      const userInfo = await utils.extractContactInfo(message);
      console.log('User info:', userInfo);
      
      // Let the user know we're processing their request
      await client.sendMessage(message.from, 
        `Hi ${userInfo.userName}, I'm looking up information for you. One moment please...`);
      
      // Extract potential flight details from message
      const flightDetails = utils.extractFlightDetails(messageText);
      
      // Get flight information from API
      const query = flightDetails 
        ? `Flights from ${flightDetails.from} to ${flightDetails.to}`
        : messageText;
        
      const flightData = await flightService.getFlightInfo(query, userInfo);
      
      // Format and send response
      const response = utils.formatFlightResponse(flightData, userInfo);
      await client.sendMessage(message.from, response);
      
      // Log the interaction
      console.log(`Responded to ${userInfo.userName} (${userInfo.userNumber}) with information`);
    }
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

/**
 * Process edited messages
 * @param {Object} client - WhatsApp client
 * @param {Object} message - Message object
 * @param {string} newBody - New message content
 * @param {string} prevBody - Previous message content
 */
async function handleEditedMessage(client, message, newBody, prevBody) {
  try {
    const chat = await message.getChat();
    
    // Different behavior based on chat type
    if (chat.isGroup) {
      // Only process group messages where the bot is mentioned
      if (message.mentionedIds.includes(client.info.wid._serialized)) {
        const userInfo = await utils.extractContactInfo(message);
        
        console.log(`Message edited by ${userInfo.userName} from "${prevBody}" to "${newBody}"`);
        
        await client.sendMessage(message.from, 
          `I noticed you edited your message. Let me search again...`);
        
        // Extract potential flight details from edited message
        const flightDetails = utils.extractFlightDetails(newBody);
        
        // Get flight information from API
        const query = flightDetails 
          ? `Flights from ${flightDetails.from} to ${flightDetails.to}`
          : newBody;
          
        const flightData = await flightService.getFlightInfo(query, userInfo);
        
        // Format and send response
        const response = utils.formatFlightResponse(flightData, userInfo);
        await client.sendMessage(message.from, response);
      }
    } else {
      // Process all edited messages in private chats
      const userInfo = await utils.extractContactInfo(message);
      
      console.log(`Message edited by ${userInfo.userName} from "${prevBody}" to "${newBody}"`);
      
      await client.sendMessage(message.from, 
        `I noticed you edited your message. Let me search again...`);
      
      // Extract potential flight details from edited message
      const flightDetails = utils.extractFlightDetails(newBody);
      
      // Get flight information from API
      const query = flightDetails 
        ? `Flights from ${flightDetails.from} to ${flightDetails.to}`
        : newBody;
        
      const flightData = await flightService.getFlightInfo(query, userInfo);
      
      // Format and send response
      const response = utils.formatFlightResponse(flightData, userInfo);
      await client.sendMessage(message.from, response);
    }
  } catch (error) {
    console.error('Error processing edited message:', error);
  }
}

module.exports = {
  handleMessage,
  handleEditedMessage
};