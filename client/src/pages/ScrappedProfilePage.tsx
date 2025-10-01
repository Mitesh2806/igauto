import { useState, useEffect } from 'react';
import { useSearchStore } from '../../store/searchStore';
import Layout from '../../components/ProfileLayout';
import {
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// --- TYPE DEFINITIONS ---

interface Geography {
    name: string;
    value: number;
}

interface AudienceDemographics {
    genderSplit?: { name: string; value: number }[];
    ageGroups?: { name: string; value: number }[];
    topGeographies?: Geography[];
}

interface Post {
    id?: string | number;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;

    views?: number;
    aiAnalysis?: {
        tags: string[];
    };
}

interface Profile {
    profilePictureUrl: string;
    username: string;
    fullName: string;
    followers: number;
    following: number;
    postsCount: number;
    audienceDemographics?: AudienceDemographics;
    recentPosts?: Post[];
}

interface AnalyticsStats {
    averageLikes: number;
    averageComments: number;
    averageViews: number;
    engagementRate: string | number;
}

interface SearchedData {
    profile: Profile;
    analytics?: {
        stats?: AnalyticsStats;
    };
}


// --- HELPER COMPONENTS (Scoped to this file) ---

const API_URL = import.meta.env.VITE_API_URL || 'https://igauto.onrender.com';

const getProxiedImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    return `${API_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
};

const StatCard = ({ label, value, icon }: { label: string; value: number | string; icon?: string }) => (
    <div className="bg-card p-6 rounded-lg shadow-md text-center border border-border transition-all hover:shadow-lg hover:scale-105">
        {icon && <div className="text-3xl mb-2">{icon}</div>}
        <p className="text-2xl font-bold text-primary">{String(value)}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
);

const PostCard = ({ post }: { post: Post }) => (
    <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]">
        <div className="relative group aspect-square overflow-hidden">
            <img
                src={getProxiedImageUrl(post.imageUrl)}
                alt={post.caption ? post.caption.substring(0, 50) : 'Instagram Post'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex text-white text-xs gap-4 font-medium">
                    <span>❤️ {post.likes.toLocaleString()}</span>
                    <span>💬 {post.comments.toLocaleString()}</span>
                    {post.views != null && <span>▶️ {post.views.toLocaleString()}</span>}
                </div>
            </div>
        </div>

        <div className="p-3">
            {post.aiAnalysis?.tags && post.aiAnalysis.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {post.aiAnalysis.tags.map((tag: string) => (
                        <span key={tag} className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-3 py-1 transition-all hover:scale-110">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            {post.caption && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.caption}</p>
            )}
            <div className="flex text-sm text-muted-foreground gap-4 font-medium mt-auto">
                <span>❤️ {post.likes.toLocaleString()}</span>
                <span>💬 {post.comments.toLocaleString()}</span>
                {post.views != null && <span>▶️ {post.views.toLocaleString()}</span>}
            </div>
        </div>
    </div>
);

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const DemographicsChart = ({ title, data }: { title: string; data: { name: string; value: number }[] }) => (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border h-80 flex flex-col transition-all hover:shadow-lg">
        <h3 className="font-semibold text-lg mb-4 text-card-foreground">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--popover)',
                        color: 'var(--popover-foreground)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)'
                    }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>
);

// --- MAIN SEARCH PAGE COMPONENT ---

export default function ScrappedProfilePage() {
    const [username, setUsername] = useState('');
    const { searchProfile, searchedData, isLoading, error, clearSearch } = useSearchStore() as {
        searchProfile: (username: string) => void;
        searchedData: SearchedData | null;
        isLoading: boolean;
        error: string | null;
        clearSearch: () => void;
    };

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
        if (isLoading) {
            return (
                <div className="text-center p-10 text-muted-foreground">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="text-lg">Scraping profile data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-10">
                    <div className="bg-destructive/10 text-destructive rounded-lg p-6 inline-block">
                        <span className="text-3xl mb-3 block">⚠️</span>
                        <p className="font-semibold">Error: {error}</p>
                    </div>
                </div>
            );
        }

        if (!searchedData) {
            return (
                <div className="text-center p-10">
                    <div className="bg-muted rounded-lg p-8 inline-block">
                        <span className="text-4xl mb-3 block">🔍</span>
                        <p className="text-muted-foreground text-lg">Search for a profile to see the results.</p>
                    </div>
                </div>
            );
        }

        const { profile, analytics } = searchedData;
        const { audienceDemographics, recentPosts } = profile;
        const stats = analytics?.stats;

        return (
            <div className="mt-8 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-card p-6 rounded-lg shadow-md border border-border transition-all hover:shadow-lg">
                    <img
                        src={getProxiedImageUrl(profile.profilePictureUrl)}
                        alt={profile.username}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-primary object-cover transition-transform hover:scale-110"
                    />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground text-center sm:text-left">
                            @{profile.username}
                        </h1>
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

                
                {audienceDemographics && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-foreground">🤖 AI Audience Demographics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* FIX: Safely check for genderSplit before using it */}
                            {audienceDemographics.genderSplit?.length > 0 && (
                                <DemographicsChart title="Gender Split" data={audienceDemographics.genderSplit} />
                            )}
                            
                            {/* FIX: Safely check for ageGroups before using it */}
                            {audienceDemographics.ageGroups?.length > 0 && (
                                <DemographicsChart title="Age Groups" data={audienceDemographics.ageGroups} />
                            )}
                            
                            {/* FIX: Safely check for topGeographies before using it */}
                            {audienceDemographics.topGeographies?.length > 0 && (
                                <div className="bg-card p-6 rounded-lg shadow-md border border-border transition-all hover:shadow-lg">
                                    <h3 className="font-semibold text-lg mb-4 text-card-foreground">Top Geographies</h3>
                                    <ul className="space-y-3">
                                        
                                        {/* FIX: Safely call .map() on topGeographies */}
                                        {audienceDemographics.topGeographies?.map((geo: Geography) => (
                                            <li key={geo.name} className="flex justify-between items-center text-muted-foreground transition-all hover:text-primary">
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

                {/* Recent Posts Grid */}
                {recentPosts && recentPosts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-foreground">📸 Recent Posts</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recentPosts.map((post: Post, index: number) => (
                                <PostCard key={post.id || index} post={post} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {/* Search Bar */}
                <div className="bg-card p-6 rounded-lg shadow-md border border-border mb-8 transition-all hover:shadow-lg">
                    <h1 className="text-2xl font-bold text-card-foreground mb-4">
                        🔍 Search & Scrape Profiles
                    </h1>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Instagram username..."
                            className="flex-grow px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 font-semibold text-primary-foreground bg-primary rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></span>
                                    Scraping...
                                </span>
                            ) : (
                                'Search'
                            )}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {renderResults()}
            </div>
        </Layout>
    );
}