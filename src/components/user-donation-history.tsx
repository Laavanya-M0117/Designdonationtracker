import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Building2, ExternalLink, TrendingUp, History } from 'lucide-react';

interface Donation {
  id: number;
  donor: string;
  ngo: string;
  amount: string;
  timestamp: number;
  message: string;
  proofCID: string;
}

interface NGO {
  wallet: string;
  name: string;
}

interface UserDonationHistoryProps {
  donations: Donation[];
  ngos: NGO[];
  userAccount: string;
}

export function UserDonationHistory({ donations, ngos, userAccount }: UserDonationHistoryProps) {
  const getNGOName = (wallet: string) => {
    const ngo = ngos.find(n => n.wallet.toLowerCase() === wallet.toLowerCase());
    return ngo?.name || `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: string) => {
    return (Number(amount) / 1e18).toFixed(4);
  };

  // Filter donations made by the current user
  const userDonations = donations.filter(
    d => d.donor.toLowerCase() === userAccount.toLowerCase()
  );

  // Calculate total donated by user
  const totalDonated = userDonations.reduce(
    (sum, d) => sum + Number(d.amount) / 1e18,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Your Donation History
          </span>
          <Badge variant="secondary">{userDonations.length} donations</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!userAccount ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>Connect your wallet to view donation history</p>
          </div>
        ) : userDonations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>You haven't made any donations yet.</p>
            <p className="text-sm mt-2">Start making a difference today!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total donated summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donated</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalDonated.toFixed(4)} MATIC
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Donations list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {userDonations.slice().reverse().map((donation) => (
                <div
                  key={donation.id}
                  className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10">
                          <Building2 className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{getNGOName(donation.ngo)}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(donation.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatAmount(donation.amount)} MATIC
                      </p>
                      <Badge variant="outline" className="text-xs">
                        #{donation.id}
                      </Badge>
                    </div>
                  </div>

                  {donation.message && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      "{donation.message}"
                    </p>
                  )}

                  {donation.proofCID && (
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                      <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                        Impact verified ✓
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://ipfs.io/ipfs/${donation.proofCID}`, '_blank')}
                        className="gap-1 h-6 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
