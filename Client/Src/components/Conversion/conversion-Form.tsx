import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, Cog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "./file-upload";
import IconUpload from "./icon-upload";
import ScreenshotCapture from "./screenshot-capture";

export default function ConversionForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [appName, setAppName] = useState("");
  const [appMode, setAppMode] = useState<"online" | "offline">("online");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const createApkMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/apks", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to create APK");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "APK Creation Started!",
        description: "Your APK is being generated. You can track progress in your dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apks"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create APK",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAppName("");
    setWebsiteUrl("");
    setSelectedFile(null);
    setIconFile(null);
    setScreenshots([]);
    setAppMode("online");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to convert websites to APKs.",
        variant: "destructive",
      });
      return;
    }

    if (!appName.trim()) {
      toast({
        title: "App Name Required",
        description: "Please enter a name for your app.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "upload" && !selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a ZIP file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "url" && !websiteUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", appName);
    formData.append("mode", appMode);
    
    if (activeTab === "upload" && selectedFile) {
      formData.append("file", selectedFile);
    } else if (activeTab === "url") {
      formData.append("originalUrl", websiteUrl);
    }
    
    if (iconFile) {
      formData.append("icon", iconFile);
    }
    
    if (screenshots.length > 0) {
      formData.append("screenshots", JSON.stringify(screenshots));
    }

    createApkMutation.mutate(formData);
  };

  return (
    <Card className="bg-surface rounded-2xl material-shadow-2 p-8 max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "url")}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload size={16} />
            <span>Upload ZIP File</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center space-x-2">
            <LinkIcon size={16} />
            <span>Enter URL</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TabsContent value="upload" className="space-y-6">
            <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
          </TabsContent>

          <TabsContent value="url" className="space-y-6">
            <div>
              <Label htmlFor="websiteUrl" className="block text-sm font-medium coto-text-primary mb-2">
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>
          </TabsContent>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="appName" className="block text-sm font-medium coto-text-primary mb-2">
                App Name
              </Label>
              <Input
                id="appName"
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="My Awesome App"
                className="w-full"
                required
              />
            </div>
            <div>
              <Label htmlFor="appMode" className="block text-sm font-medium coto-text-primary mb-2">
                APK Mode
              </Label>
              <Select value={appMode} onValueChange={(value: "online" | "offline") => setAppMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Mode</SelectItem>
                  <SelectItem value="offline">Offline Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <IconUpload onIconSelect={setIconFile} selectedIcon={iconFile} />

          <ScreenshotCapture 
            onScreenshotCapture={setScreenshots} 
            capturedScreenshots={screenshots} 
          />

          <Button 
            type="submit" 
            className="w-full coto-bg-primary hover:bg-blue-700 text-white py-4 text-lg font-semibold material-shadow-1"
            disabled={createApkMutation.isPending}
          >
            {createApkMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Converting...
              </>
            ) : (
              <>
                <Cog className="mr-2" size={20} />
                Convert to APK
              </>
            )}
          </Button>
        </form>
      </Tabs>
    </Card>
  );
}
