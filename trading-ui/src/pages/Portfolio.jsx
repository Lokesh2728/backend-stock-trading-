import { useEffect, useState } from "react";
import API from "../Api";

function Portfolio({ userId }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);


  useEffect(() => {
  if (!userId) return;

  const fetchPortfolio = () => {
    API.get(`/portfolio/${userId}`).then((res) => {
      setData(res.data.portfolio);
      setTotal(res.data.total_value);
    });
  };

  fetchPortfolio(); 

  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${userId}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (
      data.event === "price_update" ||
      data.event === "order_executed"
    ) {
      fetchPortfolio();
    }
  };

  return () => ws.close();
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