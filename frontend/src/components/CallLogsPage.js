import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

const CallLogsPage = () => {
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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Sentiment</TableCell>
            <TableCell>Recording</TableCell>
            <TableCell>Summary</TableCell>
            <TableCell>Transcript</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {callLogs.map((call) => (
            <TableRow key={call.call_id}>
              <TableCell>{call.name}</TableCell>
              <TableCell>{call.phone_number}</TableCell>
              <TableCell>{call.status}</TableCell>
              <TableCell>{call.duration ? `${call.duration} sec` : "N/A"}</TableCell>
              <TableCell>{call.sentiment}</TableCell>
              <TableCell>
                {call.recording_url && call.recording_url !== "No recording available" ? (
                  <audio controls className="w-32">
                    <source src={call.recording_url} type="audio/wav" />
                  </audio>
                ) : (
                  <Typography color="gray">No Recording</Typography>
                )}
              </TableCell>
              <TableCell>
                {call.summary ? (
                  <Typography variant="body2" color="textSecondary">
                    {call.summary}
                  </Typography>
                ) : (
                  <Typography color="gray">No Summary</Typography>
                )}
              </TableCell>
              <TableCell>
                {call.transcript ? (
                  <Typography variant="body2" color="textSecondary">
                    {call.transcript}
                  </Typography>
                ) : (
                  <Typography color="gray">No Transcript</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CallLogsPage;
