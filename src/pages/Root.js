import { Outlet } from "react-router-dom";
import Topbar from "./global/Topbar";
import Sidebar from "./global/Sidebar";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { useState } from "react";
import { ColorModeContext, useMode } from "../theme";
import Login from "./login";
import { getSession } from "../services/user_service";

function RootLayout() {
  const token = getSession()
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return <>
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {token ? (
          <Box className="app" alignContent="flex">
            <Sidebar isSidebar={isSidebar} />
            <main className="content" style={{marginLeft:"270px"}}>
              <Topbar setIsSidebar={setIsSidebar} />
              <Outlet />
            </main>
          </Box>
        ) :
          <Login />
        }
      </ThemeProvider>
    </ColorModeContext.Provider>
  </>
}

export default RootLayout;