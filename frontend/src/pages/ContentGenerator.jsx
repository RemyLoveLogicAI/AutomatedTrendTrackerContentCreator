import React, { useState } from 'react';
import axios from 'axios';
import { FiImage, FiFileText, FiVideo, FiMic } from 'react-icons/fi';

const ContentGenerator = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [textForm, setTextForm] = useState({
    topic: '',
    type: 'blog',
    tone: 'professional',
    length: 'medium',
    language: 'en'
  });

  const [imageForm, setImageForm] = useState({
    prompt: '',
    style: 'realistic',
    size: '1024x1024',
    count: 1
  });

  const [videoForm, setVideoForm] = useState({
    script: '',
    duration: 60,
    voiceover: true
  });

  const [voiceForm, setVoiceForm] = useState({
    text: '',
    voice: 'default',
    language: 'en',
    speed: 1.0
  });

  const generateText = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('/api/content/text', textForm);
      setResult(response.data.data);
    } catch (error) {
      console.error('Error generating text:', error);
      alert('Error generating text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('/api/content/image', imageForm);
      setResult(response.data.data);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('/api/content/video', videoForm);
      setResult(response.data.data);
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Error generating video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateVoice = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('/api/content/voice', voiceForm);
      setResult(response.data.data);
    } catch (error) {
      console.error('Error generating voice:', error);
      alert('Error generating voice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'text', label: 'Text', icon: FiFileText },
    { id: 'image', label: 'Image', icon: FiImage },
    { id: 'video', label: 'Video', icon: FiVideo },
    { id: 'voice', label: 'Voice', icon: FiMic }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Generator</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate high-quality content using AI
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={textForm.topic}
                  onChange={(e) => setTextForm({ ...textForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter topic..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={textForm.type}
                    onChange={(e) => setTextForm({ ...textForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="blog">Blog Post</option>
                    <option value="tweet">Tweet</option>
                    <option value="script">Video Script</option>
                    <option value="article">Article</option>
                    <option value="description">Description</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={textForm.tone}
                    onChange={(e) => setTextForm({ ...textForm, tone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>
              <button
                onClick={generateText}
                disabled={loading || !textForm.topic}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Text'}
              </button>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <textarea
                  value={imageForm.prompt}
                  onChange={(e) => setImageForm({ ...imageForm, prompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Describe the image you want to generate..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <select
                    value={imageForm.style}
                    onChange={(e) => setImageForm({ ...imageForm, style: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="realistic">Realistic</option>
                    <option value="artistic">Artistic</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="abstract">Abstract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={imageForm.count}
                    onChange={(e) => setImageForm({ ...imageForm, count: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <button
                onClick={generateImage}
                disabled={loading || !imageForm.prompt}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Script
                </label>
                <textarea
                  value={videoForm.script}
                  onChange={(e) => setVideoForm({ ...videoForm, script: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="6"
                  placeholder="Enter video script..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={generateVideo}
                disabled={loading || !videoForm.script}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Video'}
              </button>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text
                </label>
                <textarea
                  value={voiceForm.text}
                  onChange={(e) => setVoiceForm({ ...voiceForm, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="4"
                  placeholder="Enter text to convert to speech..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={voiceForm.language}
                    onChange={(e) => setVoiceForm({ ...voiceForm, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceForm.speed}
                    onChange={(e) => setVoiceForm({ ...voiceForm, speed: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <button
                onClick={generateVoice}
                disabled={loading || !voiceForm.text}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Voice'}
              </button>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Result</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
