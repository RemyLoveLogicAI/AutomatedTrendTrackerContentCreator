import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreateIcon from '@mui/icons-material/Create';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <TrendingUpIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Trend Tracker & Content Creator
        </Typography>
        <Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/trends"
            startIcon={<TrendingUpIcon />}
          >
            Trends
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/generate"
            startIcon={<CreateIcon />}
          >
            Generate Content
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
