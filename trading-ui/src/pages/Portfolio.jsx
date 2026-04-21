import { useEffect, useState } from "react";
import API from "../Api";
import { connectSocket, disconnectSocket } from "../socket";

function Portfolio({ userId }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);


  useEffect(() => {
  if (!userId) return;

  const fetchPortfolio = async () => {
    try {
      const res = await API.get(`/portfolio/${userId}`);
      setData(res.data.portfolio);
      setTotal(res.data.total_value);
    } catch (err) {
      console.error("❌ Failed to fetch portfolio", err);
    }
  };

  fetchPortfolio();

  // 🔌 Use reusable WebSocket
  connectSocket(`/ws/${userId}`, (msg) => {
    if (
      msg.event === "price_update" ||
      msg.event === "order_executed"
    ) {
      fetchPortfolio();
    }
  });

  return () => disconnectSocket();
}, [userId]);




  return (
    <div className="portfolio-container">
      <h2 className="title">📊 Portfolio</h2>

      {/* TOTAL */}
      <div className="portfolio-total">
        Total Value: ₹{Number(total).toLocaleString()}
      </div>

      {/* EMPTY STATE */}
      {data.length === 0 ? (
        <div className="empty">No positions yet 🚀</div>
      ) : (
        <div className="portfolio-grid">
          {data.map((item, i) => {
            const isProfit = item.pnl >= 0;

            return (
              <div key={i} className="portfolio-card">
                <div className="portfolio-symbol">
                  {item.symbol}
                </div>

                <div className="portfolio-row">
                  Qty: <strong>{item.quantity}</strong>
                </div>

                <div className="portfolio-row">
                  Avg: ₹{item.avg_price}
                </div>

                <div className="portfolio-row">
                  Current: ₹{item.current_price}
                </div>

                <div
                  className={`portfolio-pnl ${
                    isProfit ? "pnl-positive" : "pnl-negative"
                  }`}
                >
                  {isProfit ? "▲" : "▼"} ₹{item.pnl.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Portfolio;
