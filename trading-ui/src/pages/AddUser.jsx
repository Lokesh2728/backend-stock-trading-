import { useState } from "react";
import API from "../Api";

function AddUser({ onUserAdded }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const createUser = async () => {
    if (!name || !email) return setMsg("❌ Fill all fields");
    console.log({ name, email });
    try {
      await API.post("/users", { name, email });

      setMsg("✅ User created");
      setName("");
      setEmail("");

      onUserAdded && onUserAdded(); // refresh list
    } catch (err) {
      setMsg("❌ Email already exists");
    }
  };

  return (
    <div className="card add-user">
      <h3>Add User</h3>

      <input
        className="input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="button" onClick={createUser}>
        Create
      </button>

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}

export default AddUser;