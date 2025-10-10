import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import { trendAPI, healthAPI } from '../services/api';
import TrendCard from '../components/TrendCard';

const Dashboard = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trendsResponse, healthResponse] = await Promise.all([
          trendAPI.getAllTrends({ limit: 5 }),
          healthAPI.detailedCheck(),
        ]);
        setTrends(trendsResponse.data.data || []);
        setHealth(healthResponse.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box className="loading">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Trends</Typography>
              </Box>
              <Typography variant="h3">{trends.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Currently tracking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ArticleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Content Generated</Typography>
              </Box>
              <Typography variant="h3">0</Typography>
              <Typography variant="caption" color="text.secondary">
                Total pieces
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ImageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">API Status</Typography>
              </Box>
              <Typography variant="h6" color={health?.status === 'healthy' ? 'success.main' : 'error.main'}>
                {health?.status || 'Unknown'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                System health
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Trends */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Latest Trends
        </Typography>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : trends.length === 0 ? (
          <Typography>No trends available. Check your API configuration.</Typography>
        ) : (
          trends.map((trend, index) => (
            <TrendCard key={trend.id || index} trend={trend} />
          ))
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
