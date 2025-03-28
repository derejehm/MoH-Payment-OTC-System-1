import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { CancelPresentationTwoTone } from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

const EmployeeUploadManager = () => {
  const [fileData, setFileData] = useState([]);
  const [data, setData] = useState([]);

  const handleFileUpload = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        setFileData(parsedData);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadToDatabase = async () => {
    try {
      await axios.post("/api/employees/upload", { data: fileData });
      alert("Data uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  useEffect(() => {
    const fetchEmp = async () => {
      try {
        setData([]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEmp();
  }, []);

  const handleDeleteAll = () => {
    setFileData([]);
    setData([]);
  };


  const columns = [
    { field: "id", headerName: "Employee ID", flex: 1 },
    { field: "name", headerName: "Employee Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1},
    { field: "hospital", headerName: "Assigned Hospital", flex: 1 },
  ];

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Employee ID - Hospital Mapping
      </Typography>
      <Paper sx={{ padding: 2, marginBottom: 2 }}>
        <input
          accept=".xlsx, .xls"
          type="file"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="upload-excel"
        />
        <label htmlFor="upload-excel">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
          >
            Upload Excel
          </Button>
        </label>
        <IconButton
          onClick={handleDeleteAll}
          color="error"
          sx={{ marginLeft: 2}}
        >
        <CancelPresentationTwoTone />

        </IconButton>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadToDatabase}
          sx={{ marginLeft: 2 }}
          disabled={fileData.length === 0}
        >
          Upload to Database
        </Button>
        <Typography
          variant="h6"
          sx={{ m: "15px 0 5px 20px" }}
        >
          {fileData.length > 0 ? "Viewing from File" : "Viewing Registered"}
        </Typography>
      </Paper>
      <Paper sx={{ height: 400 }}>
        <DataGrid
          rows={fileData.length <= 0 ? data : fileData}
          columns={columns}
          // getRowId={(row) => row.id}
        />
      </Paper>
    </Container>
  );
};

export default EmployeeUploadManager;
