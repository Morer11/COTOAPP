import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IconUploadProps {
  onIconSelect: (file: File | null) => void;
  selectedIcon: File | null;
}

export default function IconUpload({ onIconSelect, selectedIcon }: IconUploadProps) {
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, JPEG, SVG).",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      onIconSelect(file);
    }
  }, [onIconSelect, toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, JPEG, SVG).",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      onIconSelect(file);
    }
  };

  const removeIcon = () => {
    onIconSelect(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium coto-text-primary mb-2">
          App Icon (Optional)
        </label>
        <p className="text-sm coto-text-secondary mb-4">
          Upload a custom icon for your APK. Recommended size: 512x512px
        </p>
      </div>
      
      {selectedIcon ? (
        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                <img 
                  src={URL.createObjectURL(selectedIcon)} 
                  alt="App Icon Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-green-800">{selectedIcon.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedIcon.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeIcon}
              className="text-green-600 hover:text-green-800"
            >
              <X size={16} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-primary transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('icon-input')?.click()}
        >
          <div className="text-center">
            <Image className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="font-medium coto-text-primary mb-2">Drop your icon here</p>
            <p className="text-sm coto-text-secondary mb-3">or click to browse files</p>
            <Button type="button" variant="secondary" size="sm">
              Choose Icon
            </Button>
          </div>
        </Card>
      )}
      
      <input
        id="icon-input"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}