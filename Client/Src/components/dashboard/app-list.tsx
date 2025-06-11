import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Smartphone, Download, Share, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function ApkList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apks = [], isLoading } = useQuery({
    queryKey: ["/api/apks"],
  });

  const deleteApkMutation = useMutation({
    mutationFn: async (apkId: number) => {
      await apiRequest("DELETE", `/api/apks/${apkId}`);
    },
    onSuccess: () => {
      toast({
        title: "APK Deleted",
        description: "The APK has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete APK.",
        variant: "destructive",
      });
    },
  });

  const downloadApkMutation = useMutation({
    mutationFn: async (apkId: number) => {
      const response = await apiRequest("POST", `/api/apks/${apkId}/download`);
      return response.json();
    },
    onSuccess: (data) => {
      // In a real app, you would trigger the download here
      toast({
        title: "Download Ready",
        description: "Your APK download has started.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/apks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download APK.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="coto-bg-success text-white">Active</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500 text-white">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="coto-text-secondary">Loading your APKs...</p>
        </div>
      </Card>
    );
  }

  if (apks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold coto-text-primary mb-2">No APKs Yet</h3>
        <p className="coto-text-secondary">
          Start by converting your first website to an APK using the form above.
        </p>
      </Card>
    );
  }

  return (
    <Card className="material-shadow-1">
      <div className="p-6">
        <h3 className="text-xl font-semibold coto-text-primary mb-4">Your APKs</h3>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apks.map((apk: any) => (
                <TableRow key={apk.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 coto-bg-primary rounded-lg flex items-center justify-center">
                        <Smartphone className="text-white" size={16} />
                      </div>
                      <div>
                        <div className="font-medium coto-text-primary">{apk.name}</div>
                        <div className="text-sm coto-text-secondary">{apk.size || "Processing..."}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(apk.status)}
                  </TableCell>
                  <TableCell className="coto-text-primary">
                    {apk.downloadCount || 0}
                  </TableCell>
                  <TableCell className="coto-text-secondary">
                    {formatDistanceToNow(new Date(apk.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {apk.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadApkMutation.mutate(apk.id)}
                          disabled={downloadApkMutation.isPending}
                          className="coto-primary hover:text-blue-700"
                        >
                          <Download size={16} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="coto-text-secondary hover:coto-text-primary"
                      >
                        <Share size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApkMutation.mutate(apk.id)}
                        disabled={deleteApkMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
