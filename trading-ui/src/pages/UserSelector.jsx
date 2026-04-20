import { useEffect, useState } from "react";
import API from "../Api";
import "../App.css";
import AddUser from "./AddUser";

function UserSelector({ setUserId }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
  API.get("/users").then((res) => setUsers(res.data));
}, [refresh]);

  const handleSelect = (user) => {
    setSelected(user.id);
    setUserId(user.id);
  };

  const refreshUsers = () => setRefresh(prev => prev + 1);

  return (
    <div className="user-container">
      <AddUser onUserAdded={refreshUsers} />
      <h2 className="user-title">👤 Select User</h2>

      <div className="user-grid">
        {users.map((u) => (
          <div
            key={u.id}
            className={`user-card ${
              selected === u.id ? "active" : ""
            }`}
            onClick={() => handleSelect(u)}
          >
            <div className="avatar">
              {u.name.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <div className="user-name">{u.name}</div>
              <div className="user-email">{u.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserSelector;