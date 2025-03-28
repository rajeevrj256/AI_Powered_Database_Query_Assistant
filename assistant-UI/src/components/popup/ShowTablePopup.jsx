import React from "react";
import Table from "../query_execute/Table";

export default function ShowTablePopup({ isOpen, onClose, conn, query, isConnected, baseUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4">
        
          <button
            className="text-gray-400 hover:text-gray-200"
            onClick={onClose}
          >
            ✖
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {/* Render the Table component */}
          <Table conn={conn} query={query} isConnected={isConnected} baseUrl={baseUrl} isPopup={true} />
        </div>
      </div>
    </div>
  );
}