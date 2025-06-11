import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import UserStats from "@/components/dashboard/user-stats";
import ApkList from "@/components/dashboard/apk-list";
import AdBanner from "@/components/ads/ad-banner";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="coto-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold coto-text-primary mb-4">
              Welcome back, {user.username}!
            </h1>
            <p className="text-xl coto-text-secondary">
              Manage your converted APKs and track their performance
            </p>
          </div>

          <UserStats />
          
          <div className="mt-8">
            <ApkList />
          </div>

          <div className="mt-8">
            <AdBanner placement="sidebar" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
