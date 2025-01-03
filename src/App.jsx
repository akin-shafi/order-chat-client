import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register"; // Import Registration Component
import OrderTable from "./components/OrderTable";
import Chat from "./components/Chat";
import "./index.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [isRegister, setIsRegister] = useState(false); // Track registration status

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    setIsRegister(false); // Switch back to login after successful registration
  };

  const handleChat = (id) => {
    setChatRoomId(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
  };

  return (
    <div className="container mx-auto">
      {!isLoggedIn ? (
        isRegister ? (
          <Register onRegister={handleRegister} />
        ) : (
          <Login onLogin={handleLogin} />
        )
      ) : (
        <>
          <OrderTable onChat={handleChat} onLogout={handleLogout} />
          {chatRoomId && <Chat chatRoomId={chatRoomId} />}
        </>
      )}
      {!isRegister && !isLoggedIn && (
        <div className="text-center mt-4">
          <button
            onClick={() => setIsRegister(true)}
            className="text-blue-500 hover:underline"
          >
            {`Don't`} have an account? Register
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
