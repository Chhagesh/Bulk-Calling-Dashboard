import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Box, Typography } from "@mui/material"; // To match your theme better

const CallAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/analytics");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Fetching error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div>Error loading data: {error}</div>;
  if (!analytics) return <div>Loading analytics data...</div>;

  const sentimentData = [
    { name: "Positive", value: analytics.sentiments?.positive || 0 },
    { name: "Neutral", value: analytics.sentiments?.neutral || 0 },
    { name: "Negative", value: analytics.sentiments?.negative || 0 },
  ];

  const successRateData = [
    { name: "Successful Calls", value: analytics?.success_rate?.successful_calls || 0 },
    { name: "Failed Calls", value: analytics?.success_rate?.failed_calls || 0 }
  ];

  const disconnectionData = analytics.disconnection_reasons ? 
    Object.entries(analytics.disconnection_reasons).map(([reason, count]) => ({ reason, count })) :
    [{ reason: "No Data", count: 0 }];

  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom color="text.primary">
        Call Analytics Dashboard
      </Typography>
      <Box sx={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mt: 3
      }}>
        {/* Success Rate Chart */}
        <Box sx={{
          p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 2
        }}>
          <Typography variant="h6" mb={2}>Call Success Rate</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={successRateData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#4CAF50" />
                <Cell fill="#F44336" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <Typography align="center" variant="body1" mt={2}>
            Success Rate: {analytics?.success_rate?.percentage}%
          </Typography>
        </Box>

        {/* Call Sentiments Chart */}
        <Box sx={{
          p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 2
        }}>
          <Typography variant="h6" mb={2}>Call Sentiments</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#4CAF50', '#FFC107', '#F44336'][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Disconnection Reasons Chart */}
        <Box sx={{
          p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 2
        }}>
          <Typography variant="h6" mb={2}>Disconnection Reasons</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={disconnectionData}>
              <XAxis dataKey="reason" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default CallAnalytics;
