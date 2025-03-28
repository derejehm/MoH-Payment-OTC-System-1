import { Outlet } from "react-router-dom";
import Topbar from "./global/Topbar";
import Sidebar from "./global/Sidebar";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { useState } from "react";
import { ColorModeContext, useMode } from "../theme";
import Login from "./login";
import { getSession } from "../services/user_service";

function RootLayout() {
  const token = getSession();
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
        <CssBaseline />
          {token ? (
            <>
            
              <Box display="flex" alignContent="flex-start">
                <Sidebar
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />

                <Box
                  component="main"
                  style={{
                    flexGrow: 1, // Allows content to stretch
                    transition: "margin-left 0.3s ease",
                    marginLeft: isCollapsed ? "80px" : "270px",
                    width: `calc(100% - ${isCollapsed ? 80 : 270}px)`, // Ensure proper stretching
                  }}
                >
                  <Topbar setIsCollapsed={setIsCollapsed} />
                  <Outlet />
                </Box>
              </Box>
            </>
          ) : (
            <Login />
          )}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}

export default RootLayout;
