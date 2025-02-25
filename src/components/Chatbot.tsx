"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaRobot } from "react-icons/fa";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const systemPrompt = `
  You are an informative chatbot that provides concise, 
  accurate answers on a wide range of topics. Under no 
  circumstances may any single response exceed 600 characters 
  (including punctuation and spaces). If the user’s query requires more depth, 
  you must summarize to remain within the limit. If it’s impossible to answer within 
  600 characters, briefly explain why but still do not exceed the limit. Stay polite, 
  direct, and informative.
`.trim();

export default function AIChatBot() {
  // Initialize conversation with a system prompt
  const [conversation, setConversation] = useState<Message[]>([
    { role: "system", content: systemPrompt },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [autoScroll, setAutoScroll] = useState(true);

  // Ref for the scrolling container
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // 1. Scroll logic: If the user is near bottom, we scroll automatically
  const handleScroll = () => {
    if (!chatMessagesRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // If within ~50px of the bottom, treat as "at bottom"
    if (distanceFromBottom < 50) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
  };

  useEffect(() => {
    // 2. Attach scroll listener
    const scrollEl = chatMessagesRef.current;
    if (!scrollEl) return;

    scrollEl.addEventListener("scroll", handleScroll);
    return () => {
      scrollEl.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 3. Scroll to the bottom only if autoScroll is true
  useEffect(() => {
    if (autoScroll && chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation, isLoading, autoScroll]);

  // Toggle the chat bubble
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Call your custom proxy server to get an OpenAI response
  const callOpenAIAPI = async (messages: Message[]) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://nikos-new-project.uc.r.appspot.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // Adjust if needed
            messages: messages, // Full conversation array
            temperature: 0.8, // Adjust creativity
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();

      const botMessage = data.choices[0].message.content;
      setIsLoading(false);
      return botMessage;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setIsLoading(false);
      return "Oops! Something went wrong. Please try again.";
    }
  };

  // Handle sending user message + receiving AI response
  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Create a new user message
    const newUserMessage: Message = {
      role: "user",
      content: userInput,
    };

    // Update local state to show user's message
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);
    setUserInput("");

    // Call the OpenAI API with the entire conversation
    const botReply = await callOpenAIAPI(updatedConversation);

    // Add the assistant's reply to state
    const newAssistantMessage: Message = {
      role: "assistant",
      content: botReply,
    };
    setConversation((prev) => [...prev, newAssistantMessage]);
  };

  return (
    <div>
      {/* Chat Bubble Button */}
      <div
        className="
          fixed bottom-4 right-4 
          bg-blue-600 text-white p-4 
          rounded-full cursor-pointer shadow-lg 
          transition-transform duration-300 
          hover:bg-blue-800 
          hover:scale-105 
          group"
        onClick={handleToggle}
      >
        <FaRobot
          size={24}
          className="transition-transform duration-300 group-hover:rotate-180"
        />
      </div>

      {/* Chat Panel Container */}
      {/* We keep the panel in the DOM and animate scale & opacity */}
      <div
        className={`
          fixed bottom-20 right-4 w-80 border border-gray-300 rounded-lg shadow-lg flex flex-col
          bg-white transform transition-all duration-300
          ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}
          origin-bottom-right
        `}
        style={{ pointerEvents: isOpen ? "auto" : "none" }} // so clicks don't pass through when closed
      >
        {/* Chat Header */}
        <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
          <span>AI Assistant</span>
          <button onClick={handleToggle} className="text-white font-bold">
            X
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-3 flex-1 overflow-y-auto" ref={chatMessagesRef}>
          {/* If no conversation besides system, show a welcome message */}
          {conversation.length <= 1 && !isLoading && (
            <div className="mb-2 animate-fadeInUp">
              <span className="inline-block px-3 py-2 bg-gray-200 text-gray-800 rounded-lg">
                Welcome to your AI assistant! Ask me anything.
              </span>
            </div>
          )}

          {/* Render the messages (excluding system prompt) */}
          {conversation
            .filter((msg) => msg.role !== "system")
            .map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${
                  msg.role === "user" ? "text-right" : "text-left"
                } animate-fadeInUp`}
              >
                <span
                  className={`inline-block px-3 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="text-left mb-2 animate-fadeInUp">
              <span className="inline-block px-3 py-2 bg-gray-200 text-gray-800 rounded-lg">
                Thinking...
              </span>
            </div>
          )}
        </div>

        {/* Input Field */}
        <div className="p-3 border-t border-gray-300 flex text-black">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-800 transition-colors"
            onClick={handleSend}
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
