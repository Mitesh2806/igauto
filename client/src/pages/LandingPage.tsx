import { useState, useEffect } from 'react';
import { Instagram, TrendingUp, Users, BarChart3, Sparkles, ArrowRight, Check } from 'lucide-react';

// Mock Link component - replace with actual react-router-dom Link in your app
const Link = ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
  <a href={to} className={className} onClick={(e) => { e.preventDefault(); window.location.href = to; }}>
    {children}
  </a>
);

function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Instagram className="w-6 h-6" />,
      title: "Profile Analytics",
      description: "Deep dive into your Instagram profile metrics and growth patterns"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Audience Insights",
      description: "Understand your followers' demographics and engagement behavior"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Post Performance",
      description: "Track likes, comments, and engagement rates across all posts"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Get intelligent recommendations to boost your content strategy"
    }
  ];

  const stats = [
    { value: "10K+", label: "Profiles Analyzed" },
    { value: "500K+", label: "Posts Tracked" },
    { value: "99.9%", label: "Accuracy Rate" }
  ];

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient Orbs */}
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
        style={{
          transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Instagram className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">InstaAnalytics</span>
        </div>
        <Link
          to="/auth"
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/10"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-zinc-300">AI-Powered Instagram Analytics</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="block bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Unlock Your
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instagram Potential
            </span>
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-xl text-zinc-400 leading-relaxed">
            Transform raw data into actionable insights. Analyze your profile, understand your audience, and optimize your content strategy with cutting-edge AI technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/auth"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/10">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="text-blue-400">grow</span>
          </h2>
          <p className="text-zinc-400 text-lg">Powerful features to supercharge your Instagram strategy</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-zinc-900/50 hover:bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all backdrop-blur-sm"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-3xl p-12 border border-zinc-800 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why choose <span className="text-blue-400">InstaAnalytics</span>?
              </h2>
              <div className="space-y-4">
                {[
                  "Real-time data synchronization",
                  "Advanced AI-powered recommendations",
                  "Beautiful, intuitive dashboard",
                  "Export reports in multiple formats",
                  "24/7 customer support"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-zinc-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-zinc-800 flex items-center justify-center">
                <TrendingUp className="w-24 h-24 text-blue-400" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl p-12 border border-zinc-800 backdrop-blur-sm">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to grow your Instagram?
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Join thousands of creators and brands using InstaAnalytics
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Instagram className="w-5 h-5" />
              </div>
              <span className="font-bold">InstaAnalytics</span>
            </div>
            <p className="text-zinc-500 text-sm">© 2024 InstaAnalytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;