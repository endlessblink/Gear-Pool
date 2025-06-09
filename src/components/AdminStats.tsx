
import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface AdminStatsProps {
  stats: Stat[];
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStats;
