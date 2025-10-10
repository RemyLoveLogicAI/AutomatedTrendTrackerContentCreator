import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiUsers, FiFileText, FiActivity } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrends: 0,
    activeJobs: 0,
    generatedContent: 0,
    systemHealth: 'Unknown'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const healthResponse = await axios.get('/api/health');
      const trendsResponse = await axios.get('/api/trends?limit=5');

      setStats({
        totalTrends: trendsResponse.data.count || 0,
        activeJobs: 0,
        generatedContent: 0,
        systemHealth: healthResponse.data.status || 'ok'
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Active Trends',
      value: stats.totalTrends,
      icon: FiTrendingUp,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Jobs',
      value: stats.activeJobs,
      icon: FiActivity,
      color: 'bg-green-500'
    },
    {
      name: 'Generated Content',
      value: stats.generatedContent,
      icon: FiFileText,
      color: 'bg-purple-500'
    },
    {
      name: 'System Health',
      value: stats.systemHealth,
      icon: FiUsers,
      color: 'bg-yellow-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your trend tracking and content generation platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/trends'}
            className="bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            View Trends
          </button>
          <button
            onClick={() => window.location.href = '/content'}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Generate Content
          </button>
          <button
            onClick={() => window.location.href = '/jobs'}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            View Jobs
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Getting Started
        </h2>
        <div className="prose max-w-none">
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Configure your API keys in the .env file</li>
            <li>Navigate to the Trends page to view trending topics</li>
            <li>Use the Content Generator to create text, images, or videos</li>
            <li>Monitor your content generation jobs in the Jobs page</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
