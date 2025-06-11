import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminOverview from "@/components/admin/admin-overview";
import UserManagement from "@/components/admin/user-management";
import ApkManagement from "@/components/admin/apk-management";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="coto-text-secondary">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <UserManagement />;
      case "apks":
        return <ApkManagement />;
      case "analytics":
        return <AdminOverview />; // Placeholder for now
      case "ads":
        return <AdminOverview />; // Placeholder for now
      case "settings":
        return <AdminOverview />; // Placeholder for now
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold coto-text-primary mb-4">Admin Panel</h1>
            <p className="text-xl coto-text-secondary">
              Comprehensive management interface for administrators
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <AdminSidebar 
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
            </div>
            
            <div className="lg:col-span-3">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
