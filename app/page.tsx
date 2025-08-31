"use client";

import type { ModelMessage, UserModelMessage } from "ai";
import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ModelMessage[]>([]);

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage: UserModelMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const { messages: newMessages } = await response.json();

    setMessages((current) => [...current, ...newMessages]);
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-gray-100 max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`p-3 rounded-lg max-w-xs ${
              message.role === "user"
                ? "self-end bg-blue-500 text-white"
                : "self-start bg-gray-200 text-black"
            }`}
          >
            {typeof message.content === "string"
              ? message.content
              : message.content
                  .filter((part) => part.type === "text")
                  .map((part, partIndex) => (
                    <div key={partIndex}>{part.text}</div>
                  ))}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 border rounded-lg text-gray-800"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
