import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  Smartphone, 
  TrendingUp, 
  Settings,
  Monitor
} from "lucide-react";

interface AdminSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function AdminSidebar({ activeSection = "overview", onSectionChange }: AdminSidebarProps) {
  const [active, setActive] = useState(activeSection);

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "apks", label: "APKs", icon: Smartphone },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "ads", label: "Ad Management", icon: Monitor },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSectionClick = (sectionId: string) => {
    setActive(sectionId);
    onSectionChange?.(sectionId);
  };

  return (
    <Card className="material-shadow-1 p-6">
      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = active === section.id;
          
          return (
            <Button
              key={section.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start space-x-3 ${
                isActive 
                  ? "coto-bg-primary text-white" 
                  : "coto-text-secondary hover:coto-text-primary hover:bg-gray-50"
              }`}
              onClick={() => handleSectionClick(section.id)}
            >
              <Icon size={16} />
              <span>{section.label}</span>
            </Button>
          );
        })}
      </nav>
    </Card>
  );
}
