import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { PieChart, Pie, Cell, Legend } from "recharts";
import AgreementDialog from "./AgreementDialog";

const COLORS = ["#00C49F", "#FF8042"];

const PaymentStatusCard = ({ title, amount, trend }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" color="primary">
          ETB {amount.toLocaleString()}
        </Typography>
        <Box display="flex" alignItems="center" mt={2}>
          <Typography variant="body2" color="textSecondary">
            {trend}% from last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const FinancialDashboard = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const initialTransactions = [
    { id: 1, startDate: "2024-01-01", endDate: "2024-01-31", amount: 5000, status: "collected" },
    { id: 2, startDate: "2024-02-01", endDate: "2024-02-28", amount: 7000, status: "uncollected" },
    { id: 3, startDate: "2024-03-01", endDate: "2024-03-31", amount: 6000, status: "collected" },
  ];
  
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (!storedTransactions) {
      localStorage.setItem("transactions", JSON.stringify(initialTransactions));
      setTransactions(initialTransactions);
    } else {
      setTransactions(storedTransactions);
    }
  }, []);


  const handleSubmit = async(data)=>{
    console.log('Recived Data>> ',data,selectedTransaction)
    initialTransactions.map((prev)=>({
      ...prev,
         
    }))
    const updatedTransactions = initialTransactions.map((transaction) =>
      transaction.id === selectedTransaction.id
        ? { ...transaction, status: "collected" } // Update specific attribute
        : transaction // Keep other transactions unchanged
    );
    // const finalResult = {empId:data.empId, empName: data.empName, signature: data.signature, cashier: data.cashier,
    //   // d: 2, startDate: '2024-02-01', endDate: '2024-02-28', amount: 7000, status: 'uncollected'
    // }
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
  }

  

  useEffect(() => {
    const storedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(storedTransactions);
  }, []);

  const collected = transactions
    .filter((t) => t.status === "collected")
    .reduce((sum, t) => sum + t.amount, 0);
  const uncollected = transactions
    .filter((t) => t.status === "uncollected")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCollectPayment = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 50 },
    { field: "startDate", headerName: "Start Date", flex: 1, minWidth: 120 },
    { field: "endDate", headerName: "End Date", flex: 1, minWidth: 120 },
    {
      field: "amount",
      headerName: "Amount",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => `ETB ${params.value}`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography
          color={params.row.status === "collected" ? "green" : "orange"}
        >
          {params.row.status}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 200,
      renderCell: (params) =>
        params.row.status === "uncollected" && (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleCollectPayment(params.row)}
          >
            Mark as Collected
          </Button>
        ),
    },
  ];

  const data = [
    { name: "Collected", value: collected },
    { name: "Uncollected", value: uncollected },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Collection System
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <PaymentStatusCard
            title="Total Collected"
            amount={collected}
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PaymentStatusCard
            title="Total Uncollected"
            amount={uncollected}
            trend={-4.3}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Collection Rate
              </Typography>
              <PieChart width={300} height={200}>
                <Pie
                  data={data}
                  cx={100}
                  cy={100}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ marginLeft: 20 }}
                />
                <Typography
                  variant="body2"
                  sx={{ position: "absolute", right: 10, top: 10 }}
                >
                  Legend
                </Typography>
              </PieChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <DataGrid rows={transactions} columns={columns} autoHeight />
        </CardContent>
      </Card>

      <AgreementDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        selectedTransaction={selectedTransaction}
        BackdropProps={{ style: { backgroundColor: "rgba(0, 0, 0, 0.5)" } }}
        onSubmit = {handleSubmit}
      />
    </Box>
  );
};

export default FinancialDashboard;
