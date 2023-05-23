// Import necessary packages
require('dotenv/config'); // Load environment variables from .env file
const {Client, IntentsBitField} = require('discord.js'); // Package for interacting with Discord API
const {Configuration, OpenAIApi} = require("openai"); // Package for interacting with OpenAI API

// Create a new instance of Discord client
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds, // Allow the bot to see the list of servers it's in
        IntentsBitField.Flags.GuildMessages, // Allow the bot to see the messages in the servers it's in
        IntentsBitField.Flags.MessageContent, // Allow the bot to see the content of the messages in the servers it's in
    ],
});

// Event listener for when the bot is ready
client.on('ready', (c) => {
    console.log(`🐇 | ${c.user.tag} is online!`) // Log a message to the console when the bot is ready
})

// Create a new instance of OpenAI API
const configuration = new Configuration({
    apiKey: process.env.API_KEY, // APIkey is stored in the environment variable API_KEY
});

const openai = new OpenAIApi(configuration);

// Event listener for when a message is created in a server wherethe bot is present
client.on('messageCreate', async (message) => {
    // Ignore messages sent by other bots, messages sent in channels other than the one specified in the environment variable, or messages starting with "!"
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;
    if (message.content.startsWith('!')) return;

    // Build a conversation log by creating an array of message objects that represent the previous messages in the conversation
    let conversationLog = [{
        role: 'system',
        content: 'You are a sarcastic bot, that usually makes quotes that reminds anime in general or scenes'
    }];
    await message.channel.sendTyping(); // Show the "typing" indicator in the channel
    let prevMessages = await message.channel.messages.fetch({limit: 15}); // Fetch the previous 15 messages in the channel
    prevMessages.reverse(); // Reverse the order of the messages so they are in chronological order

    prevMessages.forEach((msg) => {
        // Ignore messages sent by other bots or messages that start with "!"
        if (message.content.startsWith('!')) return;
        if (msg.author.id !== client.user.id && message.author.bot) return;
        // Add the content of the previous message to the conversation log
        conversationLog.push({
            role: 'user',
            content: msg.content,
        });
    })


    try {
        // Send the conversation log to OpenAI APIfor generating a response
        const result = await openai.createChatCompletion({
            model: 'text-davinci-003', // The name of the OpenAI API model to use for generating a response
            messages: conversationLog, // The conversation log to use as context for generating a response
        });
        console.log(result.data);
        // Send the generated response as a reply to the original message
        message.reply(result.data.choices[0].text);
    } catch (error) {
        console.log(`there was an error: ${error}`);
        message.reply(`ʟᴇᴀᴠᴇ ᴍᴇ ᴀʟᴏɴᴇ`)
        message.reply(`https://gifdb.com/images/high/evangelion-unit-01-hand-pul6jrgphfctvv8u.gif`);

    }


})

// Log in to Discord using the bot token stored in the environment variable TOKEN
client.login(process.env.TOKEN);