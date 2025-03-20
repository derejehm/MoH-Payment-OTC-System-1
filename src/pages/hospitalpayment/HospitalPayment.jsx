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
  InputAdornment,
  IconButton,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DataGrid } from "@mui/x-data-grid";
import { jsPDF } from "jspdf";
import ReceiptModal from "./ReceiptModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getTokenValue } from "../../services/user_service";
import api from "../../utils/api";
import AddPatientInfo from "../../components/AddPatientInfo";
import { use } from "react";

const tokenvalue = getTokenValue();

const woredas = ["Woreda 1", "Woreda 2", "Woreda 3"]; // Add relevant woredas
const organizations = ["Org A", "Org B", "Org C"]; // Add relevant organizations

const formatter = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

const formatAccounting = (num) => {
  const formatted = formatter.format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

const HospitalPayment = () => {
  const [payments, setPayments] = useState([]);

  const [formData, setFormData] = useState({
    cardNumber: "",
    amount: [],
    method: "",
    description: "",
    reason: [],
    digitalChannel: "",
    woreda: "",
    trxref: "",
    organization: "",
  });

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [cardNumberError, setCardNumberError] = useState("");
  const [trxRefError, settrxRefError] = useState("");
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [paymentMethods, setPaymentMehods] = useState([]);
  const [digitalChannels, setDigitalChannels] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [isAdditonalInfo,setIsAdditionalInfo] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(() => {
    const savedNumber = localStorage.getItem("currentReceiptNumber");
    return savedNumber ? parseInt(savedNumber, 10) : 1;
  });

  //Inserting evry changet that the user makes on print into the loacl storage using the useEffect hooks
  // onchange of payments the useEffect runs
  useEffect(() => {
    const fetchPaymetInfo = async () => {
      try {
        const response = await api.put(
          "/Payment/payment-by-cashier",
          tokenvalue.name,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          const sortedPayment = await response?.data.sort(
            (a, b) => b.id - a.id
          );
          setPayments(sortedPayment);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPaymetInfo();
    updatePaymentSummary(payments);
  }, [refresh, payments]);

  //fetch Reasons
  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const response = await api.get("/Lookup/payment-purpose");
        if (response?.status === 200) {
          setReasons(response?.data?.map((item) => item.purpose));
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchReasons();
  }, []);

  //fetch paymentmethods
  useEffect(() => {
    const fetchMeth = async () => {
      try {
        const response = await api.get("/Lookup/payment-type");
        if (response?.status === 200) {
          setPaymentMehods(response?.data?.map((item) => item.type));
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchMeth();
  }, []);

  //fetch Digital Channels
  useEffect(() => {
    const fetchChane = async () => {
      try {
        const response = await api.get("/Lookup/payment-channel");
        if (response?.status === 200) {
          setDigitalChannels(response?.data?.map((item) => item.channel));
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchChane();
  }, []);

  const updatePaymentSummary = (payments) => {
    const summary = payments.reduce((acc, payment) => {
      const { type, amount } = payment;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += parseFloat(amount);
      return acc;
    }, {});

    const mapped = Object.entries(summary).map(([key, value]) => ({
      method: key,
      amount: value,
    }));

    setPaymentSummary(mapped);
  };

  const handleChange = (e) => {
    try {
      setFormData({ ...formData, [e.target.name]: e.target.value });

      if (e.target.name === "trxref") {
        validateTransactionRef(e.target.value);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const validateTransactionRef = (trxRef) => {
    const trxPattern = /^[A-Za-z0-9-_]{12,25}$/;

    if (!trxRef) {
      settrxRefError("Transaction reference is required");
    } else if (!trxPattern.test(trxRef)) {
      settrxRefError(
        "Invalid format. Use 12-25 characters with letters, numbers, -, _"
      );
    } else {
      settrxRefError("");
    }

    return;
  };

  const handleCheckboxChange = (reason) => {
    try {
      setFormData((prev) => {
        // Update reason array (toggle selection)
        const updatedReason = prev.reason.includes(reason)
          ? prev.reason.filter((r) => r !== reason)
          : [...prev.reason, reason];

        // Create a proper copy of the amount array
        const updatedAmount = [...prev.amount];

        // If the reason is being removed, remove the corresponding amount entry
        if (!updatedReason.includes(reason)) {
          return {
            ...prev,
            reason: updatedReason,
            amount: updatedAmount.filter((item) => item.purpose !== reason), // Remove related amount
          };
        }

        return { ...prev, reason: updatedReason, amount: updatedAmount };
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAmountChange = (e, reason) => {
    try {
      setFormData((prev) => {
        const updatedAmount = prev.amount.map((item) =>
          item.purpose === reason
            ? { ...item, Amount: Math.abs(Number(e.target.value)) }
            : item
        );

        if (!updatedAmount.some((item) => item.purpose === reason)) {
          updatedAmount.push({
            purpose: reason,
            Amount: Math.abs(Number(e.target.value)),
          });
        }

        return { ...prev, amount: updatedAmount };
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleNumberOnlyCheck = (name, value) => {
    try {
      const regex = /^[0-9]*$/;
      if (!regex.test(value) && name === "cardNumber") {
        setCardNumberError("Please Insert Number Only");
      } else {
        setCardNumberError("");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSubmit = () => {
    try {
      if (
        !formData.cardNumber ||
        formData.reason.length <= 0 ||
        formData.amount.length <= 0 ||
        !formData.method ||
        (formData.method === "Digital" &&
          !formData.digitalChannel &&
          !formData.trxref) ||
        (formData.method === "CBHI" && !formData.woreda) ||
        (formData.method === "Credit" && !formData.organization)
      ) {
        return window.alert("Please fill all the necessary fields!!");
      }

      // Validate amount based on reason
      const isAmountValid = formData.reason.every((reason) =>
        formData.amount.some(
          (item) => item.purpose === reason && item.Amount > 0
        )
      );

      if (!isAmountValid) {
        return window.alert(
          "Each reason must have a corresponding payment amount greater than 0!"
        );
      }

      setReceiptData(formData);
      setReceiptOpen(true);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleRegisterAndPrint = async () => {
    try {
      const newPayment = {
        id: payments.length + 1,
        ...receiptData,
        reason: receiptData.reason.join(", "),
      };
      const trxDate = new Date().toISOString();
      const response = await api.post(
        "/Payment/add-payment",
        {
          paymentType: formData.method,
          cardNumber: formData.cardNumber,
          hospital: tokenvalue?.Hospital,
          amount: formData.amount,
          description: formData?.description || "-",
          createdby: tokenvalue?.name,
          createdOn: trxDate,
          channel: formData.digitalChannel || "-",
          department: tokenvalue?.Departement,
          paymentVerifingID: formData.trxref || "-",
          patientLocation: formData.woreda || "-",
          patientWorkingPlace: formData.organization || "-",
          userType: tokenvalue?.UserType,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setReceiptOpen(false);
        setFormData({
          cardNumber: "",
          amount: "",
          method: "",
          description: "",
          reason: [],
          digitalChannel: "",
          woreda: "",
          trxref: "",
          organization: "",
        });
        toast.success(response?.data?.message);
        setRefresh((prev) => !prev);
        generatePDF(newPayment);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const generatePDF = (data) => {
    try {
      const doc = new jsPDF();

      // Set initial position
      let yPos = 20;

      // Add Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("*************************", 105, yPos, { align: "center" });
      yPos += 8;
      doc.text("HOSPITAL PAYMENT RECEIPT", 105, yPos, { align: "center" });
      yPos += 8;
      doc.text("*************************", 105, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(tokenvalue?.Hospital, 105, yPos, { align: "center" });
      yPos += 8;

      // Address and Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Address: Lorem Ipsum 8/24`, 20, yPos);
      yPos += 6;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 6;
      doc.text(`Manager: Lorem Ipsum`, 20, yPos);
      yPos += 10;

      // Separator Line
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;

      // Card Number
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Card Number:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.cardNumber || "N/A"}`, 70, yPos);
      yPos += 8;

      // Payment Method
      doc.setFont("helvetica", "bold");
      doc.text(`Payment Method:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.method || "N/A"}`, 70, yPos);
      yPos += 8;

      // Additional Details
      if (data.method === "Digital") {
        doc.setFont("helvetica", "bold");
        doc.text("Channel:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.digitalChannel || "N/A"}`, 70, yPos);
        yPos += 8;

        doc.setFont("helvetica", "bold");
        doc.text("Transaction Ref No:", 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.trxref || "N/A"}`, 70, yPos);
        yPos += 8;
      } else if (data.method === "Community-Based Health Insurance (CBHI)") {
        doc.setFont("helvetica", "bold");
        doc.text(`Woreda:`, 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.woreda || "N/A"}`, 70, yPos);
        yPos += 8;
      } else if (data.method === "Credit") {
        doc.setFont("helvetica", "bold");
        doc.text(`Organization:`, 20, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.organization || "N/A"}`, 70, yPos);
        yPos += 8;
      }

      // Reason
      doc.setFont("helvetica", "bold");
      doc.text(`Reason:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${data?.reason}`, 70, yPos);
      yPos += 8;

      // Description
      doc.setFont("helvetica", "bold");
      doc.text(`Description:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.description || "N/A"}`, 70, yPos);
      yPos += 10;

      // Separator Line
      doc.line(20, yPos, 190, yPos);
      yPos += 10;

      // Items Table Header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Description`, 20, yPos);
      doc.text(`Price`, 160, yPos);
      yPos += 8;

      // Items Data
      doc.setFont("helvetica", "normal");
      data?.amount?.forEach((item) => {
        doc.text(`${item.purpose}`, 20, yPos);
        doc.text(`${parseFloat(item.Amount).toFixed(2)}`, 160, yPos);
        yPos += 8;
      });

      // Separator Line
      doc.line(20, yPos, 190, yPos);
      yPos += 10;

      // Total Amount
      const totalAmount = data?.amount
        ?.map((item) => item.Amount)
        .reduce((a, b) => parseFloat(a) + parseFloat(b), 0);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL`, 20, yPos);
      doc.text(`${totalAmount ? totalAmount.toFixed(2) : "0.00"}`, 160, yPos);
      yPos += 10;

      // Thank You Message
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("*************************", 105, yPos, { align: "center" });
      yPos += 8;
      doc.text("THANK YOU", 105, yPos, { align: "center" });
      yPos += 8;
      doc.text("*************************", 105, yPos, { align: "center" });
      yPos += 10;

      // Barcode (Simulated with Number)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("123456778963578021", 105, yPos, { align: "center" });
      yPos += 10;

      // Save PDF
      doc.save("receipt.pdf");
    } catch (error) {
      console.error(error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "createdOn", headerName: "Date", width: 200 },
    { field: "refNo", headerName: "Reciept Number", width: 200 },
    { field: "cardNumber", headerName: "Card Number", width: 150 },
    { field: "amount", headerName: "Amount", width: 120 },
    {
      field: "type",
      headerName: "Payment Method",
      width: 150,
      renderCell: (params) => (
        <Typography color={params.row.type === "CASH" ? "green" : params.row.type === "Credit" ? "red" : "black"}>
          {params.row.type}
        </Typography>
      ),
    },
    { field: "purpose", headerName: "Reason", width: 200 },
  ];

  const handleOpenPage = async () => {
    try {
      const receptId = formData?.trxref;
      const response = await api.get(`/Lookup/payment-verify/${receptId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      let url;
      if (formData.digitalChannel === "TeleBirr") {
        url = response.data.find(
          (item) => item.institution === "telebirr"
        )?.qrLink;
      } else if (formData.digitalChannel === "CBE") {
        url = response.data.find(
          (item) => item.institution === "telebirr"
        )?.qrLink;
      }

      if (url) {
        window.open(url, "_blank"); // Open in a new tab
      }
    } catch (error) {
      console.error(error.message);
    }
  };

const handleAdditionalUser = ()=>{
setIsAdditionalInfo(true)
}

const handleAddtionalPAtientInfo = async(Data)=>{
  try{
    if(formData.cardNumber.length <= 0 || cardNumberError)
    {
      toast.error('Please fill out The Card Number First');
      return
    }else{
      console.log("Additional Patient information>>",Data,formData.cardNumber)
      setIsAdditionalInfo(false)
    }

  }catch(error)
  {
    console.error(error.message)
  }
}
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
            error={!!cardNumberError}
            helperText={cardNumberError}
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", // Rounded edges for a modern look
                backgroundColor: "#f9f9f9", // Subtle background color
                "&:hover fieldset": {
                  borderColor: "info.main", // Changes border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main", // Focus effect
                  boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    color="info"
                    onClick={handleAdditionalUser}
                    sx={{
                      borderRadius: "20px", // More rounded button
                      fontWeight: "bold",
                      textTransform: "none", // Removes uppercase
                      padding: "6px 16px",
                    }}
                  >
                    Optional
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Select Reason:
          </Typography>
          {reasons?.map((reason) => (
            <FormControlLabel
              key={reason}
              control={
                <Checkbox
                  checked={formData?.reason?.includes(reason)}
                  onChange={() => handleCheckboxChange(reason)}
                />
              }
              label={reason}
            />
          ))}

          {/* TextFields for Selected Checkboxes */}
          {formData?.reason?.map((reason) => (
            <TextField
              key={reason}
              name={reason}
              label={`${reason} Amount`}
              fullWidth
              margin="normal"
              value={
                formData?.amount?.find((item) => item.purpose === reason)
                  ?.Amount || ""
              }
              onChange={(e) => handleAmountChange(e, reason)}
              type="number"
              inputProps={{
                min: 1, // Prevents negative values
                step: "any", // Allows decimal values
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px", // Rounded edges for a modern look
                  backgroundColor: "#f9f9f9", // Subtle background color
                  "&:hover fieldset": {
                    borderColor: "info.main", // Changes border color on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main", // Focus effect
                    boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                  },
                },
              }}
            />
          ))}

          <TextField
            select
            label="Payment Method"
            name="method"
            value={formData.method}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", // Rounded edges for a modern look
                backgroundColor: "#f9f9f9", // Subtle background color
                "&:hover fieldset": {
                  borderColor: "info.main", // Changes border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main", // Focus effect
                  boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                },
              },
            }}

          >
            {paymentMethods?.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>
          {formData?.method === "Digital" && (
            <>
              <TextField
                select
                label="Digital Channel"
                name="digitalChannel"
                value={formData.digitalChannel}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px", // Rounded edges for a modern look
                    backgroundColor: "#f9f9f9", // Subtle background color
                    "&:hover fieldset": {
                      borderColor: "info.main", // Changes border color on hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main", // Focus effect
                      boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                    },
                  },
                }}
              >
                {digitalChannels?.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {channel}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Transaction Reference No"
                name="trxref"
                value={formData.trxref}
                error={!!trxRefError}
                helperText={trxRefError}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px", // Rounded edges for a modern look
                    backgroundColor: "#f9f9f9", // Subtle background color
                    "&:hover fieldset": {
                      borderColor: "info.main", // Changes border color on hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main", // Focus effect
                      boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleOpenPage} edge="end">
                        <OpenInNewIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              ></TextField>
            </>
          )}
          {formData?.method === "Community-Based Health Insurance (CBHI)" && (
            <TextField
              select
              label="Woreda"
              name="woreda"
              value={formData.woreda}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px", // Rounded edges for a modern look
                  backgroundColor: "#f9f9f9", // Subtle background color
                  "&:hover fieldset": {
                    borderColor: "info.main", // Changes border color on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main", // Focus effect
                    boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      color="info"
                      sx={{
                        borderRadius: "20px", // More rounded button
                        fontWeight: "bold",
                        textTransform: "none", // Removes uppercase
                        padding: "6px 16px",
                      }}
                    >
                      Optional
                    </Button>
                  </InputAdornment>
                ),
              }}
            >
              {woredas?.map((woreda) => (
                <MenuItem key={woreda} value={woreda}>
                  {woreda}
                </MenuItem>
              ))}
            </TextField>
          )}
          {formData?.method === "Credit" && (
            <TextField
              select
              label="Organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px", // Rounded edges for a modern look
                  backgroundColor: "#f9f9f9", // Subtle background color
                  "&:hover fieldset": {
                    borderColor: "info.main", // Changes border color on hover
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main", // Focus effect
                    boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                  },
                },
              }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", // Rounded edges for a modern look
                backgroundColor: "#f9f9f9", // Subtle background color
                "&:hover fieldset": {
                  borderColor: "info.main", // Changes border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main", // Focus effect
                  boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                },
              },
            }}
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
          // pageSize={5}
          // rowsPerPageOptions={[5, 10, 20]}
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
      <AddPatientInfo
        isOpen ={isAdditonalInfo}
        onClose ={()=>setIsAdditionalInfo(false)}
        onSubmit ={handleAddtionalPAtientInfo}
        />
      <ToastContainer />
    </Container>
  );
};
export default HospitalPayment;
