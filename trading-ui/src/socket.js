let socket = null;

export const connectSocket = (path, onMessage) => {
  const WS_URL = process.env.REACT_APP_API_URL.replace("https", "wss");

  socket = new WebSocket(`${WS_URL}${path}`);

  socket.onopen = () => {
    console.log("✅ WebSocket connected:", path);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socket.onerror = (err) => {
    console.error("❌ WS Error:", err);
  };
};

export const disconnectSocket = () => {
  if (socket) socket.close();
};
