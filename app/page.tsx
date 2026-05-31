'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { TrustSection } from '@/components/trust-section';
import { ProblemSection, SolutionSection } from '@/components/problem-solution-sections';
import { FeaturesSection } from '@/components/features-section';
import { PlatformShowcase } from '@/components/platform-showcase';
import { HowItWorksSection, ArchitectureSection } from '@/components/how-works-architecture';
import { AICopilotSection } from '@/components/ai-copilot';
import { FinalCTASection, Footer } from '@/components/final-cta-footer';
import { LoginModal } from '@/components/login-modal';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      
      {/* Hero */}
      <HeroSection />
      
      {/* Trust Indicators */}
      <TrustSection />
      
      {/* Problem Section */}
      <ProblemSection />
      
      {/* Solution Section */}
      <SolutionSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* Platform Showcase */}
      <PlatformShowcase />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Architecture */}
      <ArchitectureSection />
      
      {/* AI Copilot */}
      <AICopilotSection />
      
      {/* Final CTA */}
      <FinalCTASection />
      
      {/* Footer */}
      <Footer />
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </main>
  );
}
