import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Backdrop,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

const AddPatientInfo = ({
  isOpen,
  onClose,
  onSubmit,
  userData,
  resetUserData,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    address: "",
    age: "",
    phone: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          handleClose(); // Reset and close the modal
        }
      }}
      disableEscapeKeyDown
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add Patient Information</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  margin="normal"
                  required
                  //   error={!!usernameError}
                  //   helperText={usernameError}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Gender"
                  name="gender"
                  type="text"
                  value={formData.gender}
                  onChange={handleChange}
                  margin="normal"
                  required
                  //   error={!!emailError}
                  //   helperText={emailError}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              //   error={!!phoneError}
              //   helperText={phoneError}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                  required
                  //   error={!!phoneError}
                  //   helperText={phoneError}
                />
              </Grid>

              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button onClick={handleClose} color="secondary" sx={{ mr: 2 }}>
                Close
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Add Patient
              </Button>
            </Box>
          </form>
        </Grid>
      </Box>
    </Modal>
  );
};

// Modal Styles
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

export default AddPatientInfo;
