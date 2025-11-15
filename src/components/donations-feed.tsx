import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, User, Building2, MessageSquare, ExternalLink, FileText, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

interface DonationsFeedProps {
  donations: Donation[];
  ngos: NGO[];
}

export function DonationsFeed({ donations, ngos }: DonationsFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterByNGO, setFilterByNGO] = useState('all');

  const getNGOName = (wallet: string) => {
    const ngo = ngos.find(n => n.wallet.toLowerCase() === wallet.toLowerCase());
    return ngo?.name || `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: string) => {
    return (Number(amount) / 1e18).toFixed(4);
  };

  // Filter and sort donations
  const filteredDonations = donations
    .filter(donation => {
      const matchesSearch = searchTerm === '' || 
        donation.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getNGOName(donation.ngo).toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNGO = filterByNGO === 'all' || donation.ngo === filterByNGO;
      
      return matchesSearch && matchesNGO;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return b.timestamp - a.timestamp;
      if (sortBy === 'amount') return Number(b.amount) - Number(a.amount);
      return 0;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Live Donations Feed
          </span>
          <Badge variant="secondary">{donations.length} donations</Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="amount">Highest Amount</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterByNGO} onValueChange={setFilterByNGO}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by NGO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All NGOs</SelectItem>
              {ngos.map((ngo) => (
                <SelectItem key={ngo.wallet} value={ngo.wallet}>
                  {ngo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredDonations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No donations found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDonations.map((donation) => (
              <div
                key={donation.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatAddress(donation.donor)}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {getNGOName(donation.ngo)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(donation.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatAmount(donation.amount)} MATIC
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{donation.id}
                    </Badge>
                  </div>
                </div>

                {donation.message && (
                  <div className="mb-3 p-3 bg-muted rounded-md">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm">{donation.message}</p>
                    </div>
                  </div>
                )}

                {donation.proofCID && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Impact proof attached
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://ipfs.io/ipfs/${donation.proofCID}`, '_blank')}
                      className="gap-2 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Proof
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}