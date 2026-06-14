import React, { useState, useEffect, useRef } from "react";
import { getChannelFeed, sendMessage as sendMessageApi } from "../lib/api";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
import { Send, Paperclip, Image as ImageIcon, User, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const socket = io("https://olympiadedu-backend-neh8.onrender.com");

const ChannelFeed = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [image, setImage] = useState({});
  const decoded = jwtDecode(localStorage.getItem("token"));
  const sender = decoded.firstName;
  const locator = useLocation();
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const LoadChannelFeed = async () => {
      const res = await getChannelFeed(localStorage.getItem("channelId"));
      const loadedMessages = res.messages || [];
      setMessages(loadedMessages);
      setFilteredMessages(loadedMessages);
      setTimeout(() => scrollToBottom(), 100);
    };
    LoadChannelFeed();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages.length]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (msg.channelId === localStorage.getItem("channelId")) {
        setMessages((prev) => {
          const updated = [...prev, msg];
          setFilteredMessages(applySearchFilter(updated, searchTerm));
          return updated;
        });
      }
    });
    return () => socket.off("receiveMessage");
  }, [searchTerm]);

  const applySearchFilter = (msgs, term) => {
    if (!term.trim()) return msgs;
    return msgs.filter(
      (msg) =>
        msg.content.toLowerCase().includes(term.toLowerCase()) ||
        msg.sender.toLowerCase().includes(term.toLowerCase())
    );
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredMessages(applySearchFilter(messages, term));
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return;

    const previewMsg = {
      sender,
      content: newMessage,
      attachment,
      channelId: localStorage.getItem("channelId"),
    };
    const updatedMessages = [...messages, previewMsg];
    setMessages(updatedMessages);
    setFilteredMessages(applySearchFilter(updatedMessages, searchTerm));
    scrollToBottom();
    setNewMessage("");
    setAttachment(null);

    try {
      const formData = new FormData();
      formData.append("channelId", localStorage.getItem("channelId"));
      formData.append("sender", sender);
      formData.append("content", newMessage);
      formData.append("image", image);

      const res = await sendMessageApi(formData);
      socket.emit("sendMessage", { channelId: localStorage.getItem("channelId"), content: newMessage });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachment(url);
      setImage(file);
    }
  };

  const uniqueMembers = [...new Set(messages.map((msg) => msg.sender))];

  return (
    <div className="flex h-screen p-4 bg-blue-50 w-full">
      {/* Left: Message Area */}
      <div className="flex-1 pr-4 flex flex-col">
        {/* Header: Back + Title + Spacer */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:underline"
            >
              <ArrowLeft className="mr-1" size={18} /> Back
            </button>
            <div className="text-center flex-1 text-lg font-bold text-blue-800 -ml-16">
              {locator.state}
            </div>
            <div className="w-6" /> {/* Spacer to balance layout */}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 rounded-2xl shadow-md border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-900"
          />
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {filteredMessages.map((msg, index) => (
            <div
              key={index}
              className="bg-white py-6 px-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-blue-100 min-h-[100px] flex flex-col justify-center max-w-2xl mx-auto"
            >
              <div className="font-semibold text-blue-700 text-lg">{msg.sender}</div>
              {msg.attachment && (
                <img
                  src={msg.attachment}
                  alt="attachment"
                  className="w-full rounded-md my-2"
                />
              )}
              <div className="text-blue-900 text-base mt-1 whitespace-pre-line break-words">
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <label className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-300">
              <Paperclip size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAttachment}
                className="hidden"
              />
            </label>
            <input
              type="text"
              placeholder={attachment ? "Add a comment..." : "Write a message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
            >
              <Send size={16} /> Send
            </button>
          </div>
          {attachment && (
            <div className="text-center mt-2 text-sm text-gray-500 italic">
              <ImageIcon size={14} className="inline mr-1" /> Image attached
            </div>
          )}
        </div>
      </div>

      {/* Right: Group Members */}
      <div className="w-1/4 bg-blue-100 rounded-xl shadow-lg p-4 overflow-y-auto border-l-4 border-blue-400">
        <h4 className="text-xl font-bold mb-3 text-blue-800">Group Members</h4>
        <ul className="space-y-2 text-blue-900">
          {uniqueMembers.map((member, index) => (
            <li
              key={index}
              className="bg-white p-2 rounded-md shadow-sm border border-blue-200 flex items-center gap-2"
            >
              <User size={16} /> {member}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChannelFeed;
