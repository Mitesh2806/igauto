import { useState, useEffect } from 'react';
import { useSearchStore } from '../../store/searchStore';
import Layout from '../../components/ProfileLayout'; // Assuming your layout component is here
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// --- HELPER COMPONENTS (Scoped to this file) ---

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getProxiedImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  return `${API_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
};

const StatCard = ({ label, value, icon }: { label: string; value: number | string; icon?: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-700">
    {icon && <div className="text-3xl mb-2">{icon}</div>}
    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value.toLocaleString()}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
  </div>
);

const PostCard = ({ post }: { post: any }) => (
  <div className="relative group overflow-hidden rounded-lg shadow-md bg-gray-100 dark:bg-gray-700 aspect-square">
    <img 
      src={getProxiedImageUrl(post.imageUrl)} 
      alt={post.caption ? post.caption.substring(0, 50) : 'Instagram Post'} 
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <p className="text-white text-sm line-clamp-2 mb-2">{post.caption || 'No caption'}</p>
      <div className="flex text-white text-xs gap-4 font-medium">
        <span>❤️ {post.likes.toLocaleString()}</span>
        <span>💬 {post.comments.toLocaleString()}</span>
        {post.views != null && <span>▶️ {post.views.toLocaleString()}</span>}
      </div>
    </div>
  </div>
);

// --- MAIN SEARCH PAGE COMPONENT ---

export default function ScrappedProfilePage() {
  const [username, setUsername] = useState('');
  const { searchProfile, searchedData, isLoading, error, clearSearch } = useSearchStore();

  // Clear search results when the user navigates away from the page
  useEffect(() => {
    return () => {
      clearSearch();
    };
  }, [clearSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      searchProfile(username.trim());
    }
  };

  const renderResults = () => {
    if (isLoading) return <div className="text-center p-10">Loading profile data...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    if (!searchedData) return <div className="text-center p-10 text-gray-500">Search for a profile to see the results.</div>;
  
    const { profile, analytics } = searchedData;
    const { stats, growthData, postPerformance } = analytics || {};

    return (
      <div className="mt-8 space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border">
          <img 
            src={getProxiedImageUrl(profile.profilePictureUrl)} 
            alt={profile.username} 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-500 object-cover"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">@{profile.username}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-center sm:text-left">{profile.fullName}</p>
          </div>
        </div>

        {/* Basic Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Followers" value={profile.followers} icon="👥" />
          <StatCard label="Following" value={profile.following} icon="➕" />
          <StatCard label="Posts" value={profile.postsCount} icon="📸" />
        </div>

        {/* Analytics Stats */}
        {stats && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Avg Likes" value={stats.averageLikes} icon="❤️" />
              <StatCard label="Avg Comments" value={stats.averageComments} icon="💬" />
              <StatCard label="Avg Views" value={stats.averageViews} icon="👁️" />
              <StatCard label="Engagement Rate" value={`${stats.engagementRate}%`} icon="📈" />
            </div>
          </div>
        )}

        {/* ... (Your other chart and post grid components would go here) ... */}
        {/* For brevity, I've omitted the full chart JSX, but you can copy it from your ProfilePage */}

      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Search & Scrape Profiles</h1>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Instagram username..."
              className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Scraping...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results */}
        {renderResults()}
      </div>
    </Layout>
  );
}