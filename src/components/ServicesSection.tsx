
import { Shield, Search, Bug, AlertTriangle, Lock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServicesSection = () => {
  const services = [
    {
      icon: Search,
      title: "Vulnerability Assessment",
      description: "Comprehensive scanning and analysis of your systems to identify security weaknesses and potential entry points.",
      features: ["Network Scanning", "Web Application Testing", "Database Security", "Wireless Security"]
    },
    {
      icon: Bug,
      title: "Penetration Testing",
      description: "Simulated cyber attacks to test your defenses and provide detailed reports on security gaps.",
      features: ["External Testing", "Internal Testing", "Social Engineering", "Physical Security"]
    },
    {
      icon: AlertTriangle,
      title: "Incident Response",
      description: "Rapid response services for security breaches with forensic analysis and damage assessment.",
      features: ["Breach Investigation", "Malware Analysis", "Evidence Collection", "Recovery Planning"]
    },
    {
      icon: Lock,
      title: "Security Consulting",
      description: "Strategic security guidance and policy development to strengthen your overall security posture.",
      features: ["Risk Assessment", "Compliance Auditing", "Security Training", "Policy Development"]
    },
    {
      icon: Shield,
      title: "Red Team Operations",
      description: "Advanced persistent threat simulation to test your organization's detection and response capabilities.",
      features: ["Advanced Tactics", "Stealth Operations", "Custom Payloads", "Full Kill Chain"]
    },
    {
      icon: Zap,
      title: "Security Automation",
      description: "Implementation of automated security tools and continuous monitoring solutions.",
      features: ["SIEM Setup", "Automated Scanning", "Threat Intelligence", "Custom Scripts"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Security <span className="text-green-400">Services</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive cybersecurity solutions to protect your digital assets and ensure your organization's resilience against threats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-black/40 border-green-500/30 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <service.icon className="h-8 w-8 text-green-400" />
                  </div>
                  <CardTitle className="text-white text-xl">{service.title}</CardTitle>
                </div>
                <p className="text-gray-400">{service.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
