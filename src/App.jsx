import React,{useEffect} from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/dashboard";
import Bar from "./pages/bar";
import Form from "./pages/form";
import Line from "./pages/line";
import Pie from "./pages/pie";
import FAQ from "./pages/faq";
import Login from "./pages/login";
import Geography from "./pages/geography";
import Calendar from "./pages/calendar/calendar";
import UserManagment from "./components/UserManagment.jsx";
import RoleManagment from "./components/RoleManagment.jsx";
import NotFoundPage from "./pages/errorPage/NotFoundPage ";
import RootLayout from "./pages/Root.js";
import { logout as logoutAction } from "./services/user_service.js";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import { getTokenValue,getSession,logout } from "./services/user_service.js";
import HospitalPayment from "./pages/hospitalpayment/HospitalPayment.jsx";
import ReportPage from "./pages/reports/ReportPage.jsx";
import BankerComponent from './pages/supervisors/BankerComponent.jsx'
import DynamicFieldsForm from './pages/hospitalpayment/DynamicFieldsForm.jsx'
import FinancialDashboard from "./components/FinancialDashboard.jsx";
import useTokenCheck from "./services/useTokenCheck.js";
import PaymentManagementLists from "./components/PaymentManagementLists.jsx";
import CollectedReport from "./pages/reports/CollectedReport.jsx";

const tokenvalue = getTokenValue()

const token = getSession();
const ProtectedRoute = ({ element, allowedRoles }) => {

  const role = tokenvalue["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (!token) {
    logout()
    return
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />, // Ensuring layout consistency
    errorElement: <NotFoundPage />,
    id: "root",
    loader: getSession,
    children: [
      { index: true, element: <ProtectedRoute element={<Dashboard />} /> },
      { path: "login", element: <Login /> },
      { path: "logout", action: logoutAction },
      // { path: "profile", element: <ProtectedRoute element={<Profile />} /> },

      // Role-based protected routes
      {
        path: "UserManagment",
        element: (
          <ProtectedRoute
            element={<UserManagment />}
            allowedRoles={["Admin"]}
          />
        ),
      },
      {
        path: "payment-channel",
        element: (
          <ProtectedRoute
            element={<PaymentManagementLists/>}
            allowedRoles={["Admin"]}
          />
        ),
      },
      {
        path: "payments",
        element: (
          <ProtectedRoute
            element={<HospitalPayment />}
            allowedRoles={["User"]}
          />
        ),
      },
      {
        path: "cash-managment",
        element: (
          <ProtectedRoute
            element={<BankerComponent />}
            allowedRoles={["User"]}
          />
        ),
      },
      {
        path: "money-submission",
        element: (
          <ProtectedRoute
            element={<FinancialDashboard />}
            allowedRoles={["User"]}
          />
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute
            element={<ReportPage />}
            allowedRoles={["User"]}
          />
        ),
      },
      {
        path: "collection-reports",
        element: (
          <ProtectedRoute
            element={<CollectedReport />}
            allowedRoles={["User"]}
          />
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute
            element={<ProfilePage />}
            allowedRoles={["Admin","User"]}
          />
        ),
      },
      {
        path: "RoleManagment",
        element: (
          <ProtectedRoute
            element={<RoleManagment />}
            allowedRoles={["Admin"]}
          />
        ),
      },

      // Publicly accessible routes
      { path: "form", element: <ProtectedRoute element={<Form />} /> },
      { path: "bar", element: <ProtectedRoute element={<Bar />} /> },
      { path: "pie", element: <ProtectedRoute element={<Pie />} /> },
      { path: "line", element: <ProtectedRoute element={<Line />} /> },
      { path: "faq", element: <ProtectedRoute element={<FAQ />} /> },
      { path: "calendar", element: <ProtectedRoute element={<Calendar />} /> },
      {
        path: "geography",
        element: <ProtectedRoute element={<Geography />} />,
      },
      { path: "unauthorized", element: <h1>Not Allowed!!</h1> },

      // Catch-All Route
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

const queryClient = new QueryClient();

function App() {
  useTokenCheck()


  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
