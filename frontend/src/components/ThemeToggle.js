import React, { useContext } from "react";
import { ColorModeContext } from "../theme";
import { IconButton, useTheme } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";

const ThemeToggle = () => {
  const theme = useTheme(); // ✅ Get theme from MUI
  const colorMode = useContext(ColorModeContext);

  return (
    <IconButton onClick={colorMode.toggleColorMode} color="inherit">
      {theme.palette.mode === "dark" ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
};

export default ThemeToggle;
