// lib/message-handler.js
const utils = require('./utils');
const flightApiService = require('./flight-api-service');
const authService = require('./auth-service');

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
        
        // Show typing indicator instead of sending a message
        await chat.sendStateTyping();
        
        // First authenticate to get user-specific token
        await authService.authenticate(userInfo.userNumber);
        
        // Send the message to our flight API and get response
        const response = await flightApiService.sendMessage(
          messageText,
          userInfo.userNumber,
          userInfo.chatId
        );
        
        // Send the formatted response back to the user
        if (response.success) {
          await client.sendMessage(message.from, response.message);
        } else {
          await client.sendMessage(message.from, 
            "Sorry, I couldn't process your flight query at this time. Please try again later.");
        }
        
        // Log the interaction
        console.log(`Responded to ${userInfo.userName} (${userInfo.userNumber}) with flight information`);
      }
    } else {
      // In private chats: Process all messages
      console.log('Private message received:', messageText);
      
      // Extract user information
      const userInfo = await utils.extractContactInfo(message);
      console.log('User info:', userInfo);
      
      // Show typing indicator instead of sending a message
      await chat.sendStateTyping();
      
      // Authenticate to get user-specific token
      const userToken = await authService.authenticate(userInfo.userNumber);
      console.log(`Using token for ${userInfo.userNumber}: ${userToken.substring(0, 5)}...`);
      
      // Send the message to our flight API and get response
      const response = await flightApiService.sendMessage(
        messageText,
        userInfo.userNumber,
        userInfo.chatId
      );
      
      // Send the formatted response back to the user
      if (response.success) {
        await client.sendMessage(message.from, response.message);
      } else {
        await client.sendMessage(message.from, 
          "Sorry, I couldn't process your flight query at this time. Please try again later.");
      }
      
      // Log the interaction
      console.log(`Responded to ${userInfo.userName} (${userInfo.userNumber}) with flight information`);
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
        
        // Show typing indicator
        await chat.sendStateTyping();
        
        // Send the updated message to our flight API
        const response = await flightApiService.sendMessage(
          newBody,
          userInfo.userNumber,
          userInfo.chatId
        );
        
        // Send the formatted response back to the user
        if (response.success) {
          await client.sendMessage(message.from, response.message);
        } else {
          await client.sendMessage(message.from, 
            "Sorry, I couldn't process your updated flight query. Please try again.");
        }
      }
    } else {
      // Process all edited messages in private chats
      const userInfo = await utils.extractContactInfo(message);
      
      console.log(`Message edited by ${userInfo.userName} from "${prevBody}" to "${newBody}"`);
      
      // Show typing indicator
      await chat.sendStateTyping();
      
      // Send the updated message to our flight API
      const response = await flightApiService.sendMessage(
        newBody,
        userInfo.userNumber,
        userInfo.chatId
      );
      
      // Send the formatted response back to the user
      if (response.success) {
        await client.sendMessage(message.from, response.message);
      } else {
        await client.sendMessage(message.from, 
          "Sorry, I couldn't process your updated flight query. Please try again.");
      }
    }
  } catch (error) {
    console.error('Error processing edited message:', error);
  }
}

module.exports = {
  handleMessage,
  handleEditedMessage
};