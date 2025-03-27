import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import api from "../../utils/api";
import { getTokenValue } from "../../services/user_service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tokenvalue = getTokenValue();
const CollectedReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("collected");
  const [showOnlyHighAmount, setShowOnlyHighAmount] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);

  const fetchReportData = async (e) => {
    try {
      e.preventDefault();
      const response = await api.put("/Collection/Get-all-Collection", {
        startDate: startDate,
        endDate: endDate,
        user: tokenvalue?.name,
        isCollected: statusFilter === "uncollected" ? 0 : 1,
      });
      if (response?.data.length <= 0) toast.info("Report not found!");
      setData(response?.data.length <= 0 ? new Array() : response?.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    }
  };

  const filterData = () => {
    try {
      if (data.length > 0) {
        const filteredData = data?.filter((item) => {
          if (
            showOnlyHighAmount &&
            item.amount < Math.max(...data?.map((item) => item?.amount))
          )
            return false;
          return true;
        });

        setFilteredData(filteredData);
      } else {
        toast.info("There is No High Amount!");
        setFilteredData([]);
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    if (showOnlyHighAmount) {
      filterData();
    }
  }, [showOnlyHighAmount]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Report");
    XLSX.writeFile(wb, `Payments_Report.xlsx`);
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Collection Report
      </Typography>
      <form onSubmit={fetchReportData}>
        <Paper
          sx={{
            padding: 2,
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setShowOnlyHighAmount(false);
            }}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setShowOnlyHighAmount(false);
            }}
            InputLabelProps={{ shrink: true }}
            required
          />
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(e, newValue) => setStatusFilter(newValue || "collected")}
          >
            <ToggleButton value="collected">Collected</ToggleButton>
            <ToggleButton value="uncollected">Uncollected</ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={showOnlyHighAmount}
                onChange={(e) => setShowOnlyHighAmount(e.target.checked)}
              />
            }
            label="Show High Amount"
          />
          <Button variant="contained" color="secondary" type="submit">
            Request Report
          </Button>
        </Paper>
      </form>
      <Paper sx={{ height: 400, marginBottom: 2 }}>
        <DataGrid
          rows={showOnlyHighAmount ? filteredData : data}
          columns={[
            { field: "id", headerName: "ID", width: 90 },
            { field: "startDate", headerName: "Start Date", width: 150 },
            { field: "endDate", headerName: "End Date", width: 120 },
            { field: "amount", headerName: "Amount", width: 150 },
            { field: "status", headerName: "Status", width: 150 },
            { field: "collector", headerName: "Collector", width: 200 },
            {
              field: "collectedDate",
              headerName: "Collected Date",
              width: 150,
            },
          ]}
        />
      </Paper>
      <Button variant="contained" color="primary" onClick={exportToExcel}>
        Export to Excel
      </Button>
      <ToastContainer />
    </Container>
  );
};

export default CollectedReport;
