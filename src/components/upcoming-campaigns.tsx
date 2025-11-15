import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Calendar, Target, Users, MapPin } from 'lucide-react';

interface Campaign {
  id: number;
  title: string;
  ngo: string;
  location: string;
  category: string;
  goal: number;
  raised: number;
  supporters: number;
  endDate: Date;
  status: 'active' | 'upcoming' | 'completed';
}

// Mock campaigns data - India focused, food donations
const mockCampaigns: Campaign[] = [
  {
    id: 1,
    title: 'Mid-Day Meals for Delhi Schools',
    ngo: 'Akshaya Patra Foundation',
    location: 'New Delhi, Delhi',
    category: 'Food & Nutrition',
    goal: 5.0,
    raised: 3.2,
    supporters: 45,
    endDate: new Date('2025-11-30'),
    status: 'active',
  },
  {
    id: 2,
    title: 'Emergency Food Relief - Maharashtra Floods',
    ngo: 'Save the Children India',
    location: 'Mumbai, Maharashtra',
    category: 'Emergency Relief',
    goal: 8.0,
    raised: 5.6,
    supporters: 72,
    endDate: new Date('2025-11-15'),
    status: 'active',
  },
  {
    id: 3,
    title: 'Community Kitchen for Elderly - Kolkata',
    ngo: 'HelpAge India',
    location: 'Kolkata, West Bengal',
    category: 'Food Security',
    goal: 3.5,
    raised: 2.1,
    supporters: 28,
    endDate: new Date('2025-12-15'),
    status: 'active',
  },
  {
    id: 4,
    title: 'Nutrition Support for Tribal Children',
    ngo: 'CRY - Child Rights and You',
    location: 'Ranchi, Jharkhand',
    category: 'Child Nutrition',
    goal: 4.0,
    raised: 1.8,
    supporters: 31,
    endDate: new Date('2025-12-20'),
    status: 'upcoming',
  },
];

export function UpcomingCampaigns() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (date: Date) => {
    const today = new Date();
    const diff = date.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Campaigns
          </span>
          <Badge variant="secondary">{mockCampaigns.length} campaigns</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockCampaigns.map((campaign) => {
            const progress = (campaign.raised / campaign.goal) * 100;
            const daysRemaining = getDaysRemaining(campaign.endDate);

            return (
              <div
                key={campaign.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-3">
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium line-clamp-2">{campaign.title}</h4>
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2 shrink-0"
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{campaign.ngo}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {campaign.location}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {campaign.category}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {campaign.raised.toFixed(2)} / {campaign.goal.toFixed(2)} MATIC
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.supporters} supporters
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
