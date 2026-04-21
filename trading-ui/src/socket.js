let socket = null;

export const connectSocket = (userId, onMessage) => {
  const WS_URL = process.env.REACT_APP_API_URL.replace("https", "wss");

  socket = new WebSocket(`${WS_URL}/ws/${userId}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data); 
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket error", err);
  };

  socket.onclose = () => {
    console.log("🔌 WebSocket closed");
  };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.close();
  }
};
