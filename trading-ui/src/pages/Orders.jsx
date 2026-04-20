import { useEffect, useState } from "react";
import API from "../Api";

function Orders({ userId }) {
  const [orders, setOrders] = useState([]);

  

  useEffect(() => {
  if (!userId) return;

  const fetchOrders = () => {
    API.get(`/orders/${userId}`).then((res) => {
      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sorted);
    });
  };

  fetchOrders();

  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${userId}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.event === "order_executed") {
      fetchOrders();
    }
  };

  return () => ws.close();
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