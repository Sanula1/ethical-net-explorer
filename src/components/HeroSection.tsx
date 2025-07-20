
import { useState, useEffect } from "react";
import { Terminal, Shield, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [code, setCode] = useState("");
  const codeSnippet = `#!/bin/bash
# Ethical Hacking Toolkit
nmap -sS -O target.com
sqlmap -u "http://target.com?id=1"
hydra -l admin -P passwords.txt ssh://target.com
`;

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < codeSnippet.length) {
        setCode(codeSnippet.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent"></div>
      <div className="relative z-10">
        <div className="mb-8">
          <div className="bg-black/60 p-6 rounded-lg border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Terminal className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-mono">terminal@cyberguardian:~$</span>
            </div>
            <pre className="text-green-300 font-mono text-sm whitespace-pre-wrap">
              {code}<span className="animate-pulse">█</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
