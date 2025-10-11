import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import GenerateIcon from '@mui/icons-material/AutoAwesome';
import DownloadIcon from '@mui/icons-material/Download';
import { contentAPI } from '../services/api';

const ContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState(null);

  const contentTypes = [
    { value: 'blog', label: 'Blog Post' },
    { value: 'tweet', label: 'Tweet' },
    { value: 'script', label: 'Video Script' },
    { value: 'article', label: 'Article' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.generateText({
        prompt,
        type: contentType,
        maxTokens: contentType === 'tweet' ? 100 : 500,
        temperature: 0.7,
      });

      setGeneratedContent(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error generating content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePackage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a trend topic');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await contentAPI.generatePackage({
        trend: prompt,
        includeText: true,
        includeImage: true,
        includeVoiceover: false,
        contentTypes: ['tweet', 'blog'],
      });

      setGeneratedContent(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error generating content package:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;

    const content = generatedContent.content || JSON.stringify(generatedContent, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Content Generator
      </Typography>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Prompt / Topic"
              placeholder="Enter a topic or prompt for content generation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={contentType}
                label="Content Type"
                onChange={(e) => setContentType(e.target.value)}
              >
                {contentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" gap={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<GenerateIcon />}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Content'}
              </Button>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={handleGeneratePackage}
              disabled={loading}
            >
              Generate Complete Package
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Output Section */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, minHeight: 400 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Generated Content</Typography>
              {generatedContent && (
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  variant="outlined"
                  size="small"
                >
                  Download
                </Button>
              )}
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress />
              </Box>
            ) : generatedContent ? (
              <Box>
                {generatedContent.content ? (
                  // Single content
                  <>
                    <Box mb={2}>
                      <Chip label={generatedContent.type} color="primary" size="small" />
                      {generatedContent.metadata?.note && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          {generatedContent.metadata.note}
                        </Alert>
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'inherit',
                        backgroundColor: '#f5f5f5',
                        p: 2,
                        borderRadius: 1,
                      }}
                    >
                      {generatedContent.content}
                    </Typography>
                  </>
                ) : generatedContent.contents ? (
                  // Content package
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      Content Package for: {generatedContent.trend}
                    </Typography>
                    {generatedContent.contents.text && Object.entries(generatedContent.contents.text).map(([type, content]) => (
                      <Card key={type} sx={{ mb: 2 }}>
                        <CardContent>
                          <Chip label={type} color="primary" size="small" sx={{ mb: 1 }} />
                          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                            {content.content}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                    {generatedContent.contents.image && (
                      <Card sx={{ mb: 2 }}>
                        <CardContent>
                          <Chip label="Image" color="secondary" size="small" sx={{ mb: 1 }} />
                          <Typography variant="body2">
                            URL: {generatedContent.contents.image.url}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Typography>Unknown content format</Typography>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary" align="center" sx={{ mt: 10 }}>
                Enter a prompt and click generate to create content
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContentGenerator;
