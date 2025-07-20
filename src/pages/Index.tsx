
import { useState, useEffect } from "react";
import { Shield, Terminal, Code, Lock, Eye, Zap, ChevronDown, Github, Linkedin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import SkillsSection from "@/components/SkillsSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const textArray = ["Ethical Hacker", "Penetration Tester", "Security Consultant", "Cyber Guardian"];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % textArray.length;
      const fullText = textArray[i];

      setCurrentText(
        isDeleting
          ? fullText.substring(0, currentText.length - 1)
          : fullText.substring(0, currentText.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 500);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum, typingSpeed, textArray]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-green-400">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-green-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">CyberGuardian</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="hover:text-green-300 transition-colors">Home</a>
              <a href="#services" className="hover:text-green-300 transition-colors">Services</a>
              <a href="#skills" className="hover:text-green-300 transition-colors">Skills</a>
              <a href="#contact" className="hover:text-green-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-blue-900/10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-block p-4 border border-green-500/30 rounded-lg bg-black/40 backdrop-blur-sm mb-6">
                <Terminal className="h-12 w-12 text-green-400 mx-auto" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                I'm a <span className="text-green-400">{currentText}</span>
                <span className="animate-pulse">|</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Protecting digital assets through ethical penetration testing and security consulting
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-black font-semibold">
                <Lock className="mr-2 h-5 w-5" />
                View My Work
              </Button>
              <Button size="lg" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                <Mail className="mr-2 h-5 w-5" />
                Get In Touch
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Eye className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Penetration Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Comprehensive security assessments to identify vulnerabilities</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Security Consulting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Expert guidance on cybersecurity best practices and strategies</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <CardTitle className="text-white">Incident Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">Rapid response and forensic analysis for security breaches</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-green-400" />
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Skills Section */}
      <SkillsSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="bg-black border-t border-green-500/20 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-green-400" />
              <span className="text-white font-semibold">CyberGuardian</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-green-500/20 text-center text-gray-400">
            <p>&copy; 2024 CyberGuardian. All rights reserved. Securing the digital world, one system at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
