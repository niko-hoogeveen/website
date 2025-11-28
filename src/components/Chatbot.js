// src/components/Chatbot.js
import React, { useState } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleBubbleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user's message
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      // Send to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY', // Replace with your key or use an env variable
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: newMessages,
        }),
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const botReply = data.choices[0].message.content;
        setMessages([...newMessages, { role: 'assistant', content: botReply }]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* The floating chat bubble (visible if chat is closed) */}
      {!isOpen && (
        <div
          onClick={handleBubbleClick}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Chat
        </div>
      )}

      {/* The chat window (visible if chat is open) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '300px',
            height: '400px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat messages */}
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <strong>{msg.role === 'user' ? 'You: ' : 'Bot: '}</strong>
                {msg.content}
              </div>
            ))}
          </div>

          {/* Input area */}
          <div style={{ display: 'flex', borderTop: '1px solid #ccc' }}>
            <input
              style={{ flex: 1, padding: '10px', border: 'none' }}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '10px',
                border: 'none',
                backgroundColor: '#007bff',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
            <button
              onClick={handleBubbleClick}
              style={{
                padding: '10px',
                border: 'none',
                backgroundColor: '#f44336',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
