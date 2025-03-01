import React from "react";
import { Typography, Box } from "@mui/material";

const Header = ({ title, subtitle }) => {
  return (
    <Box mb={2}>
      <Typography variant="h4" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="subtitle1" color="gray">
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
