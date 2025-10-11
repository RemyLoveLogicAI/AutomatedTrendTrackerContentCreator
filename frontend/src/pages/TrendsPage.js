import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { trendAPI } from '../services/api';
import TrendCard from '../components/TrendCard';

const TrendsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10);

  const sources = ['all', 'twitter', 'reddit', 'youtube', 'google'];

  useEffect(() => {
    fetchTrends();
  }, [activeTab]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      const source = sources[activeTab];
      
      let response;
      if (source === 'all') {
        response = await trendAPI.getAllTrends({ limit });
      } else {
        response = await trendAPI[`get${source.charAt(0).toUpperCase() + source.slice(1)}Trends`]({ limit });
      }

      setTrends(response.data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Trending Topics
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Limit</InputLabel>
            <Select
              value={limit}
              label="Limit"
              onChange={(e) => setLimit(e.target.value)}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchTrends}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="All Sources" />
          <Tab label="Twitter" />
          <Tab label="Reddit" />
          <Tab label="YouTube" />
          <Tab label="Google" />
        </Tabs>
      </Box>

      {loading ? (
        <Box className="loading">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" className="error">
          Error: {error}
        </Typography>
      ) : trends.length === 0 ? (
        <Typography>
          No trends found. Make sure your API keys are configured correctly.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {trends.map((trend, index) => (
            <Grid item xs={12} key={trend.id || index}>
              <TrendCard trend={trend} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default TrendsPage;
