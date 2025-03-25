import React, { useState, useEffect } from "react";
import {
  Container,
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { getTokenValue } from "../../services/user_service";

const tokenvalue = getTokenValue();
const mockData = [
  {
    id: 1,
    startDate: "2025-03-01",
    endDate: "2025-03-03",
    amount: 10000,
    status: "collected",
    collector: "lorem",
    colletcedDate: "2025-03-03",
  },
  {
    id: 2,
    startDate: "2025-03-05",
    endDate: "2025-03-08",
    amount: 15000,
    status: "collected",
    collector: "lorem",
    colletcedDate: "2025-03-08",
  },
  {
    id: 3,
    startDate: "2025-03-10",
    endDate: "2025-03-18",
    amount: 10800,
    status: "collected",
    collector: "lorem",
    colletcedDate: "2025-03-18",
  },
  {
    id: 4,
    startDate: "2025-03-20",
    endDate: "2025-03-25",
    amount: 10010,
    status: "collected",
    collector: "lorem",
    colletcedDate: "2025-03-25",
  },
  {
    id: 5,
    startDate: "2025-03-27",
    endDate: "2025-03-31",
    amount: 10900,
    status: "collected",
    collector: "lorem",
    colletcedDate: "2025-03-31",
  },
];
const sorted  = mockData.sort((a, b) => b.id - a.id)
const CollectedReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(mockData, {
      header: Object.keys(mockData[0]),
    });

    // Make headers bold
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cell_address]) continue;
      ws[cell_address].s = {
        font: { bold: true, color: { rgb: "000000" } }, // Bold black font
        alignment: { horizontal: "center", vertical: "center" },
      };
    }

    // Format "Amount" column with comma separator
    const amountColumnIndex = Object.keys(mockData[0]).indexOf("amount");
    if (amountColumnIndex !== -1) {
      for (let R = 1; R <= range.e.r; ++R) {
        const cell_address = XLSX.utils.encode_cell({
          r: R,
          c: amountColumnIndex,
        });
        if (ws[cell_address]) {
          ws[cell_address].z = "#,##0.00"; // Format as thousands separator with two decimal places
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Collection Report");

    // Apply auto-width for better readability
    ws["!cols"] = Object.keys(mockData[0]).map(() => ({ wch: 15 }));

    XLSX.writeFile(wb, `Payments_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "startDate", headerName: "Start Date", width: 150 },
    { field: "endDate", headerName: "End Date", width: 120 },
    { field: "amount", headerName: "Amount", width: 150 },
    { field: "status", headerName: "Status", width: 200 },
    { field: "collector", headerName: "Collector", width: 200 },
    { field: "colletcedDate", headerName: "Collected Date", width: 150 },
  ];

  useEffect(()=>{
console.log({startDate:startDate, endDate: endDate,User:tokenvalue.name} )
  },[])
  const handleReportRequest = async (e) => {
    e.preventDefault();
    console.log({ startDate: startDate, endDate: endDate,User:tokenvalue.name });
  };

  return (
    <Container>
      <form onSubmit={handleReportRequest}>
        <Typography variant="h5" gutterBottom>
          Collection Report
        </Typography>
        <Paper sx={{ padding: 2, marginBottom: 2 }}>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e)=>setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            sx={{ marginRight: 2 }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            sx={{ marginRight: 2 }}
          />
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            sx={{ marginRight: 2 }}
          >
            Request Report
          </Button>
        </Paper>
      </form>
      <Paper sx={{ height: 400, marginBottom: 2 }}>
        <DataGrid
          rows={sorted}
          columns={columns}
        />
      </Paper>
      <Button
        variant="contained"
        fullWidth
        sx={{maxWidth:"150px",background:"#6870fa"}}
        onClick={exportToExcel}
      >
        Export to Excel
      </Button>
    </Container>
  );
};

export default CollectedReport;
