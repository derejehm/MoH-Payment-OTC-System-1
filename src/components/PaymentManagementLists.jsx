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
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";

const categories = [
  "Digital Payment Channels",
  "CBHI Providers",
  "Organizations with Agreements",
  "Hospital Treatments",
  "Payment Methods",
];

const PaymentManagementLists = () => {
  const [data, setData] = useState({});
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ category: "", name: "" });
  const [editId, setEditId] = useState(null);
console.log(formData)
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("paymentData")) || {};
    setData(storedData);
  }, []);

  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem("paymentData", JSON.stringify(newData));
  };

  const handleOpen = (category, item = "", id = null) => {
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

  const handleSubmit = () => {
    const { category, name } = formData;
    if (!name.trim()) return;

    const updatedCategory = data[category] ? [...data[category]] : [];
    if (editId !== null) {
      updatedCategory[editId] = name;
    } else {
      updatedCategory.push(name);
    }
    saveData({ ...data, [category]: updatedCategory });
    handleClose();
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
            rows={(data[category] || []).map((item, index) => ({ id: index, name: item }))}
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
                    <IconButton onClick={() => handleOpen(category, params.row.name, params.row.id)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category, params.row.id)} color="error">
                      <Delete />
                    </IconButton>
                  </>
                ),
                flex: 0.5,
              },
            ]}
            autoHeight
            pageSize={5}
          />
        </div>
      ))}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId !== null ? "Edit" : "Add"} {formData.category}</DialogTitle>
        <DialogContent>
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
    </Container>
  );
};

export default PaymentManagementLists;
