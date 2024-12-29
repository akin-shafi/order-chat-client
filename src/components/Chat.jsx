/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const Chat = ({ chatRoomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState(
    localStorage.getItem("chatUsername") || ""
  );
  const [isUsernameSet, setIsUsernameSet] = useState(
    !!localStorage.getItem("chatUsername")
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isChatClosed, setIsChatClosed] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [closingReason, setClosingReason] = useState("");
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${baseURL}/chat/${chatRoomId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(response.data);
      } catch (error) {
        setErrorMessage("Error fetching initial messages.");
        console.error("Error fetching initial messages:", error);
      }
    };

    const socket = io(baseURL);
    socket.emit("joinRoom", chatRoomId);
    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    fetchInitialMessages();

    return () => {
      socket.emit("leaveRoom", chatRoomId);
      socket.disconnect();
    };
  }, [baseURL, chatRoomId]);

  const handleSendMessage = async () => {
    const messageContent = `${username}: ${newMessage}`;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), content: messageContent },
    ]);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${baseURL}/chat/${chatRoomId}/messages`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      setErrorMessage(error.response.data.message || "An error occurred");
      console.error("Error sending message:", error);
    }
  };

  const handleSetUsername = () => {
    if (username.trim() !== "") {
      localStorage.setItem("chatUsername", username);
      setIsUsernameSet(true);
    } else {
      setErrorMessage("Please enter a username.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseURL}/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );
      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      setErrorMessage("Error deleting message.");
      console.error("Error deleting message:", error);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessageId(message.id);
    setEditingMessage(message.content);
  };

  const handleSaveEditMessage = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${baseURL}/chat/messages/${messageId}`,
        { content: editingMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, content: editingMessage } : msg
        )
      );
      setEditingMessageId(null);
      setEditingMessage("");
      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      setErrorMessage(error.response.data.message || "An error occurred");
      console.error("Error editing message:", error);
    }
  };

  const handleClearHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseURL}/chat/chatRoom/${chatRoomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      setErrorMessage("Error clearing chat history.");
      console.error("Error clearing chat history:", error);
    }
  };

  const handleCloseChat = async () => {
    if (closingReason.trim() === "") {
      setErrorMessage("Please enter a closing message.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${baseURL}/chat/${chatRoomId}/close`,
        {
          concludingMessage: closingReason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsChatClosed(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: "Chat closed: " + closingReason },
      ]);
      setClosingReason(""); // Clear the closing message input
      setErrorMessage(""); // Clear any previous error message
    } catch (error) {
      setErrorMessage(error.response.data.message || "An error occurred");
      console.error("Error closing chat:", error);
    }
  };

  const toggleOptions = () => setShowOptions(!showOptions);

  return (
    <div className="fixed bottom-0 right-0 bg-white p-4 border shadow-md w-1/3">
      {!isUsernameSet ? (
        <div>
          <h2 className="text-2xl mb-4">Enter Your Username</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full mb-2"
            placeholder="Enter your username..."
          />
          <button
            onClick={handleSetUsername}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            Set Username
          </button>
          {errorMessage && (
            <div className="text-red-500 mt-2">{errorMessage}</div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl">Chat Room</h2>
            <div className="relative">
              <button
                onClick={toggleOptions}
                className="bg-gray-300 p-2 rounded"
              >
                &#x22EE; {/* Vertical ellipsis icon for options */}
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                  <button
                    onClick={handleClearHistory}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() =>
                      setShowOptions(false) || setIsChatClosed(true)
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Close Chat
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-y-auto h-64 mb-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2 group relative">
                <div>
                  <strong>
                    {editingMessageId === msg.id ? (
                      <input
                        type="text"
                        value={editingMessage}
                        onChange={(e) => setEditingMessage(e.target.value)}
                        className="border p-2 w-full"
                      />
                    ) : (
                      msg.content
                    )}
                  </strong>
                </div>
                {editingMessageId === msg.id ? (
                  <button
                    onClick={() => handleSaveEditMessage(msg.id)}
                    className="absolute right-0 top-0 text-green-500"
                  >
                    &#x2713; {/* Check icon for save */}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditMessage(msg)}
                      className="absolute right-0 top-0 hidden group-hover:block text-blue-500"
                    >
                      &#x270E; {/* Pencil icon for edit */}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute right-10 top-0 hidden group-hover:block text-red-500"
                    >
                      &times; {/* Cross icon for delete */}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          {errorMessage && (
            <div className="text-red-500 mb-2"> {errorMessage} </div>
          )}
          {!isChatClosed ? (
            <>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="border p-2 w-full mb-2"
                placeholder="Type your message..."
              />
              <button
                onClick={handleSendMessage}
                className="w-full bg-blue-500 text-white p-2 rounded"
              >
                Send
              </button>
            </>
          ) : null}
          {isChatClosed && closingReason ? (
            <div className="flex flex-col mt-4">
              <p className="text-lg text-center">{closingReason}</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Chat;
