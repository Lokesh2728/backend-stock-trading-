import { useState } from "react";
import Prices from "./Prices";
import OrderForm from "./OrderForm";
import Portfolio from "./Portfolio";
import Orders from "./Orders";
import UserSelector from "./UserSelector";
import "../App.css"

function Dashboard() {
  const [userId, setUserId] = useState(null);

  return (
    <div className="container">
  <h1 className="header ">📈 Trading Dashboard</h1>

  <div className="grid">
    <div className="sidebar">
      <UserSelector setUserId={setUserId} />
    </div>

    <div className="main">
      <div className="card">
        <Prices />
      </div>

      <div className="row">
        <div className="card">
          <OrderForm userId={userId} />
        </div>

        <div className="card">
          <Portfolio userId={userId} />
        </div>
      </div>

      <div className="card">
        <Orders userId={userId} />
      </div>
    </div>
  </div>
</div>
  );
}

export default Dashboard;