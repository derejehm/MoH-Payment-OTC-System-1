import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
<<<<<<< HEAD
import { GetAllPaymentByDate, GetAllPaymentType } from "../../services/report_service";
import { getTokenValue } from "../../services/user_service";
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';




var paymentMethods = [
  //"All",
  // "CASH",
  // "Digital",
  // "CBHI",
  // "Free Service",
  // "Credit",
=======
import { GetAllPaymentByDate } from "../../services/report_service";
import { getTokenValue } from "../../services/user_service";


const paymentMethods = [
  "All",
  "CASH",
  "Digital",
  "CBHI",
  "Free Service",
  "Credit",
>>>>>>> c1ec85df2d2f3aef5999b261ba4737b236f539ee
];

const ReportPage = () => {
  const [payments, setPayments] = useState([]);

  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredPayments, setFilteredPayments] = useState(payments);
  
  
var tokenValue=getTokenValue();
<<<<<<< HEAD

  useEffect( () =>  {
    

    
     // paymentMethods.push(payType);
      

      async function fetchData() {
        // You can await here
        paymentMethods= await GetAllPaymentType();
        // ...
      }
      fetchData();

      

  }, []);

  const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .no-results-primary': {
      fill: '#3D4751',
      ...theme.applyStyles('light', {
        fill: '#AEB8C2',
      }),
    },
    '& .no-results-secondary': {
      fill: '#1D2126',
      ...theme.applyStyles('light', {
        fill: '#E8EAED',
      }),
    },
  }));
  function CustomNoResultsOverlay() {
    return (
      <StyledGridOverlay>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          width={96}
          viewBox="0 0 523 299"
          aria-hidden
          focusable="false"
        >
          <path
            className="no-results-primary"
            d="M262 20c-63.513 0-115 51.487-115 115s51.487 115 115 115 115-51.487 115-115S325.513 20 262 20ZM127 135C127 60.442 187.442 0 262 0c74.558 0 135 60.442 135 135 0 74.558-60.442 135-135 135-74.558 0-135-60.442-135-135Z"
          />
          <path
            className="no-results-primary"
            d="M348.929 224.929c3.905-3.905 10.237-3.905 14.142 0l56.569 56.568c3.905 3.906 3.905 10.237 0 14.143-3.906 3.905-10.237 3.905-14.143 0l-56.568-56.569c-3.905-3.905-3.905-10.237 0-14.142ZM212.929 85.929c3.905-3.905 10.237-3.905 14.142 0l84.853 84.853c3.905 3.905 3.905 10.237 0 14.142-3.905 3.905-10.237 3.905-14.142 0l-84.853-84.853c-3.905-3.905-3.905-10.237 0-14.142Z"
          />
          <path
            className="no-results-primary"
            d="M212.929 185.071c-3.905-3.905-3.905-10.237 0-14.142l84.853-84.853c3.905-3.905 10.237-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142l-84.853 84.853c-3.905 3.905-10.237 3.905-14.142 0Z"
          />
          <path
            className="no-results-secondary"
            d="M0 43c0-5.523 4.477-10 10-10h100c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 53 0 48.523 0 43ZM0 89c0-5.523 4.477-10 10-10h80c5.523 0 10 4.477 10 10s-4.477 10-10 10H10C4.477 99 0 94.523 0 89ZM0 135c0-5.523 4.477-10 10-10h74c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 181c0-5.523 4.477-10 10-10h80c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM0 227c0-5.523 4.477-10 10-10h100c5.523 0 10 4.477 10 10s-4.477 10-10 10H10c-5.523 0-10-4.477-10-10ZM523 227c0 5.523-4.477 10-10 10H413c-5.523 0-10-4.477-10-10s4.477-10 10-10h100c5.523 0 10 4.477 10 10ZM523 181c0 5.523-4.477 10-10 10h-80c-5.523 0-10-4.477-10-10s4.477-10 10-10h80c5.523 0 10 4.477 10 10ZM523 135c0 5.523-4.477 10-10 10h-74c-5.523 0-10-4.477-10-10s4.477-10 10-10h74c5.523 0 10 4.477 10 10ZM523 89c0 5.523-4.477 10-10 10h-80c-5.523 0-10-4.477-10-10s4.477-10 10-10h80c5.523 0 10 4.477 10 10ZM523 43c0 5.523-4.477 10-10 10H413c-5.523 0-10-4.477-10-10s4.477-10 10-10h100c5.523 0 10 4.477 10 10Z"
          />
        </svg>
        <Box sx={{ mt: 2 }}>No results found.</Box>
      </StyledGridOverlay>
    );
  }
=======

  // useEffect(() => {
  //   localStorage.setItem("hospitalPayments", JSON.stringify(payments));
  // }, [payments]);

>>>>>>> c1ec85df2d2f3aef5999b261ba4737b236f539ee

  useEffect(() => {
    setFilteredPayments(
      payments.filter(
        (payment) =>
<<<<<<< HEAD
          (selectedMethod === "ALL" || payment.type === selectedMethod) 
=======
          (selectedMethod === "All" || payment.type === selectedMethod) 
>>>>>>> c1ec85df2d2f3aef5999b261ba4737b236f539ee
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
<<<<<<< HEAD
          (method === "ALL" || payment.type === method) 
=======
          (method === "All" || payment.type === method) 
>>>>>>> c1ec85df2d2f3aef5999b261ba4737b236f539ee
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
  
    { field: "refNo", headerName: "Ref No.", width: 200 },
    { field: "hospitalName", headerName: "Hospital Name", width: 150 },
    { field: "cardNumber", headerName: "Card Number", width: 150 },
    { field: "purpose", headerName: "Service", width: 150 },    
    { field: "amount", headerName: "Amount", width: 120 },
    { field: "type", headerName: "Payment Method", width: 150 },
    { field: "description", headerName: "Description", width: 200 },
    { field: "createdOn", headerName: "Date", width: 150 },
    { field: "createdby", headerName: "Created by", width: 150 },

    
  ];
  const handleReportRequest = async () => {
    try {
<<<<<<< HEAD
      if(startDate === "" || endDate === ""){
        alert("Please select start and end date");
        return;
      }
=======
>>>>>>> c1ec85df2d2f3aef5999b261ba4737b236f539ee
      const datas = await GetAllPaymentByDate({
        startDate,
        endDate,
        user: tokenValue.name,
      });
<<<<<<< HEAD

      if(datas.length >0){
        setPayments(datas);

        setFilteredPayments(
          payments.filter(
            (payment) =>
              (selectedMethod === "ALL" || payment.type === selectedMethod) 
          )
        );

      }
     
=======
      setPayments(datas);

      setFilteredPayments(
        payments.filter(
          (payment) =>
            (selectedMethod === "All" || payment.type === selectedMethod) 
        )
      );
>>>>>>> c1ec85df2d2f3aef5999b261ba4737b236f539ee
  
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };
  return (
   <>
      <Typography variant="h5" gutterBottom sx={{ margin: 2 }}>
        Payment Reports
      </Typography>
      <Paper sx={{ padding: 2, margin: 2 }}>
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
              key={method.type}
              label={`${method.type} (${calculateTotal(method.type)})`}
              value={method.type}
            />
          ))}
        </Tabs>
      </Paper>
      <Paper sx={{ height: 400, margin: 2 }}>
        <DataGrid
          rows={filteredPayments.length ? filteredPayments : []}
          columns={columns}
          slots={{
            noResultsOverlay: CustomNoResultsOverlay,
          }}
        />
      </Paper>
      <Button     
      sx={{ marginLeft: 2 }}
        variant="contained"
        color="primary"
    
        onClick={exportToExcel}
      >
        Export to Excel
      </Button>
      </>
  );
};

export default ReportPage;