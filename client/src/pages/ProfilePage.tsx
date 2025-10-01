import { useEffect } from 'react';
import { useScrapeStore } from '../../store/scrapeStore';
import Layout from '../../components/ProfileLayout';
import {
  Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// --- HELPER COMPONENTS & FUNCTIONS ---

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getProxiedImageUrl = (imageUrl: string) => {
  if (!imageUrl) return '';
  return `${API_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
};

// A versatile card for displaying key statistics
const StatCard = ({ label, value, icon }: { label: string; value: number | string; icon?: string }) => (
  // Applied theme classes: bg-card, border-border, text-primary, text-muted-foreground
  <div className="bg-card p-6 rounded-lg shadow-md text-center border border-border">
    {icon && <div className="text-3xl mb-2">{icon}</div>}
    <p className="text-2xl font-bold text-primary">{String(value)}</p>
    <p className="text-sm text-muted-foreground mt-1">{label}</p>
  </div>
);

// A card for displaying recent posts/reels with AI tags

// Component for Demographics Pie Chart
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const DemographicsChart = ({ title, data }: { title: string, data: { name: string, value: number }[] }) => (
  // Applied theme classes: bg-card, border-border, text-card-foreground
  <div className="bg-card p-6 rounded-lg shadow-md border border-border h-80 flex flex-col">
    <h3 className="font-semibold text-lg mb-4 text-card-foreground">{title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);


// --- MAIN PROFILE PAGE COMPONENT ---

function ProfilePage() {
  const { fetchProfileData, scrapedData, isLoading, error } = useScrapeStore();

  useEffect(() => {
    if (!scrapedData) {
      fetchProfileData();
    }
  }, [fetchProfileData, scrapedData]);

  const renderContent = () => {
    if (isLoading) return <div className="text-center p-10 text-muted-foreground">Loading profile data...</div>;
    if (error) return <div className="text-center p-10 text-destructive">{`Error: ${error}`}</div>;
    if (!scrapedData?.profile) {
      return <div className="text-center p-10 text-muted-foreground">No profile data found.</div>;
    }

    const { profile, analytics } = scrapedData;
    const { stats } = analytics || {};
    const { audienceDemographics } = profile;

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-card p-6 rounded-lg shadow-md border border-border">
          <img
            src={getProxiedImageUrl(profile.profilePictureUrl)}
            alt={profile.username}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary object-cover"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground text-center sm:text-left">@{profile.username}</h1>
            <p className="text-lg text-muted-foreground text-center sm:text-left">{profile.fullName}</p>
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
            <h2 className="text-2xl font-bold mb-4 text-foreground">📊 Analytics</h2>
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
            <h2 className="text-2xl font-bold mb-4 text-foreground">🤖 AI Audience Demographics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {audienceDemographics.genderSplit?.length > 0 && <DemographicsChart title="Gender Split" data={audienceDemographics.genderSplit} />}
              {audienceDemographics.ageGroups?.length > 0 && <DemographicsChart title="Age Groups" data={audienceDemographics.ageGroups} />}
              {audienceDemographics.topGeographies?.length > 0 && (
                <div className="bg-card p-6 rounded-lg shadow-md border border-border">
                  <h3 className="font-semibold text-lg mb-4 text-card-foreground">Top Geographies</h3>
                  <ul className="space-y-3">
                    {audienceDemographics.topGeographies.map(geo => (
                      <li key={geo.name} className="flex justify-between items-center text-muted-foreground">
                        <span>{geo.name}</span>
                        <span className="font-bold text-primary">{geo.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* (All other sections like Growth Chart, Post Grids, etc. would also use these theme classes) */}
        {/* ... */}
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