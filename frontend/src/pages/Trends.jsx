import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiExternalLink } from 'react-icons/fi';

const Trends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    source: 'all',
    region: 'US',
    limit: 20
  });

  useEffect(() => {
    fetchTrends();
  }, [filters]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.source !== 'all') params.append('source', filters.source);
      params.append('region', filters.region);
      params.append('limit', filters.limit);

      const response = await axios.get(`/api/trends?${params}`);
      setTrends(response.data.data || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadgeColor = (source) => {
    const colors = {
      twitter: 'bg-blue-100 text-blue-800',
      reddit: 'bg-orange-100 text-orange-800',
      youtube: 'bg-red-100 text-red-800',
      google: 'bg-green-100 text-green-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trending Topics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time trends from multiple sources
          </p>
        </div>
        <button
          onClick={fetchTrends}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sources</option>
              <option value="twitter">Twitter</option>
              <option value="reddit">Reddit</option>
              <option value="youtube">YouTube</option>
              <option value="google">Google Trends</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region
            </label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="IN">India</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popularity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trends.map((trend, index) => (
                <tr key={trend.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {trend.topic}
                    </div>
                    {trend.description && (
                      <div className="text-sm text-gray-500">
                        {trend.description.substring(0, 100)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getSourceBadgeColor(trend.source)}`}>
                      {trend.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trend.popularity?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => window.location.href = `/content?topic=${encodeURIComponent(trend.topic)}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Generate Content
                    </button>
                    {trend.url && (
                      <a
                        href={trend.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FiExternalLink className="inline" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {trends.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No trends found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Trends;
