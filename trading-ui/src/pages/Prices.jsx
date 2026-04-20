import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function Prices() {
  const [prices, setPrices] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/1");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.event === "price_update") {
        const current = data.data;
        setPrices(current);

        // store history for chart
        setHistory((prev) => [
          ...prev.slice(-20), 
          { time: new Date().toLocaleTimeString(), ...current },
        ]);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ marginBottom: 20 }}>
      <h2>📈 Live Market</h2>

      {/* PRICE NUMBERS */}
      <div style={{ display: "flex", gap: 20 }}>
        {Object.entries(prices).map(([symbol, price]) => (
          <div key={symbol}>
            <strong>{symbol}</strong>: ₹{price}
          </div>
        ))}
      </div>

      {/* LINE CHART */}
      <LineChart width={600} height={300} data={history}>
        <CartesianGrid stroke="#0d0505" />
        <XAxis dataKey="time" hide />
        <YAxis />
        <Tooltip />

        <Line type="monotone" dataKey="SBIN" stroke="#8884d8" />
        <Line type="monotone" dataKey="RELIANCE" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}

export default Prices;