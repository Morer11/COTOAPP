import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ConversionForm from "@/components/conversion/conversion-form";
import AdBanner from "@/components/ads/ad-banner";
import { Card } from "@/components/ui/card";
import { Smartphone, Zap, Palette, Shield, Download, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <main className="min-h-screen">
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold coto-text-primary mb-6">
              Convert Websites to{" "}
              <span className="coto-primary">Android APKs</span>
            </h1>
            <p className="text-xl coto-text-secondary mb-12 max-w-2xl mx-auto">
              Transform any website into a functional Android app in minutes. Upload your files or enter a URL to get started.
            </p>

            <ConversionForm />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold coto-text-primary mb-4">Powerful Features</h2>
              <p className="text-xl coto-text-secondary max-w-2xl mx-auto">
                Everything you need to convert websites into professional Android applications
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 material-shadow-1 hover:material-shadow-2 transition-shadow">
                <div className="w-12 h-12 coto-bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Zap className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold coto-text-primary mb-3">Fast Conversion</h3>
                <p className="coto-text-secondary">
                  Convert websites to APKs in minutes with our optimized processing engine.
                </p>
              </Card>

              <Card className="p-6 material-shadow-1 hover:material-shadow-2 transition-shadow">
                <div className="w-12 h-12 coto-bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <Palette className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold coto-text-primary mb-3">Customization</h3>
                <p className="coto-text-secondary">
                  Add custom app names, icons, and configure online/offline modes.
                </p>
              </Card>

              <Card className="p-6 material-shadow-1 hover:material-shadow-2 transition-shadow">
                <div className="w-12 h-12 coto-bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold coto-text-primary mb-3">Secure & Reliable</h3>
                <p className="coto-text-secondary">
                  Built with security in mind, ensuring your data and apps are protected.
                </p>
              </Card>

              <Card className="p-6 material-shadow-1 hover:material-shadow-2 transition-shadow">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Download className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold coto-text-primary mb-3">Easy Download</h3>
                <p className="coto-text-secondary">
                  Download and share your converted APKs instantly with direct download links.
                </p>
              </Card>

              <Card className="p-6 material-shadow-1 hover:material-shadow-2 transition-shadow">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold coto-text-primary mb-3">Analytics Dashboard</h3>
                <p className="coto-text-secondary">
                  Track your app performance and user engagement with detailed analytics.
                </p>
              </Card>

              <Card className="p-6 material-shadow-1 hover:material-shadow-2 transition-shadow">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold coto-text-primary mb-3">Admin Control</h3>
                <p className="coto-text-secondary">
                  Comprehensive admin panel for managing users, APKs, and system settings.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Ad Section */}
        <AdBanner placement="content" />
      </main>

      <Footer />
    </div>
  );
}
