import api from "../utils/api";



export async function GetAllPaymentByDate(data) {
    console.log(data);
    const response = await api.put("/Payment/Get-all-Payment", data);
<<<<<<< HEAD
   // console.log('Response is =',response.data)
    return response.data;
  }

  export async function GetAllPaymentType() {
    const response = await api.get("/Lookup/payment-type");
    //console.log('Response is =',response.data)
=======
    console.log('Response is =',response.data)
>>>>>>> c1ec85df2d2f3aef5999b261ba4737b236f539ee
    return response.data;
  }