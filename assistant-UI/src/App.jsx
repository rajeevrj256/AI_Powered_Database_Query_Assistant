import { useState } from "react";

export default function DatabaseUI() {
  const [formData, setFormData] = useState({
    username: "",
    port: "5432",
    password: "",
    host: "",
    database: "",
  });

  const [isconnected, setIsConnected] = useState(false);
  const [conn, setConn] = useState(false);
  const [tables, setTables] = useState(["Select a table"]);
  const [tableSelect, setTableSelect] = useState("null");

  const [columns, setColumns] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex h-screen p-6 bg-gray-900 text-white">
      {/* Left Panel - Database Connection */}
      <div className="w-1/4 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📡 Database Connection
        </h2>
        <input
          type="text"
          placeholder="Username"
          name="username"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <input
          type="text"
          placeholder="Port"
          name="port"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <input
          type="text"
          placeholder="Host"
          name="host"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <input
          type="text"
          placeholder="Database"
          name="database"
          onChange={handleChange}
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded-md">
          Connect
        </button>
      </div>

      {/* Right Panel - SQL Query Assistant */}
      <div className="w-3/4 ml-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          SQL Query Assistant 💬
        </h1>

        {/* Table Selection */}
        <div className="flex gap-4 mb-4">
          <select className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white">
            {tables.map((table) => (
            <option value={table}>{table}</option>
            ))}
          </select>
          <button className="p-2 border border-gray-600 rounded-md text-white hover:bg-gray-700 flex items-center gap-2">
            ➕ Create New Table
          </button>
        </div>

        {/* Query Output Card */}
        <div className="h-96 bg-gray-800 border border-gray-600 rounded-md flex justify-center items-center text-gray-400">
          ⚠️ Please connect to the database.
        </div>
      </div>
    </div>
  );
}
