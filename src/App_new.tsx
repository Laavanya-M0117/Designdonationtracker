// This file is no longer needed as updates have been applied to main App.tsx

export default function App() {
  // Blockchain state and actions
  const [blockchainState, blockchainActions] = useBlockchain();
  const { addNotification } = useNotifications();
  
  // UI state
  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false);
  const [activeTab, setActiveTab] = useLocalStorage('active-tab', 'dashboard');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Search and pagination for donations
  const donationSearch = useSearch(
    blockchainState.donations,
    ['ngo', 'donor', 'message'] as const,
    { query: '' }
  );
  
  const donationPagination = usePagination(donationSearch.filteredItems, {
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  });

  // Search and pagination for NGOs
  const ngoSearch = useSearch(
    blockchainState.ngos,
    ['name', 'description', 'website', 'wallet'] as const,
    { query: '' }
  );
  
  const ngoPagination = usePagination(ngoSearch.filteredItems, {
    initialPageSize: 12,
    pageSizeOptions: [6, 12, 24, 48],
  });

  // Memoized calculations
  const stats = useMemo(() => {
    const totalDonations = blockchainState.donations.length;
    const totalAmount = blockchainState.donations.reduce(
      (sum, d) => sum + Number(d.amount) / 1e18, 0
    );
    const totalNGOs = blockchainState.ngos.length;
    const approvedNGOs = blockchainState.ngos.filter(n => n.approved).length;

    return { totalDonations, totalAmount, totalNGOs, approvedNGOs };
  }, [blockchainState.donations, blockchainState.ngos]);

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check if contract address is configured
    if (!isProductionReady()) {
      setShowSetupGuide(true);
      return;
    }
  }, [darkMode]);

  // Enhanced action handlers with notifications
  const handleRegisterNGO = useCallback(async (name: string, metadata: string, description: string, website: string, contact: string) => {
    try {
      await blockchainActions.registerNGO(name, metadata, description, website, contact);
      
      addNotification({
        type: 'success',
        category: 'ngo',
        title: 'NGO Registration Submitted',
        message: `${name} has been submitted for approval. You'll be notified when it's approved.`,
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        category: 'ngo',
        title: 'Registration Failed',
        message: error.message || 'Failed to register NGO. Please try again.',
      });
      throw error;
    }
  }, [blockchainActions, addNotification]);

  const handleDonate = useCallback(async (ngoWallet: string, amount: string, message: string) => {
    try {
      const ngo = blockchainState.ngos.find(n => n.wallet.toLowerCase() === ngoWallet.toLowerCase());
      await blockchainActions.donate(ngoWallet, amount, message);
      
      addNotification({
        type: 'success',
        category: 'donation',
        title: 'Donation Sent',
        message: `Successfully donated ${amount} MATIC to ${ngo?.name || 'Unknown NGO'}`,
        actionLabel: 'View Transaction',
        onAction: () => setActiveTab('dashboard'),
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        category: 'donation',
        title: 'Donation Failed',
        message: error.message || 'Failed to process donation. Please try again.',
      });
      throw error;
    }
  }, [blockchainActions, blockchainState.ngos, addNotification, setActiveTab]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  if (blockchainState.loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Connecting to Blockchain</p>
              <p className="text-muted-foreground">Loading donation tracker on Polygon Amoy...</p>
            </div>
            
            {blockchainState.connectionError && (
              <motion.div 
                className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 }}
              >
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{blockchainState.connectionError}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Make sure MetaMask is installed and the smart contract is deployed.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">BlockchainGive</h1>
                  <p className="text-sm text-muted-foreground">Transparent Donation Tracker</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Toggle */}
                <Button
                  variant={showSearch ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setShowSearch(!showSearch)}
                  className="rounded-full"
                >
                  <Search className="w-4 h-4" />
                </Button>

                {/* Export Toggle */}
                <Button
                  variant={showExport ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setShowExport(!showExport)}
                  className="rounded-full"
                >
                  <Download className="w-4 h-4" />
                </Button>

                {/* Notifications */}
                <NotificationSystem />

                {/* Refresh */}
                {blockchainState.account && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={blockchainActions.refresh}
                    disabled={blockchainState.refreshing}
                    className="rounded-full"
                  >
                    <RefreshCw className={`w-4 h-4 ${blockchainState.refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
                
                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="rounded-full"
                >
                  <motion.div
                    key={darkMode ? 'sun' : 'moon'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </motion.div>
                </Button>
                
                {/* Wallet Connection */}
                <WalletConnect
                  account={blockchainState.account}
                  onConnect={blockchainActions.connect}
                  onDisconnect={blockchainActions.disconnect}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Search Panel */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b border-border bg-background/95 backdrop-blur-sm"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Search & Filter</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {activeTab === 'dashboard' || activeTab === 'donate' ? (
                  <SearchFilter
                    filters={donationSearch.filters}
                    onFiltersChange={donationSearch.updateFilters}
                    onClearFilters={donationSearch.clearFilters}
                    placeholder="Search donations by NGO, donor, or message..."
                  />
                ) : activeTab === 'analytics' ? (
                  <SearchFilter
                    filters={ngoSearch.filters}
                    onFiltersChange={ngoSearch.updateFilters}
                    onClearFilters={ngoSearch.clearFilters}
                    placeholder="Search NGOs by name, description, or wallet..."
                  />
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Panel */}
        <AnimatePresence>
          {showExport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b border-border bg-background/95 backdrop-blur-sm"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Export Data</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowExport(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <ExportData
                  ngos={blockchainState.ngos}
                  donations={blockchainState.donations}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <AnimatePresence>
          {!blockchainState.account && (
            <motion.section 
              className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-background dark:to-purple-950 relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>
              
              <div className="container mx-auto px-4 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    <div className="space-y-4">
                      <motion.h1 
                        className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                      >
                        Transparent Donations on Blockchain
                      </motion.h1>
                      <motion.p 
                        className="text-xl text-muted-foreground leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                      >
                        Track every donation, verify impact, and build trust through decentralized transparency. 
                        Empowering NGOs and donors with blockchain technology on Polygon Amoy.
                      </motion.p>
                    </div>
                    
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 0.8 }}
                    >
                      <Button
                        size="lg"
                        onClick={blockchainActions.connect}
                        className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Heart className="w-5 h-5" />
                        Connect & Donate
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setActiveTab('analytics')}
                        className="gap-2 text-lg px-8 py-6 hover:bg-primary/5 transition-all duration-300"
                      >
                        <BarChart3 className="w-5 h-5" />
                        View Analytics
                      </Button>
                    </motion.div>

                    <motion.div 
                      className="grid grid-cols-3 gap-8 pt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, delay: 1.0 }}
                    >
                      <div className="text-center">
                        <motion.div 
                          className="text-2xl font-bold text-blue-600"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
                        >
                          {stats.totalDonations}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">Total Donations</div>
                      </div>
                      <div className="text-center">
                        <motion.div 
                          className="text-2xl font-bold text-green-600"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 1.4, type: "spring" }}
                        >
                          {stats.totalAmount.toFixed(2)}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">MATIC Raised</div>
                      </div>
                      <div className="text-center">
                        <motion.div 
                          className="text-2xl font-bold text-purple-600"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 1.6, type: "spring" }}
                        >
                          {stats.approvedNGOs}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">Active NGOs</div>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
                    <motion.div
                      whileHover={{ scale: 1.02, rotate: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neSUyMGNoYXJpdHl8ZW58MXx8fHwxNzU4MTIyMjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Blockchain Technology for Charity"
                        className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Connection Status Banner */}
          {blockchainState.connectionError && !blockchainState.account && (
            <motion.div 
              className="mb-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Blockchain Connection Issue
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-300">
                    {blockchainState.connectionError}. Some features may be limited until you connect your wallet.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2">
                <TabsTrigger value="dashboard" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="donate" className="gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Donate</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Register NGO</span>
                </TabsTrigger>
                <TabsTrigger value="manage" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                {blockchainState.isOwner && (
                  <TabsTrigger value="admin" className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="dashboard" className="space-y-8">
                <DashboardStats
                  totalDonations={stats.totalDonations}
                  totalAmount={stats.totalAmount.toString()}
                  totalNGOs={stats.totalNGOs}
                  approvedNGOs={stats.approvedNGOs}
                />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <DonationsFeed 
                      donations={donationPagination.paginatedItems} 
                      ngos={blockchainState.ngos} 
                    />
                    {donationPagination.totalItems > 0 && (
                      <div className="mt-6">
                        <PaginationControls {...donationPagination} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <DonationForm
                      account={blockchainState.account}
                      ngos={blockchainState.ngos}
                      onDonate={handleDonate}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="donate" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <DonationForm
                    account={blockchainState.account}
                    ngos={blockchainState.ngos}
                    onDonate={handleDonate}
                  />
                  <div className="relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1697665387559-253e7a645e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwaW5nJTIwaGFuZHMlMjBkb25hdGlvbnxlbnwxfHx8fDE3NTgxMjIyMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Helping Hands Donation"
                      className="rounded-lg shadow-lg w-full h-[400px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end p-6">
                      <div className="text-white">
                        <h3 className="text-2xl font-bold mb-2">Make a Difference Today</h3>
                        <p>Every donation is tracked transparently on the blockchain, ensuring your impact is visible and verified.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <DonationsFeed 
                  donations={donationPagination.paginatedItems} 
                  ngos={blockchainState.ngos} 
                />
                {donationPagination.totalItems > 0 && (
                  <PaginationControls {...donationPagination} />
                )}
              </TabsContent>

              <TabsContent value="register" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <NGORegistration
                    account={blockchainState.account}
                    onRegister={handleRegisterNGO}
                  />
                  <div className="relative">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1530043123514-c01b94ef483b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzdXBwb3J0JTIwdm9sdW50ZWVyfGVufDF8fHx8MTc1ODEyMjIwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Community Support Volunteers"
                      className="rounded-lg shadow-lg w-full h-[400px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end p-6">
                      <div className="text-white">
                        <h3 className="text-2xl font-bold mb-2">Join Our Network</h3>
                        <p>Register your NGO to receive transparent donations and build trust with your supporters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="manage" className="space-y-8">
                <NGOManagement
                  account={blockchainState.account}
                  ngos={blockchainState.ngos}
                  donations={blockchainState.donations}
                  pendingWithdrawals={blockchainState.pendingWithdrawals}
                  onAddProof={blockchainActions.addProof}
                  onWithdraw={blockchainActions.withdraw}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <AnalyticsDashboard
                  ngos={ngoPagination.paginatedItems}
                  donations={blockchainState.donations}
                />
                {ngoPagination.totalItems > 0 && (
                  <PaginationControls {...ngoPagination} />
                )}
              </TabsContent>

              {blockchainState.isOwner && (
                <TabsContent value="admin" className="space-y-8">
                  <AdminPanel
                    account={blockchainState.account}
                    isOwner={blockchainState.isOwner}
                    ngos={blockchainState.ngos}
                    onApproveNGO={blockchainActions.approveNGO}
                  />
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg">BlockchainGive</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Empowering transparent donations through blockchain technology. 
                  Building trust between donors and NGOs worldwide.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">How it Works</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Transparency</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Smart Contract</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-4">Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-4">Connect</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Globe className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>© 2024 BlockchainGive. Built on Polygon Network. Empowering SDG 1 & 17.</p>
            </div>
          </div>
        </footer>

        <Toaster 
          position="top-right"
          expand={true}
          richColors
          closeButton
        />
        
        {/* Setup Guide Modal */}
        {showSetupGuide && (
          <SetupGuide onDismiss={() => setShowSetupGuide(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}