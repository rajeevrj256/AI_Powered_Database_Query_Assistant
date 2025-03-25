import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Database } from "lucide-react";

export default function DatabaseUI() {
  const [formData, setFormData] = useState({
    username: "",
    port: "5432",
    password: "",
    host: "",
    database: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex h-screen p-6 bg-gray-900 text-white">
      {/* Left Panel - Database Connection */}
      <div className="w-1/4 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} /> Database Connection
        </h2>
        <Input placeholder="Username" name="username" onChange={handleChange} className="mb-2 bg-gray-700 border-gray-600 text-white" />
        <Input placeholder="Port" name="port" onChange={handleChange} className="mb-2 bg-gray-700 border-gray-600 text-white" />
        <Input placeholder="Password" name="password" type="password" onChange={handleChange} className="mb-2 bg-gray-700 border-gray-600 text-white" />
        <Input placeholder="Host" name="host" onChange={handleChange} className="mb-2 bg-gray-700 border-gray-600 text-white" />
        <Input placeholder="Database" name="database" onChange={handleChange} className="mb-4 bg-gray-700 border-gray-600 text-white" />
        <Button className="w-full bg-blue-600 hover:bg-blue-700">Connect</Button>
      </div>

      {/* Right Panel - SQL Query Assistant */}
      <div className="w-3/4 ml-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          SQL Query Assistant <span className="text-gray-400">💬</span>
        </h1>
        
        {/* Dropdown and Create Table Button */}
        <div className="flex gap-4 mb-4">
          <Select>
            <SelectTrigger className="w-[200px] bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select Table" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 text-white">
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="orders">Orders</SelectItem>
              <SelectItem value="products">Products</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2 border-gray-600 text-white">
            <Plus size={16} /> Create New Table
          </Button>
        </div>

        {/* Query Assistant UI */}
        <Card className="h-96 bg-gray-800 border-gray-600 text-white">
          <CardContent className="h-full flex justify-center items-center text-gray-400">
            ⚠️ Please connect to the database.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
