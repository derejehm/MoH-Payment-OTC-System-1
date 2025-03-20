import api from "../utils/api";
import {jwtDecode} from "jwt-decode";

const tokenName = ".otc";



export async function login(payload) {
  const response = await api.put("/Account/Login", {
    username: payload.username,
    password: payload.password,
  });
  console.log('Response is =',response.data)
  return { ...response.data };
}

export async function getUserDetails() {

  const data = {};

  return data;
}

export function logout() {
  localStorage.removeItem(tokenName);
  localStorage.removeItem("currentNav")
  return (window.location.href = window.location.origin + "/login");
}

export function getUser() {
  try {
    const session = localStorage.getItem(tokenName);
    return session;
  } catch (error) {
    return null;
  }
}

export function getSession() {
  const token = localStorage.getItem(tokenName);
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; 

    if (decoded.exp && decoded.exp < currentTime) {
      return null; 
    }

    return token; 
  } catch (error) {
    return null;
  }
}

export function getTokenValue(){
  const token = localStorage.getItem(tokenName);
  if (!token) {
    return null;
  }
  const decoded = jwtDecode(token);
  
return decoded
}

export function checkAuthLoader() {
  const session = getSession();

  if (!session) {
    localStorage.removeItem(tokenName);
    return (window.location.href = window.location.origin + "/login");
  }
}
