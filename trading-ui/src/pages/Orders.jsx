import { useEffect, useState } from "react";
import API from "../Api";
import { connectSocket, disconnectSocket } from "../socket";

function Orders({ userId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // 📥 Fetch Orders
    const fetchOrders = async () => {
      try {
        const res = await API.get(`/orders/${userId}`);

        const sorted = res.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setOrders(sorted);
      } catch (err) {
        console.error("❌ Failed to fetch orders", err);
      }
    };

    fetchOrders();

    // 🔌 WebSocket via reusable service
    connectSocket(userId, (data) => {
      if (data.event === "order_executed") {
        console.log("📡 Order executed, refreshing...");
        fetchOrders();
      }
    });

    // cleanup
    return () => disconnectSocket();
  }, [userId]);

  return (
    <div className="orders-container">
      <h2 className="title">📜 Order History</h2>

      {orders.length === 0 ? (
        <div className="empty">No orders yet 🚀</div>
      ) : (
        <div className="card table">
          <div className="table-header">
            <span>Symbol</span>
            <span>Side</span>
            <span>Qty</span>
            <span>Price</span>
          </div>

          {orders.map((o) => (
            <div key={o.id} className="table-row">
              <span className="symbol">{o.symbol}</span>

              <span
                className={`badge ${
                  o.side === "BUY" ? "badge-buy" : "badge-sell"
                }`}
              >
                {o.side}
              </span>

              <span>{o.qty}</span>

              <span>₹{Number(o.price).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
