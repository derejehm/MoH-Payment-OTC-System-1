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

const paymentMethods = [
  "All",
  "Cash",
  "Digital",
  "CBHI",
  "Free Service",
  "Credit",
];
const mockData = [
  {
    id: 1,
    cardNumber: "123456",
    amount: 500,
    method: "Cash",
    reason: "Routine Checkup",
    description: "General consultation fee",
    date: "2025-03-15",
  },
  {
    id: 2,
    cardNumber: "789012",
    amount: 1200,
    method: "Digital",
    reason: "Surgery",
    description: "Pre-surgery payment",
    date: "2025-03-15",
  },
  {
    id: 3,
    cardNumber: "345678",
    amount: 800,
    method: "CBHI",
    reason: "Emergency",
    description: "Emergency treatment",
    date: "2025-03-16",
  },
  {
    id: 4,
    cardNumber: "901234",
    amount: 400,
    method: "Free Service",
    reason: "Vaccination",
    description: "Government-sponsored vaccination",
    date: "2025-03-16",
  },
  {
    id: 5,
    cardNumber: "567890",
    amount: 1000,
    method: "Credit",
    reason: "Maternity",
    description: "Hospital maternity charges",
    date: "2025-03-17",
  },
];

const ReportPage = () => {
  const [payments, setPayments] = useState(() => {
    const storedPayments = localStorage.getItem("hospitalPayments");
    return storedPayments ? JSON.parse(storedPayments) : mockData;
  });

  const [selectedMethod, setSelectedMethod] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredPayments, setFilteredPayments] = useState(payments);

  useEffect(() => {
    localStorage.setItem("hospitalPayments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    setFilteredPayments(
      payments.filter(
        (payment) =>
          (selectedMethod === "All" || payment.method === selectedMethod) &&
          (!startDate ||
            !endDate ||
            (payment.date >= startDate && payment.date <= endDate))
      )
    );
  }, [selectedMethod, startDate, endDate, payments]);

  const handleMethodChange = (event, newValue) => {
    setSelectedMethod(newValue);
  };

  const calculateTotal = (method) => {
    return payments
      .filter(
        (payment) =>
          (method === "All" || payment.method === method) &&
          (!startDate ||
            !endDate ||
            (payment.date >= startDate && payment.date <= endDate))
      )
      .reduce((sum, payment) => sum + Number(payment.amount), 0); // Ensure amount is treated as a number
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredPayments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments Report");
    XLSX.writeFile(
      wb,
      `Payments_Report_${startDate}_to_${endDate}_${selectedMethod}.xlsx`
    );
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "cardNumber", headerName: "Card Number", width: 150 },
    { field: "amount", headerName: "Amount", width: 120 },
    { field: "method", headerName: "Payment Method", width: 150 },
    { field: "reason", headerName: "Reason", width: 200 },
    { field: "description", headerName: "Description", width: 200 },
    { field: "date", headerName: "Date", width: 150 },
  ];
  const handleReportRequest = async()=>{
    console.log({startDate:startDate,endDate:endDate,selectedMethod:selectedMethod})
  }

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Payment Reports
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
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
          onClick={handleReportRequest}
          sx={{ marginRight: 2 }}
        >
          Request Report
        </Button>
        <Tabs
          value={selectedMethod}
          onChange={handleMethodChange}
          variant="scrollable"
          sx={{ marginTop: 2 }}
        >
          {paymentMethods.map((method) => (
            <Tab
              key={method}
              label={`${method} (${calculateTotal(method)})`}
              value={method}
            />
          ))}
        </Tabs>
      </Paper>
      <Paper sx={{ height: 400, marginBottom: 2 }}>
        <DataGrid
          rows={filteredPayments.length ? filteredPayments : []}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={exportToExcel}
      >
        Export to Excel
      </Button>
    </Container>
  );
};

export default ReportPage;
