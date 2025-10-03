import { useEffect, useState } from 'react';
import { useScrapeStore } from '../../store/scrapeStore';
import Layout from '../../components/ProfileLayout';
import {
    Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {  ExternalLink, TrendingUp, Heart, MessageCircle, FileText,  X } from 'lucide-react';
import TopStatCard from '../../components/ui/TopStatCard';

// --- HELPER COMPONENTS & FUNCTIONS ---

const API_URL = import.meta.env.VITE_API_URL || 'https://igauto.onrender.com';

const getProxiedImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    return `${API_URL}/api/proxy/image?url=${encodeURIComponent(imageUrl)}`;
};

// --- MODAL COMPONENT ---
interface Geography {
    name: string;
    value: number;
}
const PostModal = ({ post, onClose }: { post: any; onClose: () => void; username: string }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const postUrl = post.postUrl || `https://www.instagram.com/p/${post.id || ''}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
            <div className="relative bg-zinc-900 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-zinc-800 shadow-2xl flex flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                {/* Left Side - Image */}
                <div className="lg:w-1/2 w-full bg-black flex items-center justify-center">
                    <img
                        src={getProxiedImageUrl(post.imageUrl)}
                        alt={post.caption ? post.caption.substring(0, 50) : 'Instagram Post'}
                        className="w-full h-full object-contain max-h-[95vh] "
                        onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23888"%3ENo Image%3C/text%3E%3C/svg%3E'; }}
                    />
                </div>
                

                {/* Right Side - Content */}
                <div className="lg:w-1/2 w-full flex flex-col max-h-[95vh] lg:max-h-none">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Caption */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-3">Caption</h3>
                            {post.caption ? (
                                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
                            ) : (
                                <p className="text-zinc-500 italic">No caption</p>
                            )}
                        </div>

                        {/* Tags */}
                        {post.aiAnalysis?.tags && post.aiAnalysis.tags.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-zinc-400 mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.aiAnalysis.tags.map((tag: string) => (
                                        <span key={tag} className="text-xs font-semibold bg-zinc-800 text-zinc-200 rounded-full px-3 py-1.5 border border-zinc-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Engagement Stats */}
                        <div>
                            <h3 className="text-sm font-bold text-zinc-400 mb-3">Engagement</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-300">Likes:</span>
                                    <span className="font-bold text-white text-xl">{post.likes.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-300">Comments:</span>
                                    <span className="font-bold text-white text-xl">{post.comments.toLocaleString()}</span>
                                </div>
                                {/* {post.views != null && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-300">Views:</span>
                                        <span className="font-bold text-white text-xl">{post.views.toLocaleString()}</span>
                                    </div>
                                )} */}
                            </div>
                        </div>

                        {/* Post ID */}
                        {post.id && (
                            <div>
                                <h3 className="text-sm font-bold text-zinc-400 mb-2">Post ID</h3>
                                <code className="text-xs text-zinc-300 bg-zinc-800 px-3 py-2 rounded block font-mono">
                                    {post.id}
                                </code>
                            </div>
                        )}
                    </div>

                    {/* Bottom Button */}
                    <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
                        <a
                            href={postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
                        >
                            <ExternalLink size={18} />
                            View on Instagram
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CHILD COMPONENTS ---

const AnalyticsStat = ({ label, value, icon, colorClassName }: { label: string; value: string | number; icon: React.ReactNode; colorClassName: string; }) => (
    <div className={`flex items-center justify-between bg-zinc-900/80 p-4 rounded-lg border border-zinc-800 transition-all hover:border-zinc-700 hover:bg-zinc-900`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-zinc-300 font-medium">{label}</span>
        </div>
        <span className={`font-bold text-xl ${colorClassName}`}>{value}</span>
    </div>
);

const PostCard = ({ post, onClick }: { post: any; onClick: () => void }) => (
    <div 
        className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] hover:border-zinc-700 cursor-pointer"
        onClick={onClick}
    >
        <div className="relative group aspect-square overflow-hidden">
            <img
                src={getProxiedImageUrl(post.imageUrl)}
                alt={post.caption ? post.caption.substring(0, 50) : 'Instagram Post'}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23888"%3ENo Image%3C/text%3E%3C/svg%3E'; }}
            />
        </div>
        <div className="p-4 space-y-3">
            {/* Caption Preview */}
            {post.caption && (
                <p className="text-sm text-zinc-400 line-clamp-2">{post.caption}</p>
            )}

            {/* Stats Below Image */}
            <div className="flex items-center gap-4 text-sm text-zinc-300 pt-2 border-t border-zinc-800">
                <span className="flex items-center gap-1.5">
                    <Heart size={16} className="text-red-400" /> 
                    <span className="font-semibold">{post.likes.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1.5">
                    <MessageCircle size={16} className="text-blue-400" /> 
                    <span className="font-semibold">{post.comments.toLocaleString()}</span>
                </span>
                {/* {post.views != null && (
                    <span className="flex items-center gap-1.5">
                        <Eye size={16} className="text-purple-400" /> 
                        <span className="font-semibold">{post.views.toLocaleString()}</span>
                    </span>
                )} */}
            </div>

            {/* Tags */}
            {post.aiAnalysis?.tags && post.aiAnalysis.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {post.aiAnalysis.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs font-semibold bg-zinc-800 text-zinc-200 rounded-full px-3 py-1 border border-zinc-700">
                            {tag}
                        </span>
                    ))}
                    {post.aiAnalysis.tags.length > 3 && (
                        <span className="text-xs font-semibold bg-zinc-800 text-zinc-400 rounded-full px-3 py-1 border border-zinc-700">
                            +{post.aiAnalysis.tags.length - 3}
                        </span>
                    )}
                </div>
            )}
        </div>
    </div>
);

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const DemographicsChart = ({ title, data }: { title: string, data: { name: string, value: number }[] }) => (
    <div className="bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-800 h-80 flex flex-col transition-all hover:shadow-2xl hover:border-zinc-700">
        <h3 className="font-bold text-lg mb-4 text-white">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {data.map((_, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)' }} />
                <Legend wrapperStyle={{ color: '#a1a1aa' }} />
            </PieChart>
        </ResponsiveContainer>
    </div>
);


// --- MAIN PROFILE PAGE COMPONENT ---

function ProfilePage() {
    const { fetchProfileData, scrapedData, isLoading, error } = useScrapeStore();
    const [selectedPost, setSelectedPost] = useState<any>(null);

    useEffect(() => {
        if (!scrapedData) {
            fetchProfileData();
        }
    }, [fetchProfileData, scrapedData]);

    const formatDate = (date: Date) => {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-[60vh] text-zinc-400">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-lg ml-4">Loading profile data...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center p-10">
                    <div className="bg-red-950/50 text-red-400 rounded-xl p-6 inline-block border border-red-900">
                        <span className="text-3xl mb-3 block">⚠️</span>
                        <p className="font-semibold">{`Error: ${error}`}</p>
                    </div>
                </div>
            );
        }
        if (!scrapedData?.profile) {
            return (
                <div className="text-center p-10">
                    <div className="bg-zinc-900 rounded-xl p-8 inline-block border border-zinc-800">
                        <span className="text-4xl mb-3 block">📭</span>
                        <p className="text-zinc-400">No profile data found.</p>
                    </div>
                </div>
            );
        }

        const { profile, analytics } = scrapedData;
        const { stats } = analytics || {};
        const { audienceDemographics, recentPosts } = profile;

        return (
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* --- COMBINED PROFILE & STATS SECTION --- */}
                <section>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        
                        <div className="flex justify-center md:justify-center">
                            <img
                                src={getProxiedImageUrl(profile.profilePictureUrl)}
                                alt={profile.username}
                                className="w-40 h-40 rounded-full border-2 border-zinc-700 object-cover"
                            />
                        </div>

                      
                        <div className="flex flex-col space-y-3 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white">{profile.fullName}</h1>
                            <p className="text-lg text-zinc-400">@{profile.username}</p>
                            <div className="flex justify-center md:justify-start">
                                <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full px-3 py-1 self-start">
                                    Instagram Influencer
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Scraped from Instagram • Last updated: {formatDate(new Date())}
                            </p>
                            <div className="flex items-center gap-3 pt-2 justify-center md:justify-start">
                                <a href={`https://www.instagram.com/${profile.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                                    <ExternalLink size={16} /> View on Instagram
                                </a>
                                <a href={`https://www.instagram.com/${profile.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                                    @{profile.username}
                                </a>
                            </div>
                        </div>

                     
                        <div className="flex flex-row md:flex-col justify-around md:justify-center gap-4">
                            <TopStatCard label="Posts" value={profile.postsCount.toLocaleString()} />
                            <TopStatCard label="Followers" value={profile.followers.toLocaleString()} />
                            <TopStatCard label="Following" value={profile.following.toLocaleString()} />
                        </div>
                    </div>

                   
                    {stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            <AnalyticsStat label="Engagement Rate" value={`${stats.engagementRate}%`} icon={<TrendingUp size={20} className="text-blue-400"/>} colorClassName="text-blue-400" />
                            <AnalyticsStat label="Avg. Likes" value={stats.averageLikes.toFixed(0)} icon={<Heart size={20} className="text-green-400"/>} colorClassName="text-green-400" />
                            <AnalyticsStat label="Avg. Comments" value={stats.averageComments.toFixed(1)} icon={<MessageCircle size={20} className="text-orange-400"/>} colorClassName="text-orange-400" />
                            <AnalyticsStat label="Sample Size" value={`${recentPosts?.length || 0} posts`} icon={<FileText size={20} className="text-zinc-400"/>} colorClassName="text-white" />
                        </div>
                    )}
                </section>
                
             
                {audienceDemographics && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-white"> AI Audience Demographics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {audienceDemographics.genderSplit?.length > 0 && <DemographicsChart title="Gender Split" data={audienceDemographics.genderSplit} />}
                           {audienceDemographics.ageGroups?.length > 0 && <DemographicsChart title="Age Groups" data={audienceDemographics.ageGroups} />}
                            {audienceDemographics.topGeographies && audienceDemographics.topGeographies.length > 0 && (
                                <div className="bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-800 h-80 flex flex-col transition-all hover:shadow-2xl hover:border-zinc-700">
                                    <h3 className="font-bold text-lg mb-4 text-white">Top Geographies</h3>
                                    <ul className="space-y-3 overflow-y-auto">
                                        {audienceDemographics.topGeographies.map((geo: Geography) => (
                                            <li key={geo.name} className="flex justify-between items-center text-zinc-400 transition-all hover:text-blue-400">
                                                <span className="font-medium">{geo.name}</span>
                                                <span className="font-bold text-blue-400">{geo.value}%</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {recentPosts && recentPosts.length > 0 && (
                     <div>
                        <h2 className="text-2xl font-bold mb-4 text-white">📸 Recent Posts</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {recentPosts.map((post: any, index: number) => (
                                <PostCard 
                                    key={post.id || index} 
                                    post={post}
                                    onClick={() => setSelectedPost(post)}
                                />
                            ))}
                        </div>
                    </div>
                )}

              
                {selectedPost && (
                    <PostModal 
                        post={selectedPost} 
                        onClose={() => setSelectedPost(null)}
                        username={profile.username}
                    />
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </div>
        </Layout>
    );
}

export default ProfilePage;