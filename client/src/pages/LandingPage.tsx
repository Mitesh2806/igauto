import { Link } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react'; // Make sure you have @tabler/icons-react installed

function LandingPage() {
  return (
    // Main container with a subtle background effect
    <div className="relative flex flex-col h-screen w-full items-center justify-center overflow-hidden rounded-lg bg-background">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-black dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)]"></div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center p-4">
        
        {/* Main Headline */}
        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-7xl bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          Unlock Your Instagram's Potential
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Go beyond the surface. Scrape, analyze, and understand your profile's growth, 
          audience demographics, and post performance with AI-powered insights.
        </p>

        {/* Call-to-action Button */}
        <Link
          to="/auth"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Get Started
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;