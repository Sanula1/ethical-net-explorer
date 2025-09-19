import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, MessageCircle, Users, Sparkles } from "lucide-react";
import ModernNavigation from "./ModernNavigation";
import { useState } from "react";
import LMSCharacter from "./LMSCharacter";
import SecurityElement from "./SecurityElement";
import WhiteboardSection from "./WhiteboardSection";
import TextToVideoSections from "./TextToVideoSections";
import CircularFeaturesSection from "./CircularFeaturesSection";
import MessagingAppsSection from "./MessagingAppsSection";
import WebsitePreviewSection from "./WebsitePreviewSection";
import AwardsSection from "./AwardsSection";
import Footer from "./Footer";
import SmartNFCSection from "./SmartNFCSection";
import PartnersSection from "./PartnersSection";
const LMSHomepage = () => {
  const [isTransformed, setIsTransformed] = useState(false);
  const handleLMSClick = () => {
    setIsTransformed(true);
    // Reset after animation completes
    setTimeout(() => setIsTransformed(false), 4000);
  };
  return <>
      {/* Modern Navigation */}
      <ModernNavigation />
      
      {/* Main LMS Homepage Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50/30 to-white relative overflow-hidden pt-24">
        {/* Sri Lankan Flag Accent */}
        <div className="absolute top-4 right-4 w-8 h-6 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-sm opacity-70 z-20 shadow-lg"></div>
        
        {/* Floating Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => <div key={i} className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-pulse" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
          transform: `scale(${0.5 + Math.random() * 1.5})`
        }} />)}
        </div>

        {/* Geometric Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-blue-400/30 rounded-full animate-spin" style={{
          animationDuration: '20s'
        }}></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-blue-400/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 border border-blue-500/50 rotate-45 animate-bounce" style={{
          animationDuration: '3s'
        }}></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-blue-400/40 rounded-full animate-ping" style={{
          animationDuration: '4s'
        }}></div>
        </div>


        {/* Blue Characters Moving Toward LMS */}
        <LMSCharacter type="student" color="blue" position="top-left" isMovingToward={!isTransformed} />
        <LMSCharacter type="teacher" color="blue" position="top-right" isMovingToward={!isTransformed} />
        <LMSCharacter type="institute" color="blue" position="top-center" isMovingToward={!isTransformed} />

        {/* Central LMS Portal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          {/* Mission Statement */}
          <div className="text-center mb-8 z-10">
            <img alt="SurakshaLMS" className="h-16 md:h-24 w-auto mb-4 animate-fade-in" src="/lovable-uploads/6678135b-8997-4d89-82a1-badde05b90d8.png" />
            <h2 style={{
            animationDelay: '0.5s'
          }} className="text-2xl font-semibold bg-gradient-to-r from-primary-dark to-primary bg-clip-text text-transparent mb-2 animate-fade-in md:text-2xl">One LMS. One Nation. One Future</h2>
            
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto animate-fade-in" style={{
            animationDelay: '1.5s'
          }}>
            </p>
          </div>

          <div className="relative">
            {/* Security Elements */}
            <SecurityElement position="top" />
            <SecurityElement position="right" />
            <SecurityElement position="bottom" />
            <SecurityElement position="left" />
            
            {/* Main LMS Button */}
            <div className="relative mb-8">
              <Button size="lg" onClick={handleLMSClick} className="
                  px-12 py-6 md:px-16 md:py-8 text-2xl md:text-4xl font-bold rounded-3xl
                  bg-primary hover:bg-primary-dark
                  text-primary-foreground
                  lms-glow
                  transform hover:scale-105 transition-all duration-300
                  shadow-2xl
                  border-4 border-primary-light/50
                  animate-fade-in
                " style={{
              animationDelay: '2s'
            }}>
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                LMS LOGIN
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 ml-3" />
              </Button>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl -z-10 animate-pulse"></div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{
            animationDelay: '2.5s'
          }}>
              
            </div>
          </div>
        </div>

        {/* Evolution Characters Moving Away from LMS */}
        <LMSCharacter type="student" color="evolution" position="bottom-left" isMovingToward={isTransformed} />
        <LMSCharacter type="teacher" color="evolution" position="bottom-right" isMovingToward={isTransformed} />
        <LMSCharacter type="institute" color="evolution" position="bottom-center" isMovingToward={isTransformed} />

        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--lms-blue))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--lms-blue))" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="evolutionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--evolution-dark))" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(var(--evolution-dark))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Lines from top corners to center */}
          <line x1="10%" y1="20%" x2="50%" y2="50%" stroke="url(#blueGradient)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="90%" y1="20%" x2="50%" y2="50%" stroke="url(#blueGradient)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
          </line>
          
          {/* Lines from center to bottom corners */}
          <line x1="50%" y1="50%" x2="10%" y2="80%" stroke="url(#evolutionGradient)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="50%" y1="50%" x2="90%" y2="80%" stroke="url(#evolutionGradient)" strokeWidth="2" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;-10" dur="2s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Floating Chatbot */}
        

        {/* Footer Stats */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-8 text-xs text-muted-foreground opacity-60">
          <div className="text-center">
            <div className="font-semibold text-blue-600">10K+</div>
            <div>Students</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">500+</div>
            <div>Teachers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">50+</div>
            <div>Institutes</div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <PartnersSection />

      {/* Whiteboard Animation Section */}
      <WhiteboardSection />

      {/* Circular Features Section */}
      <CircularFeaturesSection />

      {/* Text to Video Sections */}
      <TextToVideoSections />

      {/* Smart NFC ID Section */}
      <SmartNFCSection />

      {/* Messaging Apps Section */}
      <MessagingAppsSection />

      {/* Awards Section */}
      <AwardsSection />

      {/* Website Preview Section */}
      <WebsitePreviewSection />

      {/* Footer */}
      <Footer />
    </>;
};
export default LMSHomepage;