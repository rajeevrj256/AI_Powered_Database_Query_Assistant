import { useEffect, useState } from "react";
import Table from "./components/query_execute/Table";
import CreateTablePopup from "./components/popup/CreateTablePopUp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShowTablePopup from "./components/popup/ShowTablePopup";
import { toast } from "react-toastify";
export default function DatabaseUI() {
  const [formData, setFormData] = useState({
    user: "",
    port: "",
    password: "",
    host: "",
    database: "",
  });
  const database = ["Select Database ", "PostgreSQL", "MySQL", "Oracle"];
  const [selectDatabase, setSelectDatabase] = useState(database[0]);
  const [validDatabase, setValidDatabase] = useState(false);
  const datbaseBaseUrl = {
    PostgreSQL: "http://65.0.5.182:5000/postgresql",
    MySQL: "",
    Oracle: "",
  };
  const [baseUrl, setBaseUrl] = useState("");

  const [isconnected, setIsConnected] = useState(false);
  const [conn, setConn] = useState("");
  const [tables, setTables] = useState(["Select a table"]);
  const [tableSelect, setTableSelect] = useState("null");
  const [querygenerated, setQueryGenerated] = useState(false);
  const [latestQuery, setLatestQuery] = useState("");

  const [query, setQuery] = useState("");

  const [columns, setColumns] = useState([]);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you with your database queries?" },
  ]);
  const [popupOpen, setPopupOpen] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [copiedStates, setCopiedStates] = useState(messages.map(() => false));


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prevCopiedStates) => {
      const updatedStates = [...prevCopiedStates];
      updatedStates[index] = true;
      return updatedStates;
    });
    setTimeout(() => {
      setCopiedStates((prevCopiedStates) => {
        const updatedStates = [...prevCopiedStates];
        updatedStates[index] = false;
        return updatedStates;
      });
    }, 5000);
  };

  const handlebaseUrl = (selectDatabase) => {
    if (selectDatabase === "Select Database ") {
      setValidDatabase(false);
      return;
    }
    const newBaseUrl = datbaseBaseUrl[selectDatabase];
    setBaseUrl(newBaseUrl);
    setValidDatabase(true);
    console.log(newBaseUrl);
  };



  const handleConnect = async () => {
    try {

      if (!validDatabase) {
        toast.error("Please select a valid database");
        return;
      }
      const response = await fetch(`${baseUrl}/db_connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data["status"] === "success") {

        setConn(data["conn_pool"]);
        setIsConnected(true);
        toast.success("Connected to the database", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast.error(data["message"]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch(`${baseUrl}/db_disconnect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conn_pool: conn }),
      });
      const data = await response.json();
      if (data["status"] === "success") {
        setIsConnected(false);
        setConn("");
        setTables([]);
        setColumns([]);
        toast.success("Disconnected from the database", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast.warn(data["message"]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTable = async () => {
    try {
      if (!isconnected) {
        return;
      }
      const response = await fetch(`${baseUrl}/table_name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conn_pool: conn }),
      });
      const data = await response.json();
      if (data.status === "success") {

        setTables(data.result);
        setTableSelect(fetchedTables.length > 0 ? fetchedTables[0] : "Select a table");
      } else {
        console.error("Failed to fetch tables:", data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTableChange = async (e) => {

    setTableSelect(e.target.value);
    try {
      const response = await fetch(`${baseUrl}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conn_pool: conn, table_name: e.target.value }),
      });
      const data = await response.json();
      setColumns(data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!isconnected) {
        return;
      }

      if (tableSelect === "Select a table" || tableSelect === "") {
        // Ensure the user selects a valid table
        toast.error("Please select a table.");
        return;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: newMessage },
      ]);
      const response = await fetch(`${baseUrl}/query_generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conn_pool: conn,
          table_name: tableSelect,
          column_names: columns,
          prompt: newMessage,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setQueryGenerated(true);
        setQuery(data.result.SQL_query);

        const tableData = "Table Data";

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "bot",
            text: data.result.SQL_query,
            tableData: tableData,
          },
        ]);
      } else {
        toast.error(data.message);
        console.error("Failed to fetch tables:", data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleTable();
  }, [isconnected]);

  return (
    <div className="flex h-screen p-6 bg-gray-900 text-white">
      <ToastContainer />
      <div className="w-1/4 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📡 Database Connection
        </h2>
        <label className="block text-sm text-gray-400 mb-1">Select Database</label>
        <select
          value={selectDatabase}
          onChange={(e) => {
            const selectedDatabase = e.target.value;
            setSelectDatabase(selectedDatabase);
            handlebaseUrl(selectedDatabase);
          }}
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white"
        >
          {database.map((db) => (
            <option key={db} value={db}>
              {db}
            </option>
          ))}
        </select>
        <label>username</label>
        <input
          type="text"
          placeholder="User"
          name="user"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <label>Port</label>
        <input
          type="text"
          placeholder="Port"
          name="port"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <label>Host</label>
        <input
          type="text"
          placeholder="Host"
          name="host"
          onChange={handleChange}
          className="w-full p-2 mb-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <label>Database</label>
        <input
          type="text"
          placeholder="Database"
          name="database"
          onChange={handleChange}
          className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        {!isconnected ? (
          <button
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded-md"
            onClick={handleConnect}
          >
            Connect
          </button>
        ) : (
          <button
            className={`w-full p-2 rounded-md ${isconnected ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            onClick={() => {
              if (isconnected) {
                handleDisconnect();
              } else {
                handleConnect();
              }
            }}
          >
            {isconnected ? "Disconnect" : "Connect"}
          </button>
        )}
      </div>

      <div className="w-3/4 ml-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          SQL Query Assistant 💬
        </h1>

        <div className="flex gap-4 mb-4">
          <select
            onChange={handleTableChange}
            value={tableSelect}
            className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          >
            <option value="">Select Table</option>
            {tables.map((table) => (
              <option value={table}>{table}</option>
            ))}
          </select>
          <button
            onClick={() => setPopupOpen(true)}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-md"
          >
            ➕ Create New Table
          </button>
        </div>
        <CreateTablePopup
          isOpen={popupOpen}
          onClose={() => setPopupOpen(false)}
          conn={conn}
          baseUrl={baseUrl}
        />

        {!isconnected ? (
          <div className="h-96 bg-gray-800 border border-gray-600 rounded-md flex justify-center items-center text-gray-400">
            ⚠️ Please connect to the database.
          </div>
        ) : (
          <div className="h-[540px] bg-gray-800 border border-gray-600 rounded-md flex flex-col p-4">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map((msg, index) => {
                const textLength = msg.text.length;
                const userMessageWidth = Math.min(300 + textLength * 2, 600);

                return (
                  <div
                    key={index}
                    className={`p-2 rounded-md ${msg.sender === "user"
                        ? "bg-blue-700 ml-auto text-right"
                        : "bg-gray-700"
                      }`}
                    style={{
                      maxWidth: msg.sender === "user" ? `${userMessageWidth}px` : "55%",
                      wordWrap: "break-word",
                    }}
                  >
                    {msg.sender === "bot" ? (
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-400 p-2 rounded-md overflow-x-auto">
                          <code>{msg.text}</code>
                        </pre>
                        <button
                          className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-md hover:bg-gray-500"
                          onClick={() => handleCopy(msg.text, index)}
                        >
                          {copiedStates[index] ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ) : (
                      msg.text
                    )}
                    {msg.sender === "bot" && msg.tableData && msg.tableData.length > 0 && (
                      <div className="mt-4">
                        <Table
                          conn={conn}
                          query={msg.text}
                          isConnected={isconnected}
                          baseUrl={baseUrl}
                        />

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-600 p-3 flex items-center">
              <input
                type="text"
                placeholder="Type your SQL query..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
              <button
                className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
