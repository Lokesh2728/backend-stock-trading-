let socket = null;

export const connectSocket = (path, onMessage) => {
  const BASE = process.env.REACT_APP_API_URL;

  if (!BASE) {
    console.error("❌ REACT_APP_API_URL not set");
    return;
  }

  const WS_URL = BASE.replace("https", "wss").replace("http", "ws");

  // ✅ ensure path starts with '/'
  const finalPath = path.startsWith("/") ? path : `/${path}`;

  const fullUrl = `${WS_URL}${finalPath}`;

  console.log("🔌 Connecting to:", fullUrl); // debug

  socket = new WebSocket(fullUrl);

  socket.onopen = () => console.log("✅ WS connected");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socket.onerror = (err) => {
    console.error("❌ WS Error:", err);
  };

  socket.onclose = () => {
    console.log("🔌 WS closed");
  };
};

export const disconnectSocket = () => {
  if (socket) socket.close();
};
