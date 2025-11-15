import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Users, DollarSign, FileCheck } from 'lucide-react';

interface DashboardStatsProps {
  totalDonations: number;
  totalAmount: string;
  totalNGOs: number;
  approvedNGOs: number;
}

export function DashboardStats({ totalDonations, totalAmount, totalNGOs, approvedNGOs }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Donations',
      value: totalDonations.toLocaleString(),
      icon: DollarSign,
      description: 'Lifetime donations made',
      color: 'text-blue-600',
    },
    {
      title: 'Total Amount',
      value: `${parseFloat(totalAmount).toFixed(4)} MATIC`,
      icon: TrendingUp,
      description: 'Total value donated',
      color: 'text-green-600',
    },
    {
      title: 'Registered NGOs',
      value: totalNGOs.toString(),
      icon: Users,
      description: 'Organizations registered',
      color: 'text-purple-600',
    },
    {
      title: 'Approved NGOs',
      value: approvedNGOs.toString(),
      icon: FileCheck,
      description: 'Verified organizations',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}