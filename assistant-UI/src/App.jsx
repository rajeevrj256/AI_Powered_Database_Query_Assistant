import { useEffect, useState } from "react";
import Table from "./components/query_execute/Table";
export default function DatabaseUI() {
  const [formData, setFormData] = useState({
    user: "",
    port: "5432",
    password: "",
    host: "",
    database: "",
  });

  const [isconnected, setIsConnected] = useState(false);
  const [conn, setConn] = useState("");
  const [tables, setTables] = useState(["Select a table"]);
  const [tableSelect, setTableSelect] = useState("null");
  const [querygenerated, setQueryGenerated] = useState(false);
  const[query,setQuery]=useState("");
  const [columns, setColumns] = useState([]);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you with your database queries?" },
    { sender: "user", text: "Please select a database to connect to." }
    
  ]);
  
  

  const [newMessage, setNewMessage] = useState("");
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    
  };
  const handleConnect = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/db_connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setConn(data["conn_pool"]);
      
      setIsConnected(true);
    } catch (error) {
      console.error(error);
    }
  };
  const handleDisconnect = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/db_disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conn_pool: conn }),
      });
      const data = await response.json();
      console.log(data);
      setIsConnected(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTable = async ()=>{
    try{

      if(!isconnected){
        return;
      }
      const response=await fetch("http://127.0.0.1:5000/table_name",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify({ conn_pool: conn }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setTables(data.result);
      } else {
        console.error("Failed to fetch tables:", data.message);
      }
      console.log(data);
    }catch(error){
      console.error(error);
    }
  }

  const handleTableChange=async(e)=>{
    setTableSelect(e.target.value);
    try{

      const response=await fetch("http://127.0.0.1:5000/columns",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body: JSON.stringify({ conn_pool: conn, table_name:e.target.value }),
        });
        const data = await response.json();
        setColumns(data.result);

        //console.log("Columns:", data.result);
      
    }catch(error){
      console.error(error);
    }
  }
  const handleSendMessage= async()=>{
    try{
      if(!isconnected){
        return;
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: newMessage },
      ]);
      const response =  await fetch("http://127.0.0.1:5000/query_generate", {
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

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: data.result.SQL_query},
        ]);
      } else {
        console.error("Failed to fetch tables:", data.message);
      }
      console.log(data);
    }catch(error){
      console.error(error);
    }
    

  }
  
  
  
  useEffect(() => {
    handleTable();
  }, [isconnected]);

  
  



  return (
    <div className="flex h-screen p-6 bg-gray-900 text-white">
      {/* Left Panel - Database Connection */}
      <div className="w-1/4 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📡 Database Connection
        </h2>
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
          <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          onClick={() => {
           handleConnect();
          }
        }>
          Connect
        </button>
        ) : (
          <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          onClick={() => {
            handleDisconnect();
          }
        }>
          Disconnect
        </button>
        )}
      </div>

      {/* Right Panel - SQL Query Assistant */}
      <div className="w-3/4 ml-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          SQL Query Assistant 💬
        </h1>

        {/* Table Selection */}
        <div className="flex gap-4 mb-4">
          <select
          onChange={handleTableChange} value={tableSelect} 
          className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white">
            {tables.map((table) => (
            <option value={table}>{table}</option>
            ))}
          </select>
          <button className="p-2 border border-gray-600 rounded-md text-white hover:bg-gray-700 flex items-center gap-2">
            ➕ Create New Table
          </button>
        </div>

        {!isconnected ? (
          <div className="h-96 bg-gray-800 border border-gray-600 rounded-md flex justify-center items-center text-gray-400">
            ⚠️ Please connect to the database.
          </div>
        ) : (
          <div className="h-[750px] bg-gray-800 border border-gray-600 rounded-md flex flex-col p-4">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-blue-700 ml-auto text-right"
                      : "bg-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex items-center border-t border-gray-600 pt-3">
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
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Table Results */}
      {querygenerated && (
          <div className="mt-4">
            <Table 
              conn={conn} 
              query={query} 
              isconnected={isconnected} 
            />
          </div>
        )}
      </div>
   
  );
}

