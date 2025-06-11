import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Download, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScreenshotCaptureProps {
  onScreenshotCapture: (screenshots: string[]) => void;
  capturedScreenshots: string[];
}

export default function ScreenshotCapture({ onScreenshotCapture, capturedScreenshots }: ScreenshotCaptureProps) {
  const { toast } = useToast();
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async () => {
    if (!screenshotUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to capture.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCapturing(true);
      
      const response = await fetch("/api/screenshots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: screenshotUrl }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to capture screenshot");
      }

      const data = await response.json();
      const newScreenshots = [...capturedScreenshots, data.screenshotUrl];
      onScreenshotCapture(newScreenshots);
      
      toast({
        title: "Screenshot Captured",
        description: "Screenshot has been successfully captured.",
      });
      
      setScreenshotUrl("");
    } catch (error) {
      toast({
        title: "Capture Failed",
        description: "Failed to capture screenshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const removeScreenshot = (index: number) => {
    const newScreenshots = capturedScreenshots.filter((_, i) => i !== index);
    onScreenshotCapture(newScreenshots);
  };

  const downloadScreenshot = (screenshotUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = screenshotUrl;
    link.download = `screenshot-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="screenshotUrl" className="block text-sm font-medium coto-text-primary mb-2">
          Capture Screenshots
        </Label>
        <p className="text-sm coto-text-secondary mb-4">
          Enter a website URL to capture screenshots for your APK preview
        </p>
      </div>

      <div className="flex space-x-2">
        <Input
          id="screenshotUrl"
          type="url"
          value={screenshotUrl}
          onChange={(e) => setScreenshotUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1"
          disabled={isCapturing}
        />
        <Button
          type="button"
          onClick={captureScreenshot}
          disabled={isCapturing || !screenshotUrl.trim()}
          className="coto-bg-primary text-white hover:bg-blue-700"
        >
          {isCapturing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </>
          )}
        </Button>
      </div>

      {capturedScreenshots.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium coto-text-primary">Captured Screenshots</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {capturedScreenshots.map((screenshot, index) => (
              <Card key={index} className="p-3">
                <div className="relative group">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadScreenshot(screenshot, index)}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScreenshot(index)}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
                <p className="text-xs coto-text-secondary mt-2 text-center">
                  Screenshot {index + 1}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}