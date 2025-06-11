import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Smartphone, Download, DollarSign, UserPlus, Database, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminOverview() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: allApks = [] } = useQuery({
    queryKey: ["/api/admin/apks"],
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  if (statsLoading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="coto-text-secondary">Loading admin overview...</p>
        </div>
      </Card>
    );
  }

  // Generate recent activity from APKs and users
  const recentActivity = [
    ...allUsers.slice(-3).map((user: any) => ({
      id: `user-${user.id}`,
      description: `New user registered: ${user.email}`,
      timestamp: user.createdAt,
      type: "user",
    })),
    ...allApks.slice(-3).map((apk: any) => ({
      id: `apk-${apk.id}`,
      description: `APK generated: ${apk.name}`,
      timestamp: apk.createdAt,
      type: "apk",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const overviewStats = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      growth: "+12% this month",
    },
    {
      title: "Total APKs",
      value: stats?.totalApks || 0,
      icon: Smartphone,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      growth: "+8% this month",
    },
    {
      title: "Downloads",
      value: stats?.totalDownloads || 0,
      icon: Download,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      growth: "+24% this month",
    },
    {
      title: "Ad Revenue",
      value: `$${stats?.adRevenue || 0}`,
      icon: DollarSign,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      growth: "+15% this month",
    },
  ];

  return (
    <Card className="material-shadow-1 p-8">
      {/* Admin Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-xl p-6 text-center`}>
              <div className={`text-3xl font-bold ${stat.iconColor} mb-2`}>
                {stat.value}
              </div>
              <div className="coto-text-secondary">{stat.title}</div>
              <div className="text-sm text-green-600 mt-1">{stat.growth}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold coto-text-primary mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 coto-bg-primary rounded-full flex items-center justify-center">
                  {activity.type === "user" ? (
                    <Users className="text-white" size={16} />
                  ) : (
                    <Smartphone className="text-white" size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium coto-text-primary">{activity.description}</div>
                  <div className="text-sm coto-text-secondary">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="coto-text-secondary">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold coto-text-primary mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button className="flex items-center space-x-3 p-4 coto-bg-primary text-white hover:bg-blue-700 h-auto">
            <UserPlus size={20} />
            <span>Add User</span>
          </Button>
          
          <Button className="flex items-center space-x-3 p-4 coto-bg-secondary text-white hover:bg-green-700 h-auto">
            <Database size={20} />
            <span>Backup System</span>
          </Button>
          
          <Button className="flex items-center space-x-3 p-4 coto-bg-accent text-white hover:bg-orange-700 h-auto">
            <FileText size={20} />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
