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
import { Smartphone, Download, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function ApkManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apks = [], isLoading } = useQuery({
    queryKey: ["/api/admin/apks"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apks"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete APK.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="coto-bg-success text-white">Completed</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500 text-white">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? user.username : "Unknown";
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="coto-text-secondary">Loading APKs...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="material-shadow-1">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold coto-text-primary">APK Management</h3>
          <div className="flex space-x-2">
            <Button variant="outline">Export Data</Button>
            <Button className="coto-bg-primary text-white hover:bg-blue-700">
              Bulk Actions
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App Name</TableHead>
                <TableHead>User</TableHead>
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
                  <TableCell className="coto-text-primary">
                    {getUserName(apk.userId)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(apk.status)}
                  </TableCell>
                  <TableCell className="coto-text-primary">
                    <div className="flex items-center space-x-1">
                      <Download size={14} className="coto-text-secondary" />
                      <span>{apk.downloadCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="coto-text-secondary">
                    {formatDistanceToNow(new Date(apk.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="coto-primary hover:text-blue-700"
                      >
                        <Edit size={16} />
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
