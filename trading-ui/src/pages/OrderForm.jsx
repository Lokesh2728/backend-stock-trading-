import { useState } from "react";
import API from "../Api";

function OrderForm({ userId }) {
  const [symbol, setSymbol] = useState("SBIN");
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState("BUY");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const placeOrder = async () => {
    if (!userId) return alert("Select user first");

    setLoading(true);
    setMsg("");

    try {
      await API.post("/orders", {
        user_id: userId,
        symbol,
        qty,
        side,
      });

      setMsg("success");
    } catch (err) {
      setMsg("error");
    }

    setLoading(false);
  };

  return (
    <div className="card order-form">
      <h2 className="title">💸 Place Order</h2>

      {/* SYMBOL */}
      <div className="form-row">
        <label className="label">Stock</label>
        <select
          className="select"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        >
          <option>SBIN</option>
          <option>RELIANCE</option>
        </select>
      </div>

      {/* QUANTITY */}
      <div className="form-row">
        <label className="label">Quantity</label>
        <input
          type="number"
          className="input"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </div>

      {/* BUY / SELL */}
      <div className="toggle">
        <button
          className={`toggle-btn ${side === "BUY" ? "buy" : ""}`}
          onClick={() => setSide("BUY")}
        >
          BUY
        </button>

        <button
          className={`toggle-btn ${side === "SELL" ? "sell" : ""}`}
          onClick={() => setSide("SELL")}
        >
          SELL
        </button>
      </div>

      {/* SUBMIT */}
      <button className="button" onClick={placeOrder} disabled={loading}>
        {loading ? "Processing..." : "Place Order"}
      </button>

      {/* MESSAGE */}
      {msg === "success" && (
        <div className="msg success">✅ Order placed</div>
      )}
      {msg === "error" && (
        <div className="msg error">❌ Failed</div>
      )}
    </div>
  );
}

export default OrderForm;