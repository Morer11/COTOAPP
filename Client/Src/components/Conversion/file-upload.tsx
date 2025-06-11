import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      const file = files[0];
      
      if (!file.name.endsWith('.zip')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a ZIP file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }
      
      onFileSelect(file);
    }
  }, [onFileSelect, toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a ZIP file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }
      
      onFileSelect(file);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  return (
    <div className="space-y-4">
      {selectedFile ? (
        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="text-green-600" size={24} />
              <div>
                <p className="font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-green-600 hover:text-green-800"
            >
              <X size={16} />
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <div className="text-center">
            <CloudUpload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-lg font-medium coto-text-primary mb-2">Drop your ZIP file here</p>
            <p className="coto-text-secondary mb-4">or click to browse files</p>
            <Button type="button" variant="secondary">
              Choose File
            </Button>
          </div>
        </Card>
      )}
      
      <input
        id="file-input"
        type="file"
        accept=".zip"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
