import React, { useState } from "react";
import { toast } from "react-toastify";
export default function CreateTablePopup({ isOpen, onClose, conn,baseUrl }) {
    const [tableName, setTableName] = useState("");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        setIsLoading(true);
        try {

            const formData = new FormData();
            formData.append("conn_pool", conn);
            formData.append("table_name", tableName);
            formData.append("file", file);
            
            const response = await fetch(`${baseUrl}/create_bulk_table`, {
                method: "POST",
               
                body: formData,
            });
            const data = await response.json();
            console.log(data);

            if (data.status === "success") {
                toast.success("Table created successfully!", {
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
                toast.warn(`Warning: ${data.message}`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            }
            setIsLoading(false);
            onClose();
        } catch (error) {
            console.error("Error creating table:", error);
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Create New Table</h2>
                    <button
                        className="text-gray-400 hover:text-gray-200"
                        onClick={onClose}
                    >
                        ✖
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Table Name</label>
                    <input
                        type="text"
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">Upload File</label>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
                        onClick={handleCreate}
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}

