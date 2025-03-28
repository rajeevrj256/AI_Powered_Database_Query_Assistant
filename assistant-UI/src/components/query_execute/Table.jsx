import React, { useState, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import ShowTablePopup from "../popup/ShowTablePopup";
import "@fortawesome/fontawesome-free/css/all.min.css";
const Table = ({ conn, query, isConnected, baseUrl ,isPopup = false}) => {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Cache the query results to avoid redundant API calls
  const queryCache = useRef({});

  const fetchQueryData = async () => {
    if (!isConnected || !query) return;

    // Check if the query result is already cached
    if (queryCache.current[query]) {
      console.log("Using cached data for query:", query);
      const cachedData = queryCache.current[query];
      setColumns(cachedData.columns);
      setTableData(cachedData.data);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Start API Call");
      const response = await fetch(`${baseUrl}/query_execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conn_pool: conn, query: query }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.status === "success" && data.result?.data?.length > 0) {
        const extractedColumns = Object.keys(data.result.data[0]);
        const columnOrder = ["id", ...extractedColumns.filter(col => col !== "id")];

        const formattedColumns = columnOrder.map(col => ({
          accessorKey: col,
          header: col,
        }));

        setColumns(formattedColumns);
        setTableData(data.result.data);

        // Cache the query result
        queryCache.current[query] = {
          columns: formattedColumns,
          data: data.result.data,
        };
      } else {
        setError(data.message || "No data found");
        setTableData([]);
      }
    } catch (error) {
      setError("Error executing query: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if the query is not cached
    if (query && !queryCache.current[query]) {
      fetchQueryData();
    }
  }, [query, conn, isConnected, baseUrl]); // Dependencies

  if (!isConnected || !query) return null;

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-gray-800 p-4 rounded-md">
       <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-white">Query Results</h2>
      {!isPopup && (
          <button
           className="p-2 px-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => setPopupOpen(true)}
          >
           <i className="fa-solid fa-expand"></i>
          </button>
        )}
    </div>

      {isLoading ? (
        <div className="text-white">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : tableData.length === 0 ? (
        <div className="text-gray-400">No results found</div>
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 8rem)" }}>
            <table className="w-full border-collapse">
              <thead className="bg-gray-700">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="border border-gray-600 p-2 text-left text-white">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-gray-700 hover:bg-gray-700">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="border border-gray-600 p-2 text-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <ShowTablePopup
            isOpen={popupOpen}
            onClose={() => setPopupOpen(false)}
            conn={conn}
            query={query}
            isConnected={isConnected}
            baseUrl={baseUrl}
          />
        </>
      )}
    </div>
  );
};

export default Table;