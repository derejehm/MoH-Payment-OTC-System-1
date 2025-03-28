import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import EditHospitalMgmt from "./EditHospitalMgmt";

const HospitalManagement = () => {
  const [data, setData] = useState([]);
  const [selected,setSelected] = useState(null)
  const [openDialog,setOpenDialog] = useState(false)
  const [editing,setIsEditing] = useState(false)



  const handleEditUser = async (params) => {
    try {
       console.log(params.row)
       setSelected(params.row)
       setOpenDialog(true)
    } catch (error) {
      console.error(error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "Employee ID", flex: 1 },
    { field: "hospital", headerName: "Employee Name", flex: 1 },
    { field: "director", headerName: "Email", flex: 1 },
    { field: "directorEmail", headerName: "Assigned Hospital", flex: 1 },
    { field: "directorPhone", headerName: "Assigned Hospital", flex: 1 },
    { field: "district", headerName: "Assigned Hospital", flex: 1 },
    { field: "districtEmail", headerName: "Assigned Hospital", flex: 1 },
    { field: "districtPhone", headerName: "Assigned Hospital", flex: 1 },
    {
        field: "actions",
        headerName: "Actions",
        width: 150,
        renderCell: (params) => (
          <>
            <IconButton
              onClick={() => handleEditUser(params)}
              aria-label="edit"
              className="text-info"
            >
              <EditIcon />
            </IconButton>
          </>
        ),
      },
  ];

  const mocData = [
    {
      id: "1",
      hospital: "Employee Name",
      director: "Email",
      directorEmail: "Assigned Hospital",
      directorPhone: "Assigned Hospital",
      district: "Assigned Hospital",
      districtEmail: "Assigned Hospital",
      districtPhone: "Assigned Hospital",
      contactMethode:"SMS",
    },
    {
        id: "2",
        hospital: "Employee Name",
        director: "Email",
        directorEmail: "Assigned Hospital",
        directorPhone: "Assigned Hospital",
        district: "Assigned Hospital",
        districtEmail: "Assigned Hospital",
        districtPhone: "Assigned Hospital",
        contactMethode:"EMAIL",
      },
      {
        id: "3",
        hospital: "Employee Name",
        director: "Email",
        directorEmail: "Assigned Hospital",
        directorPhone: "Assigned Hospital",
        district: "Assigned Hospital",
        districtEmail: "Assigned Hospital",
        districtPhone: "Assigned Hospital",
        contactMethode:"SMS",
      },
  ];

  const handleEditSubmit = async(data)=>{
    try{
        setIsEditing(true)
        console.log("Efit this one>>",data)
    }catch(error)
    {
        console.error(error)
    }finally{
        setIsEditing(false)
    }

  }
const handleReset =()=>{
    setSelected(null)
}
  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        District - Director - Hospital Mapping
      </Typography>
      <Paper sx={{ height: 400 }}>
        <DataGrid rows={mocData} columns={columns} />
      </Paper>
      <EditHospitalMgmt
        isOpen={openDialog}
        onClose = {()=>setOpenDialog(false)}
        onSubmit ={handleEditSubmit}
        userData={selected}
        resetUserData ={handleReset}
        adding = {editing}
      />
    </Container>
  );
};

export default HospitalManagement;
