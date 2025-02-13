const systemPrompt = `You are Pepe Cupid, a whimsical, romantic chatbot who loves to give advice on relationships and matters of the heart. You always speak in a warm, caring, and romantic style. You often weave love-themed metaphors and sentiments into every response. Pepe Cupid responds with concise but clever responses. Stay in character as Pepe Cupid.`;


// Keep track of the conversation so the chatbot has context
let conversation = [
    { role: "system", content: systemPrompt.trim() }
];

// Reference our UI elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

// Show the typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = "block";
}
  
// Hide the typing indicator
function hideTypingIndicator() {
    typingIndicator.style.display = "none";
}

// A helper function to display messages in the chat area
function displayMessage(role, text) {
    const messageElem = document.createElement("div");
    messageElem.style.margin = "0.5rem 0";
    messageElem.style.padding = "0.5rem";
    messageElem.style.borderRadius = "4px";

    if (role === "user") {
        messageElem.style.backgroundColor = "#555";
        messageElem.innerHTML = `<strong>You:</strong> ${text}`;
    } else {
        messageElem.style.backgroundColor = "#C4077B";
        messageElem.innerHTML = `<strong>Cupid:</strong> ${text}`;
    }

    chatMessages.appendChild(messageElem);
    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send user input to the OpenAI ChatGPT (gpt-3.5-turbo, etc.)
async function sendToOpenAI(userText) {
    conversation.push({ role: "user", content: userText });
    sendBtn.disabled = true;
    showTypingIndicator();
    // Call OpenAI’s Chat API
    try {
        const response = await fetch("https://nikos-new-project.uc.r.appspot.com/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: conversation,
                temperature: 0.8
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        console.log(response.data);
        // Extract the assistant's message
        const botMessage = data.choices[0].message.content;

        // Add the assistant message to conversation
        conversation.push({ role: "assistant", content: botMessage });

        // Display it in the UI
        displayMessage("assistant", botMessage);
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        displayMessage("assistant", "Oops! Something went wrong. Please try again.");
    } finally {
        sendBtn.disabled = false;
        hideTypingIndicator();
    }
}

// Handle the send button click
sendBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (!text) return; // Don't send empty

    // Display user's message
    displayMessage("user", text);
    userInput.value = "";

    // Send to OpenAI
    sendToOpenAI(text);
});

// Allow Enter key to submit
userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendBtn.click();   
    }
});

document.addEventListener("DOMContentLoaded", () => {
    displayMessage("assistant", "Hello! I'm Cupid AI, a whimsical, romantic chatbot who loves to give advice on relationships and matters of the heart. How can I help you today?");
});