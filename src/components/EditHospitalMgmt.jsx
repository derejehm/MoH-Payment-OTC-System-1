import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Backdrop,
  Grid,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ways = ["SMS", "EMAIL"];

const EditHospitalMgmt = ({
  isOpen,
  onClose,
  onSubmit,
  userData,
  resetUserData,
  adding,
}) => {
  const [formData, setFormData] = useState({
    hospital: "",
    director: "",
    directorEmail: "",
    directorPhone: "",
    district: "",
    districtEmail: "",
    districtPhone: "",
    contactMethode: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  console.log("userData>>", userData);

  useEffect(() => {
    if (userData !== undefined) {
      setFormData({
        hospital: userData?.hospital || "",
        director: userData?.director || "",
        directorEmail: userData?.directorEmail || "",
        directorPhone: userData?.directorPhone || "",
        district: userData?.district || "",
        districtEmail: userData?.districtEmail || "",
        districtPhone: userData?.districtPhone || "",
        contactMethode: userData?.contactMethode || "",
      });
    }
  }, [userData]);



  const handleClose = () => {
    setFormData({
      hospital: "",
      director: "",
      directorEmail: "",
      directorPhone: "",
      district: "",
      districtEmail: "",
      districtPhone: "",
      contactMethode: "",
    });
    onClose();
    resetUserData();
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
          <Typography variant="h6">Add CBHI Information</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Grid>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextField
                  fullWidth
                  label="Hospital Name"
                  name="hospital"
                  type="text"
                  value={formData.hospital}
                  onChange={handleChange}
                  margin="normal"
                  disabled={!!userData}
                  //   error={!!fnameError}
                  //   helperText={fnameError}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Director"
                  name="director"
                  type="text"
                  value={formData.director}
                  onChange={handleChange}
                  margin="normal"
                  //disabled={!!userData}
                  //   error={!!fnameError}
                  //   helperText={fnameError}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={7}>
                <TextField
                  fullWidth
                  label="Director Email"
                  name="directorEmail"
                  type="email"
                  value={formData.directorEmail}
                  onChange={handleChange}
                  margin="normal"
                  //disabled={!!userData}
                  //   error={!!emailError}
                  //   helperText={emailError}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Director Mobile"
                  name="directorPhone"
                  type="text"
                  value={formData.directorPhone}
                  onChange={handleChange}
                  margin="normal"
                  //disabled={!!userData}
                  //   error={!!phoneError}
                  //   helperText={phoneError}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="District"
                  name="district"
                  type="text"
                  value={formData.district}
                  onChange={handleChange}
                  margin="normal"
                  //disabled={!!userData}
                  //   error={!!addrError}
                  //   helperText={addrError}
                />
              </Grid>

              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="District Email"
                  name="districtEmail"
                  type="test"
                  value={formData.districtEmail}
                  onChange={handleChange}
                  margin="normal"
                  //disabled={!!userData}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="District Mobile"
                  name="districtPhone"
                  type="test"
                  value={formData.districtPhone}
                  onChange={handleChange}
                  margin="normal"
                  //disabled={!!userData}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Contact Methode"
                  name="contactMethode"
                  type="test"
                  value={formData.contactMethode}
                  onChange={handleChange}
                  margin="normal"
                  //disabled={!!userData}
                >
                  {ways.map((way) => (
                    <MenuItem key={way} value={way}>
                      {way}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button onClick={handleClose} color="secondary" sx={{ mr: 2 }}>
                Close
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                //disabled={!!userData}
              >
                {adding ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Add CBHI Info"
                )}
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

export default EditHospitalMgmt;
