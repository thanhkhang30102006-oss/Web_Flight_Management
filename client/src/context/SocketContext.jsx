import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  // SỬA ĐỔI: Dùng useState thay vì useRef để component cập nhật được giá trị mới
  const [socket, setSocket] = useState(null);

  const connectSocket = () => {
    // Chỉ kết nối nếu chưa có socket
    if (!socket) {
      const newSocket = io("http://localhost:3001", {
        transports: ["websocket"],
        reconnection: true,
      });

      console.log("Socket Global Connected");

      // Lưu vào state để BookingPage nhận được
      setSocket(newSocket);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      console.log("Socket Global Disconnected");
    }
  };

  // Tự động connect khi App chạy lần đầu
  useEffect(() => {
    connectSocket();

    // Cleanup khi tắt app (tuỳ chọn)
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
