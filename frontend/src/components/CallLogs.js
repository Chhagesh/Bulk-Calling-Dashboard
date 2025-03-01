import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../theme";
import axios from "axios";

const CallLogs = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [callLogs, setCallLogs] = useState([]);

  useEffect(() => {
    const fetchCallLogs = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/call_logs");
        setCallLogs(response.data.calls);
      } catch (error) {
        console.error("Error fetching call logs:", error);
      }
    };

    fetchCallLogs();
    const interval = setInterval(fetchCallLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const columns = [
    { field: "call_id", headerName: "Call ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone_number", headerName: "Phone Number", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "duration", headerName: "Duration (sec)", flex: 1 },
    {
      field: "recording_url",
      headerName: "Recording",
      flex: 1,
      renderCell: (params) =>
        params.value && params.value !== "No recording available" ? (
          <audio controls className="w-32">
            <source src={params.value} type="audio/wav" />
          </audio>
        ) : (
          <Typography color="gray">No Recording</Typography>
        ),
    },
    { field: "sentiment", headerName: "Sentiment", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        Call Logs
      </Typography>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={callLogs}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.call_id}
        />
      </Box>
    </Box>
  );
};

export default CallLogs;
