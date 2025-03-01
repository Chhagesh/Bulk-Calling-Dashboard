import React, { useState } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CallLogsPage from "./components/CallLogsPage"; // ✅ Import Call Logs Page
import ThemeToggle from "./components/ThemeToggle";
import CallAnalytics from "./components/CallAnalytics";
function App() {
  const [theme, colorMode] = useMode();
  const [selectedPage, setSelectedPage] = useState("Dashboard");

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" height="100vh" width="100vw">
          {/* Sidebar */}
          <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} />

          {/* Main Content Area */}
          <Box flexGrow={1} overflow="auto" p={3} bgcolor="background.default">
            {/* Theme Toggle at Top-Right */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <ThemeToggle />
            </Box>

            {/* Page Content */}
            {selectedPage === "Dashboard" && <Dashboard />}
            {selectedPage === "CallLogs" && <CallLogsPage />}
            {selectedPage === "Analytics" && <CallAnalytics />}
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
