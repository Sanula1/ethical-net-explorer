import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, User, UserCheck, Clock } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
const WebsitePreviewSection = () => {
  const [activeTab, setActiveTab] = useState("student");
  const isMobile = useIsMobile();
  const categories = [{
    id: "student",
    label: "Student",
    icon: GraduationCap
  }, {
    id: "teacher",
    label: "Teacher",
    icon: User
  }, {
    id: "parent",
    label: "Parent",
    icon: Users
  }, {
    id: "attendance",
    label: "Attendance Marker",
    icon: UserCheck
  }, {
    id: "admin",
    label: "Institute Admin",
    icon: Clock
  }];
  const roleDescriptions = {
    student: "Access personalized learning dashboards, track your progress, submit assignments, and collaborate with classmates in an intuitive digital environment designed for academic success.",
    teacher: "Manage classes efficiently with integrated tools for lesson planning, grading, attendance tracking, and student engagement through interactive whiteboards and multimedia content.",
    parent: "Stay connected with your child's educational journey through real-time progress reports, attendance notifications, communication with teachers, and involvement in learning activities.",
    attendance: "Streamline attendance management with automated tracking systems, generate detailed reports, monitor student participation, and maintain accurate records across all educational programs.",
    admin: "Oversee institutional operations with comprehensive management tools for staff coordination, student enrollment, academic scheduling, and performance analytics across the entire institute."
  };
  return <div className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12 lg:mb-16 max-w-4xl lg:max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 md:mb-6 lg:mb-8 leading-tight">
            Trusted by Educators Worldwide
          </h2>
          <p className="text-muted-foreground text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed">
            Comprehensive learning management system designed for every role in the education ecosystem
          </p>
        </div>

        <Tabs defaultValue="student" onValueChange={setActiveTab} className="w-full max-w-5xl md:max-w-7xl mx-auto">
          <div className="overflow-x-auto mb-4 md:mb-8">
            <TabsList className="flex w-full bg-muted/50 p-2 rounded-lg h-auto">
              {categories.map(category => <TabsTrigger key={category.id} value={category.id} className={`flex items-center justify-center gap-2 py-4 px-2 text-xs md:text-sm h-auto transition-all duration-300 ${
                  isMobile 
                    ? (activeTab === category.id ? 'flex-grow bg-primary text-primary-foreground' : 'flex-shrink-0 w-12') 
                    : 'flex-1'
                }`}>
                  <category.icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className={`leading-tight transition-all duration-300 ${
                    isMobile 
                      ? (activeTab === category.id ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden')
                      : 'opacity-100 block'
                  }`}>
                    {category.label}
                  </span>
                </TabsTrigger>)}
            </TabsList>
          </div>
          
          {/* Mobile active tab label */}
          <div className="sm:hidden text-center mb-6">
            
          </div>

          {Object.entries(roleDescriptions).map(([key, description]) => <TabsContent key={key} value={key} className="space-y-6 md:space-y-8">
              <div className="text-center max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12 xl:p-16 border border-primary/20">
                  <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-foreground leading-relaxed font-medium">
                    {description}
                  </p>
                </div>
              </div>
            </TabsContent>)}
        </Tabs>
      </div>
    </div>;
};
export default WebsitePreviewSection;