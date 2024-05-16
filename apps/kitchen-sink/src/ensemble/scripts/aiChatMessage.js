/* eslint-disable no-undef */
console.log("Initializing chat ai");

const allMessages = [];

if (allMessages.length === 0) {
  allMessages.push({
    role: "assistant",
    content: "Hi, how can I help you today?",
  });
}

ensemble.storage.set("aiChatCompletionMessages", allMessages);
ensemble.storage.set("aiChatMessageSendButtonEnabled", true);
