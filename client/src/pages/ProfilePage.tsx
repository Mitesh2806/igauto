import { useEffect } from 'react';
import { useScrapeStore } from '../../store/scrapeStore';
import Layout from '../../components/ProfileLayout';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,  PieChart, Pie, Cell
} from 'recharts';

// --- HELPER COMPONENTS & FUNCTIONS ---

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to use our backend image proxy
const getProxiedImageUrl = (imageUrl: string) => {
  if (!imageUrl) return ''; // Return empty string if URL is missing
  return `${API_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
};

// A versatile card for displaying key statistics
const StatCard = ({ label, value, icon }: { label: string; value: number | string; icon?: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center border border-gray-200 dark:border-gray-700">
    {icon && <div className="text-3xl mb-2">{icon}</div>}
    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{String(value)}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
  </div>
);

// A card for displaying recent posts/reels with AI tags
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
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
      {post.aiAnalysis?.tags && (
        <div className="flex flex-wrap gap-1">
          {post.aiAnalysis.tags.map((tag: string) => (
            <span key={tag} className="text-xs bg-white/20 text-white backdrop-blur-sm rounded-full px-2 py-0.5">{tag}</span>
          ))}
        </div>
      )}
      <div>
        <div className="flex text-white text-xs gap-4 font-medium">
          <span>❤️ {post.likes.toLocaleString()}</span>
          <span>💬 {post.comments.toLocaleString()}</span>
          {post.views != null && <span>▶️ {post.views.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  </div>
);

// Component for Demographics Pie Chart
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const DemographicsChart = ({ title, data }: { title: string, data: { name: string, value: number }[] }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-80 flex flex-col">
    <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">{title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);


// --- MAIN PROFILE PAGE COMPONENT ---

function ProfilePage() {
  const { fetchProfileData, scrapedData, isLoading, error } = useScrapeStore();

  useEffect(() => {
    // This single effect handles fetching ALL data for the page.
    if (!scrapedData) {
      fetchProfileData();
    }
  }, [fetchProfileData, scrapedData]);

  const renderContent = () => {
    if (isLoading) return <div className="text-center p-10 text-gray-600 dark:text-gray-300">Loading profile data...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    if (!scrapedData?.profile) {
      return <div className="text-center p-10 text-gray-600 dark:text-gray-300">No profile data found.</div>;
    }

    const { profile, analytics } = scrapedData;
    const { stats, growthData } = analytics || {};
    const { audienceDemographics, recentPosts, recentReels } = profile;

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <img
            src={getProxiedImageUrl(profile.profilePictureUrl)}
            alt={profile.username}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-500 object-cover"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">@{profile.username}</h1>
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">📊 Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Avg Likes" value={stats.averageLikes.toFixed(0)} icon="❤️" />
              <StatCard label="Avg Comments" value={stats.averageComments.toFixed(1)} icon="💬" />
              <StatCard label="Avg Views" value={stats.averageViews.toLocaleString(undefined, { notation: 'compact' })} icon="👁️" />
              <StatCard label="Engagement Rate" value={`${stats.engagementRate}%`} icon="📈" />
            </div>
          </div>
        )}

        {/* AI Audience Demographics */}
        {audienceDemographics && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🤖 AI Audience Demographics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {audienceDemographics.genderSplit?.length > 0 && <DemographicsChart title="Gender Split" data={audienceDemographics.genderSplit} />}
              {audienceDemographics.ageGroups?.length > 0 && <DemographicsChart title="Age Groups" data={audienceDemographics.ageGroups} />}
              {audienceDemographics.topGeographies?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-lg mb-4">Top Geographies</h3>
                  <ul className="space-y-3">
                    {audienceDemographics.topGeographies.map(geo => (
                      <li key={geo.name} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                        <span>{geo.name}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{geo.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Growth Chart */}
        {growthData && growthData.length > 1 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📈 Growth Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} />
                <Legend />
                <Line type="monotone" dataKey="followers" stroke="#8b5cf6" name="Followers" strokeWidth={2} />
                <Line type="monotone" dataKey="posts" stroke="#3b82f6" name="Posts" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Posts */}
        {recentPosts?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">📷 Recent Posts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          </div>
        )}

        {/* Recent Reels */}
        {recentReels?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">🎬 Recent Reels</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentReels.map(reel => <PostCard key={reel.id} post={reel} />)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

export default ProfilePage;