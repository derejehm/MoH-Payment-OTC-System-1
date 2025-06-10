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
  CircularProgress,
  colors,
} from "@mui/material";
import { PDFDocument, rgb } from "pdf-lib";
import numberToWords from "number-to-words";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DataGrid } from "@mui/x-data-grid";
import { jsPDF } from "jspdf";
import ReactDOM from "react-dom/client";
import ReceiptModal from "./ReceiptModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getTokenValue } from "../../services/user_service";
import api from "../../utils/api";
import AddPatientInfo from "../../components/AddPatientInfo";
import { useLang } from "../../contexts/LangContext";
import AddCBHIInfo from "../../components/AddCBHIInfo";
import RenderPDF from "./RenderPDF";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { green, red, orange, grey } from "@mui/material/colors";

const tokenvalue = getTokenValue();

// const woredas = ["Woreda 1", "Woreda 2", "Woreda 3"]; // Add relevant woredas
// const organizations = ["Org A", "Org B", "Org C"]; // Add relevant organizations

const formatter = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "ETB",
  minimumFractionDigits: 2,
});

const formatter2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

const formatAccounting2 = (num) => {
  const formatted = formatter2.format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

const formatAccounting = (num) => {
  const formatted = formatter.format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

const generateAndOpenPDF = async (error) => {
  const message =
    error?.response?.data !== undefined
      ? error?.response?.data?.message
      : "Incorrect Receipt ID";

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();

  // Add text to the PDF
  page.drawText(message, {
    x: 50,
    y: height - 100,
    size: 50,
    color: rgb(0, 0, 0),
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Create a Blob and URL
  const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Open the generated PDF
  window.open(pdfUrl, "_blank");

  // Revoke the URL after a delay to free memory
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
};

const HospitalPayment = () => {
  const { language } = useLang();

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
  const [woredas, setWoredas] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [cardNumberError, setCardNumberError] = useState("");
  const [trxRefError, settrxRefError] = useState("");
  const [paymentSummary, setPaymentSummary] = useState([]);
  const [paymentMethods, setPaymentMehods] = useState([]);
  const [digitalChannels, setDigitalChannels] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [isAdditonalInfo, setIsAdditionalInfo] = useState(false);
  const [isAdditonalCBHIInfo, setIsAdditionalCBHIInfo] = useState(false);
  const [cardsearchLoad, setCardSearchLoad] = useState(false);
  const [cbhisearchLoad, setCbhiSearchLoad] = useState(false);
  const [addPatientLoad, setAddPatienthLoad] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [cbhiId, setCbhiId] = useState("");
  const [registeredPatient, setRegisteredPatient] = useState(null);
  const [registeredCBHI, setRegisteredCBHI] = useState(null);
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [isAdditionalCBHILoading, setIsAdditionalCBHILoading] = useState(false);

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
          // console.log("sortedPayment>>",sortedPayment)
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
          setPaymentMehods(
            response?.data
              ?.filter((item) => item.type !== "ALL")
              .map((item) => item.type)
          );
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

  //Fetch (CBHI) providers
  useEffect(() => {
    const fetchCBHI = async () => {
      try {
        const response = await api.get(
          `/Providers/list-providers/${tokenvalue.name}`
        );
        if (response?.status === 200) {
          setWoredas(response?.data?.map((item) => item.provider));
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchCBHI();
  }, []);

  //Fetch Organization with agreement
  useEffect(() => {
    const fetchORG = async () => {
      try {
        const response = await api.get(
          `/Organiztion/Organization/${tokenvalue.name}`
        );
        if (response?.status === 200 || response?.status === 201) {
          setOrganizations(response?.data?.map((item) => item.organization));
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchORG();
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
      if (e.target.name === "cardNumber") {
        setPatientName("");
        setCbhiId("");
        setRegisteredCBHI(null);
        setRegisteredPatient(null);
      }
      if (e.target.name === "method") {
        setFormData((prev) => ({
          ...prev,
          woreda: "",
          trxref: "",
          organization: "",
          digitalChannel: "",
        }));
        setCbhiId("");
        setRegisteredCBHI(null);
      }

      if (e.target.name === "woreda") {
        setCbhiId("");
        setRegisteredCBHI(null);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const validateTransactionRef = (trxRef) => {
    const trxPattern = /^[A-Za-z0-9-_]{10,25}$/;

    if (!trxRef) {
      settrxRefError("Transaction reference is required");
    } else if (!trxPattern.test(trxRef)) {
      settrxRefError(
        "Invalid format. Use 10-25 characters with letters, numbers, -, _"
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
        (formData.method.toUpperCase().includes("DIGITAL") &&
          (!formData.digitalChannel ||
            !formData.trxref ||
            trxRefError.length > 0)) ||
        (formData.method.toUpperCase().includes("CBHI") && !formData.woreda) ||
        (formData.method.toUpperCase().includes("CREDIT") &&
          !formData.organization)
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
      setIsPrintLoading(true);
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
        try {
          // To Add patient Name on the Reciept
          const add = await api.put("/Payment/patient-info", {
            patientCardNumber: formData?.cardNumber,
            hospital: tokenvalue?.Hospital,
            cashier: tokenvalue?.name,
          });

          const final = {
            ...newPayment,
            patientName: add?.data[0]?.patientName,
          };
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
          setRegisteredPatient(null);
          setPatientName("");
          setCbhiId("");
          setRegisteredCBHI(null);
          toast.success(`Payment Regitstered Under ${response?.data?.refNo}`);
          setRefresh((prev) => !prev);
          generatePDF(final, response?.data?.refNo);
          setIsPrintLoading(false);
        } catch (error) {
          console.error(error);
          setIsPrintLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
      setIsPrintLoading(false);
    }
  };

  const generatePDF = (data, refNo) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait", // Change orientation to portrait
        unit: "mm",
        format: "a4", // Use A4 size for portrait (better suited for standard receipts)
      });
  
      // Set initial position
      let yPos = 20;
      const marginLeft = 20;
      const marginRight = 190;
  
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
      doc.text(`${tokenvalue?.Hospital || "N/A"}`, 105, yPos, { align: "center" });
      yPos += 8;
  
      // Receipt Number
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Receipt NO: ${refNo || "N/A"}`, marginLeft, yPos);
      yPos += 6;
  
      // Address and Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Address: Debre Brihan`, marginLeft, yPos);
      yPos += 6;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, marginLeft, yPos);
      yPos += 6;
      doc.text(`Cashier: ${tokenvalue?.name || "N/A"}`, marginLeft, yPos);
      yPos += 10;
  
      // Separator Line
      doc.setLineWidth(0.5);
      doc.line(marginLeft, yPos, marginRight, yPos);
      yPos += 10;
  
      // Patient Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Patient Name:`, marginLeft, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${data?.patientName || "N/A"}`, marginLeft + 50, yPos);
      yPos += 8;
  
      doc.setFont("helvetica", "bold");
      doc.text(`Card Number:`, marginLeft, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.cardNumber || "N/A"}`, marginLeft + 50, yPos);
      yPos += 8;
  
      doc.setFont("helvetica", "bold");
      doc.text(`Payment Method:`, marginLeft, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${data.method || "N/A"}`, marginLeft + 50, yPos);
      yPos += 8;
  
      // Additional Details based on Payment Method
      if (data.method.toUpperCase().includes("DIGITAL")) {
        doc.setFont("helvetica", "bold");
        doc.text("Channel:", marginLeft, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.digitalChannel || "N/A"}`, marginLeft + 50, yPos);
        yPos += 8;
  
        doc.setFont("helvetica", "bold");
        doc.text("Transaction Ref No:", marginLeft, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.trxref || "N/A"}`, marginLeft + 50, yPos);
        yPos += 8;
      } else if (data.method.toUpperCase().includes("CBHI")) {
        doc.setFont("helvetica", "bold");
        doc.text(`Woreda:`, marginLeft, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.woreda || "N/A"}`, marginLeft + 50, yPos);
        yPos += 8;
      } else if (data.method.toUpperCase().includes("CREDIT")) {
        doc.setFont("helvetica", "bold");
        doc.text(`Organization:`, marginLeft, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${data.organization || "N/A"}`, marginLeft + 50, yPos);
        yPos += 8;
      }
  
      // Separator Line
      doc.line(marginLeft, yPos, marginRight, yPos);
      yPos += 10;
  
      // Items Table Header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Reason`, marginLeft, yPos);
      doc.text(`Price`, marginRight - 30, yPos);
      yPos += 8;
  
      // Items Data
      doc.setFont("helvetica", "normal");
      data?.amount?.forEach((item) => {
        doc.text(`${item.purpose}`, marginLeft, yPos);
        doc.text(`${formatAccounting2(parseFloat(item.Amount).toFixed(2))}`, marginRight - 30, yPos);
        yPos += 8;
      });
  
      // Separator Line
      doc.line(marginLeft, yPos, marginRight, yPos);
      yPos += 10;
  
      // Total Amount
      const totalAmount = data?.amount
        ?.map((item) => item.Amount)
        .reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
  
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total In Figure`, marginLeft, yPos);
      doc.text(`${formatAccounting2(totalAmount.toFixed(2))}`, marginRight - 30, yPos);
      yPos += 10;
  
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Total In Words : `, marginLeft, yPos);
      doc.text(`${numberToWords.toWords(totalAmount.toFixed(2))} birr`, marginLeft + 31, yPos);
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
      width: 120,
      renderCell: (params) => (
        <Typography
          color={
            params.row.type === "CASH"
              ? "green"
              : params.row.type.toUpperCase().includes("CREDIT")
              ? "red"
              : "black"
          }
        >
          {params.row.type}
        </Typography>
      ),
    },
    { field: "purpose", headerName: "Reason", width: 190 },
    {
      field: "isCollected",
      headerName: "Coll",
      width: 10,
      renderCell: (params) => {
        const { isCollected, type } = params.row;
        const isCash = type?.toLowerCase().includes("cash");

        if (isCash && isCollected === 1) {
          return <CheckCircleIcon sx={{ color: green[500] }} />;
        } else if (isCash && isCollected !== 1) {
          return <CancelIcon sx={{ color: orange[500] }} />; // or use WarningAmberIcon
        } else {
          return <RemoveCircleOutlineIcon sx={{ color: grey[500] }} />; // Not applicable
        }
      },
    },
  ];

  const openNewTab = (id) => {
    window.open(
      `https://cs.bankofabyssinia.com/slip/?trx=${id}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleOpenPage = async () => {
    try {
      const receptId = formData?.trxref;

      let config = {};
      let url;
      if (
        formData.digitalChannel.toUpperCase().includes("CBE MOBILE BANKING") ||
        formData.digitalChannel.toUpperCase().includes("TELEBIRR")
      ) {
        url = `/Lookup/payment-verify/${receptId}?channel=${formData?.digitalChannel.toUpperCase()}`;
        if (
          formData.digitalChannel.toUpperCase().includes("CBE MOBILE BANKING")
        ) {
          config = { responseType: "blob" };
        } else {
          config = {};
        }
      } else if (
        formData.digitalChannel.toUpperCase().includes("BANK OF ABYSSINIA")
      ) {
        // url = `/Lookup/redirecttoboa?transactionId=${receptId}`;
        openNewTab(receptId);
        // <a href={`https://cs.bankofabyssinia.com/slip/?trx=${receptId}`} target="_blank">View Slip</a>
      }

      if (
        !formData.digitalChannel.toUpperCase().includes("BANK OF ABYSSINIA")
      ) {
        const response = await api.get(url, config);

        if (formData.digitalChannel.toUpperCase().includes("TELEBIRR")) {
          const newTab = window.open();
          if (newTab) {
            const newTabDocument = newTab.document;

            // Create a root div
            const rootDiv = newTabDocument.createElement("div");
            rootDiv.id = "root";
            newTabDocument.body.appendChild(rootDiv);

            // Render the component in the new tab
            const root = ReactDOM.createRoot(rootDiv);
            root.render(<RenderPDF html={response?.data} />);
          }
        } else if (
          formData.digitalChannel.toUpperCase().includes("CBE MOBILE BANKING")
        ) {
          const pdfBlob = new Blob([response?.data], {
            type: "application/pdf",
          });

          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, "_blank");
        }
      }
    } catch (error) {
      console.error(error);
      if (
        formData.digitalChannel.toUpperCase().includes("CBE MOBILE BANKING")
      ) {
        await generateAndOpenPDF(error);
      }
    }
  };

  const handleAdditionalUser = async () => {
    try {
      setAddPatienthLoad(true);
      if (formData.cardNumber.length <= 0) {
        toast.error("please fill the card number!!");
        return;
      }

      const response = await api.put("/Payment/patient-info", {
        patientCardNumber: formData?.cardNumber,
        hospital: tokenvalue?.Hospital,
        cashier: tokenvalue?.name,
      });
      if (response.status === 200) {
        if (response.data.length <= 0 || response.data === "user not found") {
          setIsAdditionalInfo(true);
        } else {
          setRegisteredPatient(response?.data[0]);
          setPatientName(response?.data?.map((item) => item.patientName));
          setIsAdditionalInfo(true);
          return response?.data[0];
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data);
      return {};
    } finally {
      setAddPatienthLoad(false);
    }
  };

  const handleResetPatientInfo = () => {
    setRegisteredPatient(null);
  };
  const handleResetCBHIInfo = () => {
    setRegisteredCBHI(null);
  };

  const handleAdditionalCBHI = async () => {
    try {
      setCbhiSearchLoad(true);
      if (formData.cardNumber.length <= 0) {
        toast.error("Please fill out The Card Number First");
        return;
      }

      const response = await api.put("/Payment/get-service-provider", {
        cardnumber: formData?.cardNumber,
        user: tokenvalue?.name,
      });
      if (response.status === 200) {
        setCbhiId(response?.data?.map((item) => item.idNo));
        const woreda = response?.data?.map((item) => item.provider)[0];
        if (response?.data?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            woreda: woredas.includes(woreda) ? woreda : "",
          }));
        }

        setRegisteredCBHI(response?.data[0]);
        setIsAdditionalCBHIInfo(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCbhiSearchLoad(false);
    }
  };

  const handleAddtionalPAtientInfo = async (Data) => {
    try {
      setCardSearchLoad(true);
      if (formData.cardNumber.length <= 0 || cardNumberError) {
        toast.error("Please fill out The Card Number First");
        return;
      } else {
        const response = await api.post("/Payment/add-patient-info", {
          patientCardNumber: formData?.cardNumber,
          patientName: Data.fullName,
          patientGender: Data.gender,
          patientAddress: Data.address,
          patientAge: Number(Data.age),
          createdBy: tokenvalue?.name,
          patientPhoneNumber: Data.phone,
        });
        if (response.status === 201) {
          toast.success(
            `${response?.data?.patientName} Is Registered Success Fully!`
          );
          setPatientName(response?.data?.patientName);
          setIsAdditionalInfo(false);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Internal Server Error!!");
    } finally {
      setCardSearchLoad(false);
    }
  };

  const handleAddtionalCBHIInfo = async (Data) => {
    try {
      if (formData.cardNumber.length <= 0) {
        toast.error("Please fill out The Card Number First");
        return;
      } else if (formData.woreda.length <= 0) {
        toast.error("Please fill out Woreda First");
        return;
      } else {
        setIsAdditionalCBHIInfo(true);
        try {
          setIsAdditionalCBHILoading(true);
          const response = await api.post("/Payment/add-service-provider", {
            provider: formData?.woreda,
            service: "CBHI",
            kebele: Data?.kebele,
            goth: Data?.goth,
            idNo: Data?.idNumber,
            referalNo: Data?.referalNum,
            letterNo: Data?.letterNum,
            examination: Data?.examination,
            cashier: tokenvalue?.name,
            cardNumber: formData?.cardNumber,
          });

          if (response.status === 201) {
            setCbhiId(response?.data?.idNo);
            toast.success("Add Successfully!");
            setIsAdditionalCBHIInfo(false);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsAdditionalCBHILoading(false);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Internal Server Error!!");
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        {language === "AMH" ? "የክፍያ መቆጣጠሪያ" : "Hospital Payment Management"}
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2, display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            label={language === "AMH" ? "የካርድ ቁጥርቁጥር" : "Card Number"}
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            fullWidth
            // error={!!cardNumberError}
            helperText={patientName}
            margin="normal"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px", // Rounded edges for a modern look

                "&:hover fieldset": {
                  borderColor: "info.main", // Changes border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main", // Focus effect
                  boxShadow: "0px 0px 8px rgba(0, 0, 255, 0.2)", // Nice glow
                },
              },
            }}
            FormHelperTextProps={{
              style: { color: "green", fontSize: "14px" },
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
                    {cardsearchLoad ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Optional"
                    )}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="subtitle1" gutterBottom>
            {language === "AMH" ? "ምክንያት" : "Select Reason:"}
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
          {formData?.method.toUpperCase().includes("DIGITAL") && (
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
          {formData?.method.trim().toUpperCase().includes("CBHI") && (
            <TextField
              select
              label="Woreda"
              name="woreda"
              value={formData.woreda}
              onChange={handleChange}
              fullWidth
              required
              helperText={cbhiId}
              margin="normal"
              FormHelperTextProps={{
                style: { color: "green", fontSize: "14px" },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px", // Rounded edges for a modern look

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
                      onClick={handleAdditionalCBHI}
                      sx={{
                        borderRadius: "20px", // More rounded button
                        fontWeight: "bold",
                        textTransform: "none", // Removes uppercase
                        padding: "6px 16px",
                      }}
                    >
                      {cbhisearchLoad ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Optional"
                      )}
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
          {formData?.method.toUpperCase().includes("CREDIT") && (
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
        onloading={isPrintLoading}
      />
      <AddPatientInfo
        isOpen={isAdditonalInfo}
        onClose={() => setIsAdditionalInfo(false)}
        onSubmit={handleAddtionalPAtientInfo}
        userData={registeredPatient}
        resetUserData={handleResetPatientInfo}
        adding={addPatientLoad}
      />
      <AddCBHIInfo
        isOpen={isAdditonalCBHIInfo}
        onClose={() => setIsAdditionalCBHIInfo(false)}
        onSubmit={handleAddtionalCBHIInfo}
        userData={registeredCBHI}
        resetUserData={handleResetCBHIInfo}
        adding={isAdditionalCBHILoading}
      />
      <ToastContainer />
    </Container>
  );
};
export default HospitalPayment;
