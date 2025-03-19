import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  FormControlLabel,
  Box,
  Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { jsPDF } from "jspdf";
import ReceiptModal from "./ReceiptModal";
import SmartCards from "./SmartCards";

const paymentMethods = ["Cash", "Digital", "CBHI", "Free Service", "Credit"];
const digitalChannels = [
  "CBE Mobile Banking",
  "Tele Birr",
  "Amole",
  "HelloCash",
];
const woredas = ["Woreda 1", "Woreda 2", "Woreda 3"]; // Add relevant woredas
const organizations = ["Org A", "Org B", "Org C"]; // Add relevant organizations
const reasons = [
  "Card",
  "Emergency",
  "Routine Checkup",
  "Surgery",
  "Medication",
  "Other",
];

const mockData = [
  {
    id: 1,
    cardNumber: "123456",
    amount: 500,
    method: "Cash",
    reason: "Routine Checkup",
    description: "General consultation fee",
  },
  {
    id: 2,
    cardNumber: "789012",
    amount: 1200,
    method: "Digital",
    digitalChannel: "CBE Mobile Banking",
    reason: "Surgery",
    description: "Pre-surgery payment",
  },
];

const HospitalPayment = () => {
  const [payments, setPayments] = useState(() => {
    const storedPayments = localStorage.getItem("hospitalPayments");
    return storedPayments ? JSON.parse(storedPayments) : mockData;
  });

  const [formData, setFormData] = useState({
    cardNumber: "",
    amount: "",
    method: "Cash",
    description: "",
    reason: [],
    digitalChannel: "",
    woreda: "",
    organization: "",
  });

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(() => {
    const savedNumber = localStorage.getItem("currentReceiptNumber");
    return savedNumber ? parseInt(savedNumber, 10) : 1;
  });

  //Inserting evry changet that the user makes on print into the loacl storage using the useEffect hooks
  // onchange of payments the useEffect runs
  useEffect(() => {
    localStorage.setItem("hospitalPayments", JSON.stringify(payments));
    updatePaymentSummary(payments);
  }, [payments]);


  console.log("form Data>>",formData)
  
  const updatePaymentSummary = (payments) => {
    const summary = payments.reduce((acc, payment) => {
      const { method, amount } = payment;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += parseFloat(amount);
      return acc;
    }, {});

    const mapped = Object.entries(summary).map(([key, value]) => ({
      method: key,
      amount: value,
    }));

    setPaymentSummary(mapped);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberOnlyCheck = (param) => {
    //const regex = /^[$0-9]
  };

  const handleCheckboxChange = (reason) => {
    setFormData((prev) => ({
      ...prev,
      reason: prev.reason.includes(reason)
        ? prev.reason.filter((r) => r !== reason)
        : [...prev.reason, reason],
    }));
  };

  const handleSubmit = () => {
    if (
      !formData.cardNumber ||
      !formData.amount ||
      !formData.method ||
      (formData.method === "Digital" && !formData.digitalChannel) ||
      (formData.method === "CBHI" && !formData.woreda) ||
      (formData.method === "Credit" && !formData.organization)
    )
      return window.alert("Please fill all the necesary field!!");
    setReceiptData(formData);
    setReceiptOpen(true);
  };

  const handleRegisterAndPrint = () => {
    const newPayment = {
      id: payments.length + 1,
      ...receiptData,
      reason: receiptData.reason.join(", "),
    };
    setPayments([newPayment, ...payments]);
    setReceiptOpen(false);
    setFormData({
      cardNumber: "",
      amount: "",
      method: "Cash",
      description: "",
      reason: [],
      digitalChannel: "",
      woreda: "",
      organization: "",
    });
    generatePDF(newPayment);
  };

  {
    /*const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text('Hospital Payment Receipt', 20, 20);
    doc.text(`Card Number: ${data.cardNumber}`, 20, 30);
    doc.text(`Amount: ${data.amount}`, 20, 40);
    doc.text(`Method: ${data.method}`, 20, 50);
    if (data.method === 'Digital') {
      doc.text(`Channel: ${data.digitalChannel}`, 20, 60);
    }
    if (data.method === 'CBHI') {
      doc.text(`Woreda: ${data.woreda}`, 20, 60);
    }
    if (data.method === 'Credit') {
      doc.text(`Organization: ${data.organization}`, 20, 60);
    }
    doc.text(`Reason: ${data.reason}`, 20, 70);
    doc.text(`Description: ${data.description}`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);
    doc.save('receipt.pdf');
  };*/
  }

  const generatePDF = (data) => {
    const doc = new jsPDF();

    // Start the receipt content
    doc.text("Hospital Payment Receipt", 20, 20);
    doc.text("-----------------------------------", 20, 30);
    doc.text(`Card Number : ${data.cardNumber}`, 20, 40);
    doc.text(`Amount      : ${data.amount}`, 20, 50);
    doc.text(`Method      : ${data.method}`, 20, 60);
    if (data.method === "Digital") {
      doc.text(`Channel      : ${data.digitalChannel}`, 20, 60);
    }
    if (data.method === "CBHI") {
      doc.text(`Woreda      : ${data.woreda}`, 20, 60);
    }
    if (data.method === "Credit") {
      doc.text(`Organization      : ${data.organization}`, 20, 60);
    }
    // Ensure 'reason' is joined as a string or fallback to 'N/A'
    const reasonsText = Array.isArray(data.reason)
      ? data.reason.join(", ")
      : "N/A";
    doc.text(`Reason      : ${reasonsText}`, 20, 70);

    doc.text(`Description : ${data.description}`, 20, 80);
    doc.text(`Date        : ${new Date().toLocaleDateString()}`, 20, 90);

    doc.text("-----------------------------------", 20, 100);
    doc.text("Thank you for your visit!", 20, 110);
    doc.text("-----------------------------------", 20, 120);

    // Save the generated PDF
    doc.save("receipt.pdf");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "cardNumber", headerName: "Card Number", width: 150 },
    { field: "amount", headerName: "Amount", width: 120 },
    { field: "method", headerName: "Payment Method", width: 150 },
    { field: "reason", headerName: "Reason", width: 200 },
    { field: "description", headerName: "Description", width: 200 },
  ];

  const formatter = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
  });

  const formatAccounting = (num) => {
    const formatted = formatter.format(Math.abs(num));
    return num < 0 ? `(${formatted})` : formatted;
  };
  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Hospital Payment Management
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2, display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            label="Card Number"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Typography variant="subtitle1" gutterBottom>
            Select Reason:
          </Typography>
          {reasons.map((reason) => (
            <FormControlLabel
              key={reason}
              control={
                <Checkbox
                  checked={formData.reason.includes(reason)}
                  onChange={() => handleCheckboxChange(reason)}
                />
              }
              label={reason}
            />
          ))}
          
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Payment Method"
            name="method"
            value={formData.method}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>
          {formData.method === "Digital" && (
            <TextField
              select
              label="Digital Channel"
              name="digitalChannel"
              value={formData.digitalChannel}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              {digitalChannels.map((channel) => (
                <MenuItem key={channel} value={channel}>
                  {channel}
                </MenuItem>
              ))}
            </TextField>
          )}
          {formData.method === "CBHI" && (
            <TextField
              select
              label="Woreda"
              name="woreda"
              value={formData.woreda}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              {woredas.map((woreda) => (
                <MenuItem key={woreda} value={woreda}>
                  {woreda}
                </MenuItem>
              ))}
            </TextField>
          )}
          {formData.method === "Credit" && (
            <TextField
              select
              label="Organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
            >
              {organizations.map((org) => (
                <MenuItem key={org} value={org}>
                  {org}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            onClick={handleSubmit}
          >
            Check Receipt
          </Button>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h3">Payment Summary</Typography>
            <hr />
            {/* <SmartCards data={paymentSummary} /> */}
            {paymentSummary.map((summary) => (
              <Box
                key={summary.method}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 1,
                }}
              >
                <Typography sx={{ fontWeight: "bolder" }}>
                  {summary.method}
                </Typography>
                <Typography>{formatAccounting(summary.amount)}</Typography>
              </Box>
            ))}
            <hr />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 1,
              }}
            >
              <Typography sx={{ fontWeight: "bolder" }}>Total</Typography>

              <Typography>
                {formatAccounting(
                  paymentSummary
                    .map((e) => e.amount)
                    .reduce((acc, num) => acc + num, 0)
                )}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Paper>
      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={payments.length ? payments : []}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Paper>
      <ReceiptModal
        open={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
        }}
        data={receiptData}
        onPrint={handleRegisterAndPrint}
      />
    </Container>
  );
};
export default HospitalPayment;
