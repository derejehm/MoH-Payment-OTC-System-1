import { useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import { logout } from "./user_service";
import moment from "moment/moment";

const tokenName = ".otc"

const useTokenCheck = () => {


  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem(tokenName); 
      if (!token) {
        return;
      }

      try {
        const decoded = jwtDecode(token);
        // const currentTime = Date.now() / 1000; 
        const currentTime = Date.parse(moment.utc().format()) / 1000; 

        // if (decoded.exp < currentTime) {
        //   logout();
        // }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    };


    const interval = setInterval(checkTokenExpiration, 1 * 60 * 1000);

    return () => clearInterval(interval); 
  }, []);

  return null;
};

export default useTokenCheck;
