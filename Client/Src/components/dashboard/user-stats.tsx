import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Smartphone, Download, Activity, Star } from "lucide-react";

export default function UserStats() {
  const { data: apks = [] } = useQuery({
    queryKey: ["/api/apks"],
  });

  const totalApks = apks.length;
  const totalDownloads = apks.reduce((sum: number, apk: any) => sum + (apk.downloadCount || 0), 0);
  const activeApks = apks.filter((apk: any) => apk.status === "completed").length;
  const avgRating = 4.8; // Static for now

  const stats = [
    {
      title: "Total APKs",
      value: totalApks,
      icon: Smartphone,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Downloads",
      value: totalDownloads,
      icon: Download,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Active APKs",
      value: activeApks,
      icon: Activity,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Avg Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} rounded-xl p-6 text-center material-shadow-1`}>
          <div className={`text-3xl font-bold ${stat.iconColor} mb-2`}>
            {stat.value}
          </div>
          <div className="coto-text-secondary">{stat.title}</div>
        </Card>
      ))}
    </div>
  );
}
