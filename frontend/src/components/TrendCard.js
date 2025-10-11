import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

const TrendCard = ({ trend }) => {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <SentimentSatisfiedAltIcon color="success" />;
      case 'negative':
        return <SentimentVeryDissatisfiedIcon color="error" />;
      default:
        return <SentimentNeutralIcon color="action" />;
    }
  };

  const getSourceColor = (source) => {
    const colors = {
      twitter: 'primary',
      reddit: 'error',
      youtube: 'error',
      google: 'success',
    };
    return colors[source?.toLowerCase()] || 'default';
  };

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Typography variant="h6" component="div" gutterBottom>
              {trend.topic}
            </Typography>
            <Box display="flex" gap={1} mb={1} flexWrap="wrap">
              <Chip
                label={trend.source}
                color={getSourceColor(trend.source)}
                size="small"
              />
              <Chip
                label={`Popularity: ${trend.popularity}`}
                variant="outlined"
                size="small"
              />
              {trend.sentiment && (
                <Chip
                  icon={getSentimentIcon(trend.sentiment)}
                  label={trend.sentiment}
                  size="small"
                />
              )}
            </Box>
            {trend.metadata?.note && (
              <Typography variant="caption" color="text.secondary">
                {trend.metadata.note}
              </Typography>
            )}
          </Box>
          {trend.url && (
            <IconButton
              size="small"
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <OpenInNewIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendCard;
