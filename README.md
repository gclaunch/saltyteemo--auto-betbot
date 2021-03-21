# saltyteemo--auto-betbot
Automated Betbot for Twitch.tv/SaltyTeemo

=================

## Bot Overview

Twitch.tv/SaltyTeemo spectates League of Legends streams and lets viewers bet on the outcome with fake channel currency.

Twitch offers an Internet Relay Chat (IRC) interface for chat functionality. Chatbots allow you to programmatically interact with a Twitch chat feed using IRC standards; the bot connects to the Twitch IRC network as a client to perform these actions.This guide presents an easy bot example to get you started.



### Running the Bot

To start, you’ll need these:
 
`BOT_USERNAME` — The account (username) that the chatbot uses to send chat messages. This can be your Twitch account. Alternately, many developers choose to create a second Twitch account for their bot, so it's clear from whom the messages originate.
`OAUTH_TOKEN` — The token to authenticate your chatbot with Twitch's servers. Generate this with [https://twitchapps.com/tmi/](https://twitchapps.com/tmi/) (a Twitch community-driven wrapper around the Twitch API), while logged in to your chatbot account. The token will be an alphanumeric string.


## Notes

* For a thorough understanding of Twitch chatbots and IRC, read the [Chatbots & IRC Guide](https://dev.twitch.tv/docs/irc/guide/) and the rest of the Twitch IRC documentation. 
* To authenticate your chatbot in a production setting, we recommend you [register your app](https://dev.twitch.tv/docs/authentication/#registration) (chatbot) and use the OAuth Authorization code flow. This enables you to authenticate programmatically. To learn more, read the [Apps & Authentication Guide](https://dev.twitch.tv/docs/authentication/).
Read [Chatbots & IRC documentation](https://dev.twitch.tv/docs/irc/guide/).