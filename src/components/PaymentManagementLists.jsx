import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import api from "../utils/api";
import { getTokenValue } from "../services/user_service";

const tokenvalue = getTokenValue();
const categories = [
  "Digital Payment Channels",
  "CBHI Providers",
  "Organizations with Agreements",
  "Hospital Services",
  "Payment Methods",
];

const PaymentManagementLists = () => {
  const [data, setData] = useState({});
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ category: "", name: "" });
  const [editId, setEditId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  // Generalized fetch function
  const fetchData = async (endpoint, key, mapFunction) => {
    try {
      const response = await api.get(endpoint);
      if (response?.status === 200) {
        const result = {
          [key]: response?.data,
        };
        setData((prevData) => ({ ...prevData, ...result }));
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // Fetch Payment Methods
  useEffect(() => {
    fetchData("/Lookup/payment-type", "Payment Methods", (item) => item.type);
  }, [refresh]);

  // Fetch Digital Channels
  useEffect(() => {
    fetchData(
      "/Lookup/payment-channel",
      "Digital Payment Channels",
      (item) => item.channel
    );
  }, [refresh]);

  // Fetch Paymet purpose
  useEffect(() => {
    fetchData(
      "/Lookup/payment-purpose",
      "Hospital Services",
      (item) => item.purpose
    );
  }, [refresh]);

  const saveData = (newData) => {
    // setData(newData);
    localStorage.setItem("paymentData", JSON.stringify(newData));
  };

  const handleOpen = (category, item = "", id = null) => {
    console.log({category, item, id})
    setFormData({ category, name: item });
    setEditId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData({ category: "", name: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const { category, name } = formData;
      if (!name.trim()) return;
      const updatedCategory = data[category] ? [...data[category]] : [];
      if (category === "Digital Payment Channels" && editId === null) {
        const response = await api.post("/Lookup/add-paymentChannel", {
          channel: name,
          createdBy: tokenvalue.name,
        });
        if (response.status === 201) {
          toast.success("Digital Payment Channels add Successfully!");
          updatedCategory.push(response?.data);
          saveData({ ...data, [category]: updatedCategory });
          setRefresh((prev) => !prev);
          handleClose();
          return;
        }
      } else if (category === "Payment Methods" && editId === null) {
        const response = await api.post("/Lookup/add-paymentType", {
          type: name,
          createdBy: tokenvalue.name,
        });

        if (response.status === 201) {
          toast.success("Payment Methods add Successfully!");
          updatedCategory.push(response?.data);
          saveData({ ...data, [category]: updatedCategory });
          setRefresh((prev) => !prev);
          handleClose();
          return;
        }
      } else if (category === "Hospital Services" && editId === null) {
        const response = await api.post("/Lookup/add-paymentPurpose", {
          purpose: name,
          createdBy: tokenvalue.name,
        });

        if (response.status === 201) {
          toast.success("Hospital Services add Successfully!");
          updatedCategory.push(response?.data);
          saveData({ ...data, [category]: updatedCategory });
          setRefresh((prev) => !prev);
          handleClose();
          return;
        }
      }

      if (editId !== null) {
        updatedCategory[editId] = name;
      } else {
        updatedCategory.push(name);
      }
      saveData({ ...data, [category]: updatedCategory });
      handleClose();
    } catch (error) {
      console.error(error?.message);
      toast.error(error?.response?.data || "Internal Server Error!");
    }
  };

  const handleDelete = (category, id) => {
    const updatedCategory = data[category].filter((_, index) => index !== id);
    saveData({ ...data, [category]: updatedCategory });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Payment Management
      </Typography>
      {categories.map((category) => (
        <div key={category} style={{ marginBottom: "20px" }}>
          <Typography variant="h6" gutterBottom>
            {category}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen(category)}
            style={{ marginBottom: "10px" }}
          >
            Add {category}
          </Button>
          <DataGrid
            rows={(data[category] || []).map((item, index) => ({
              id: item.id,
              name:
                category === "Digital Payment Channels"
                  ? item.channel
                  : category === "Payment Methods"
                  ? item.type
                  : category === "Hospital Services"
                  ? item.purpose
                  : "",
            }))}
            columns={[
              {
                field: "name",
                headerName: "Name",
                flex: 1,
              },
              {
                field: "actions",
                headerName: "Actions",
                renderCell: (params) => (
                  <>
                    <IconButton
                      onClick={() => {
                        handleOpen(category, params.row.name, params.row.id);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(category, params.row.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </>
                ),
                flex: 0.5,
              },
            ]}
            autoHeight
          />
        </div>
      ))}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editId !== null ? "Edit" : "Add"} {formData.category}
        </DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            height: "100px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={handleChange}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </Container>
  );
};

export default PaymentManagementLists;
