import React, { useState } from "react";

const Table = ({ conn, query, isconnected }) => {
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleQueryExecute = async () => {
    try {
      if (!isconnected) {
        console.log("Not connected to the database.");
        return;
      }
      console.log("Executing query:");

      const response = await fetch("http://127.0.0.1:5000/query_execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conn_pool: conn,
          query: query,
        }),
      });

      const data = await response.json();
      setTableData(data.result?.data || []);
      setColumns(data.result?.columns || []);

      console.log("Query Result:", data);
    } catch (error) {
      console.error("Error executing query:", error);
    }
  };

  return (
    <div>
      <h1>Table Data</h1>
      <button onClick={handleQueryExecute}>Execute Query</button>
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
