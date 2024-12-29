import { useState } from "react";
import Login from "./components/Login";
import OrderTable from "./components/OrderTable";
import Chat from "./components/Chat";
import "./index.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleChat = (id) => {
    setChatRoomId(id);
  };

  return (
    <div className="container mx-auto">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <OrderTable onChat={handleChat} />
          {chatRoomId && <Chat chatRoomId={chatRoomId} />}
        </>
      )}
    </div>
  );
};

export default App;
