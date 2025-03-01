import React, { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const Sidebar = ({ selectedPage, setSelectedPage }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box
      sx={{
        height: "100vh",
        width: isCollapsed ? "80px" : "250px",
        transition: "width 0.3s ease",
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* Toggle Sidebar Collapse */}
          <MenuItem onClick={() => setIsCollapsed(!isCollapsed)} icon={<MenuOutlinedIcon />}>
            {!isCollapsed && (
              <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                <Typography variant="h3" color={colors.grey[100]}>
                  ADMIN
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* Sidebar Menu Items */}
          <MenuItem active={selectedPage === "Dashboard"} onClick={() => setSelectedPage("Dashboard")} icon={<HomeOutlinedIcon />}>
            Dashboard
          </MenuItem>

          <MenuItem active={selectedPage === "CallLogs"} onClick={() => setSelectedPage("CallLogs")} icon={<ContactsOutlinedIcon />}>
            Call Logs
          </MenuItem>


          <MenuItem active={selectedPage === "Analytics"} onClick={() => setSelectedPage("Analytics")} icon={<ReceiptOutlinedIcon />}>
            Analytics
          </MenuItem>

          
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
