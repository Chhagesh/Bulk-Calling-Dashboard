import React, { useState, useEffect } from "react";
import { Box, Button, Grid, Typography, Card, CardContent, CircularProgress } from "@mui/material";
import UploadContacts from "./UploadContacts";
import axios from "axios";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failedCalls, setFailedCalls] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [pendingCalls, setPendingCalls] = useState(0);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/call_logs");
        setCalls(res.data.calls);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTotalCalls(calls.length);
    setCompletedCalls(calls.filter(call => call.status === "completed").length);
    setPendingCalls(calls.filter(call => call.status === "pending").length);
    setFailedCalls(calls.filter(call => call.status === "failed").length);
  }, [calls]);

  const handleStartCalls = async () => {
    try {
      setLoading(true);
      const contacts = calls.filter(call => call.status === "pending").map(call => ({
        phone_number: call.phone_number,
        name: call.name || "Unknown",
      }));

      await axios.post("http://127.0.0.1:8000/start_calls", { contacts });

      const updatedCalls = await axios.get("http://127.0.0.1:8000/call_logs");
      setCalls(updatedCalls.data.calls);
    } catch (error) {
      alert(`Error starting calls: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m={3}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Bulk Calling Dashboard
      </Typography>

      <UploadContacts />

      {/* Stats Section */}
      <Grid container spacing={3} mt={3}>
        {[{
          title: "Total Calls", value: totalCalls, color: "#1976D2"
        }, {
          title: "Pending Calls", value: pendingCalls, color: "#FFA000"
        }, {
          title: "Completed Calls", value: completedCalls, color: "#388E3C"
        }, {
          title: "Failed Calls", value: failedCalls, color: "#D32F2F"
        }].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ backgroundColor: stat.color, color: "white", textAlign: "center" }}>
              <CardContent>
                <Typography variant="h6">{stat.title}</Typography>
                <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Start Calls Button */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={24} /> : <PlayArrowIcon />}
          disabled={loading || calls.length === 0}
          onClick={handleStartCalls}
        >
          {loading ? "Initiating Calls..." : "Start Bulk Calls"}
        </Button>
      </Box>

      {/* Call Logs and Analytics */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={6}>
          
        </Grid>
        <Grid item xs={12} md={6}>
         
        </Grid>
      </Grid>
    </Box>
  );
}
