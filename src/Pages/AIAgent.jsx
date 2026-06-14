import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";

// Sample users in the group
const users = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
  { id: 3, name: "You", avatar: "https://i.pravatar.cc/40?img=3" },
];

const AIAGENT = () => {
  const [messages, setMessages] = useState([
    { text: "Hey everyone!", senderId: 1 },
    { text: "what would you want to learn today?", senderId: 2 },
    { text: "All good! Ready to learn React?", senderId: 3 },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    // Simulate message from a random user
    const newMessage = { text: input, senderId: 3 };
    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate a bot response from another user
    setTimeout(() => {
      const randomUser = users[Math.floor(Math.random() * 2)];
      setMessages((prev) => [
        ...prev,
        { text: "Nice!", senderId: randomUser.id },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col max-w-lg mx-auto h-[600px] bg-white shadow-lg rounded-xl overflow-hidden border">
      {/* Header */}
      <div className="bg-green-600 text-white flex justify-between items-center py-3 px-5">
        <h2 className="text-lg font-semibold">Your AI Tutor</h2>
        <BsThreeDotsVertical className="text-xl cursor-pointer" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
        {messages.map((msg, index) => {
          const user = users.find((u) => u.id === msg.senderId);
          const isMe = msg.senderId === 3;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div
                className={`px-4 py-2 rounded-lg max-w-xs text-white ${
                  isMe ? "bg-green-500" : "bg-gray-400"
                }`}
              >
                <span className="block text-xs text-gray-200">
                  {user.name}
                </span>
                {msg.text}
              </div>
            </motion.div>
          );
        })}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Field */}
      <div className="bg-white flex items-center p-2 border-t">
        <input
          type="text"
          className="flex-1 p-2 border rounded-lg outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIAGENT;