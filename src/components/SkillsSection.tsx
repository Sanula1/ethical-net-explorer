
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const SkillsSection = () => {
  const skillCategories = [
    {
      title: "Penetration Testing Tools",
      skills: [
        { name: "Metasploit", level: 95 },
        { name: "Nmap", level: 98 },
        { name: "Burp Suite", level: 92 },
        { name: "OWASP ZAP", level: 88 },
        { name: "SQLMap", level: 90 },
        { name: "Wireshark", level: 85 }
      ]
    },
    {
      title: "Programming Languages",
      skills: [
        { name: "Python", level: 95 },
        { name: "Bash/Shell", level: 92 },
        { name: "PowerShell", level: 88 },
        { name: "JavaScript", level: 85 },
        { name: "C/C++", level: 78 },
        { name: "Go", level: 75 }
      ]
    },
    {
      title: "Operating Systems",
      skills: [
        { name: "Kali Linux", level: 98 },
        { name: "Windows", level: 90 },
        { name: "Ubuntu/Debian", level: 95 },
        { name: "CentOS/RHEL", level: 88 },
        { name: "macOS", level: 82 },
        { name: "FreeBSD", level: 75 }
      ]
    }
  ];

  const certifications = [
    "Certified Ethical Hacker (CEH)",
    "Offensive Security Certified Professional (OSCP)",
    "CISSP - Certified Information Systems Security Professional",
    "CompTIA Security+",
    "GIAC Penetration Tester (GPEN)",
    "Certified Information Security Manager (CISM)"
  ];

  const technologies = [
    "Metasploit", "Nmap", "Burp Suite", "OWASP ZAP", "SQLMap", "Wireshark",
    "Nessus", "OpenVAS", "Hydra", "John the Ripper", "Hashcat", "Aircrack-ng",
    "Social Engineer Toolkit", "BeEF", "Cobalt Strike", "Empire", "PowerSploit",
    "Mimikatz", "BloodHound", "Responder", "Impacket", "Volatility"
  ];

  return (
    <section id="skills" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Technical <span className="text-green-400">Expertise</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Proficient in cutting-edge cybersecurity tools, programming languages, and methodologies
          </p>
        </div>

        {/* Skills Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {skillCategories.map((category, index) => (
            <Card key={index} className="bg-black/40 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.skills.map((skill, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">{skill.name}</span>
                        <span className="text-green-400 text-sm">{skill.level}%</span>
                      </div>
                      <Progress 
                        value={skill.level} 
                        className="h-2 bg-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Professional Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, index) => (
              <Card key={index} className="bg-black/40 border-green-500/30 backdrop-blur-sm hover:bg-black/60 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold text-lg">✓</span>
                  </div>
                  <p className="text-white font-medium">{cert}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technologies & Tools */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Tools & Technologies</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {technologies.map((tech, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="border-green-500/30 text-green-400 hover:bg-green-500/20 transition-colors px-4 py-2 text-sm"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
