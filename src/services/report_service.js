import api from "../utils/api";



export async function GetAllPaymentByDate(data) {
    console.log(data);
    const response = await api.put("/Payment/Get-all-Payment", data);
   // console.log('Response is =',response.data)
    return response.data;
  }

  export async function GetAllPaymentType() {
    const response = await api.get("/Lookup/payment-type");
    //console.log('Response is =',response.data)
    return response.data;
  }