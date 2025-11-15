import { ethers } from 'ethers';

export interface NGO {
  wallet: string;
  name: string;
  metadataCID: string;
  approved: boolean;
  totalReceived: string;
  totalWithdrawn: string;
  description?: string;
  website?: string;
  contact?: string;
}

export interface Donation {
  id: number;
  donor: string;
  ngo: string;
  amount: string;
  timestamp: number;
  message: string;
  proofCID: string;
}

// Smart contract ABI - Update this with your actual contract ABI
const CONTRACT_ABI = [
  // NGO Management
  "function registerNGO(string memory name, string memory metadataCID, string memory description, string memory website, string memory contact) public",
  "function approveNGO(address ngoWallet, bool approved) public",
  "function getNGO(address ngoWallet) public view returns (tuple(address wallet, string name, string metadataCID, bool approved, uint256 totalReceived, uint256 totalWithdrawn, string description, string website, string contact))",
  "function getAllNGOs() public view returns (address[] memory)",
  
  // Donation Functions
  "function donate(address ngoWallet, string memory message) public payable",
  "function getDonation(uint256 donationId) public view returns (tuple(uint256 id, address donor, address ngo, uint256 amount, uint256 timestamp, string message, string proofCID))",
  "function getDonationsByNGO(address ngoWallet) public view returns (uint256[] memory)",
  "function getAllDonations() public view returns (uint256[] memory)",
  "function addProof(uint256 donationId, string memory cid) public",
  
  // Withdrawal Functions
  "function withdraw(uint256 amount) public",
  "function getPendingWithdrawal(address ngoWallet) public view returns (uint256)",
  
  // Access Control
  "function owner() public view returns (address)",
  "function transferOwnership(address newOwner) public",
  
  // Events
  "event NGORegistered(address indexed ngoWallet, string name)",
  "event NGOApproved(address indexed ngoWallet, bool approved)",
  "event DonationMade(uint256 indexed donationId, address indexed donor, address indexed ngo, uint256 amount, string message)",
  "event ProofAdded(uint256 indexed donationId, string cid)",
  "event WithdrawalMade(address indexed ngo, uint256 amount)",
];

import { config } from './config';

// Use configuration from config.ts
const CONTRACT_ADDRESS = config.contractAddress;
const NETWORK_CONFIG = config.networkConfig;

export class BlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private account: string = '';
  private isConnected: boolean = false;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account = accounts[0];
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }

  async connect(): Promise<string> {
    if (!this.provider) {
      throw new Error('MetaMask not detected. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await this.provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask and try again.');
      }

      this.account = accounts[0];
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(parseInt(NETWORK_CONFIG.chainId, 16))) {
        await this.switchToPolygonAmoy();
      }

      // Initialize contract
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);
      this.isConnected = true;

      return this.account;
    } catch (error: any) {
      console.error('Connection failed:', error);
      throw new Error(error.message || 'Failed to connect to wallet');
    }
  }

  private async switchToPolygonAmoy() {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
        } catch (addError) {
          throw new Error('Failed to add Polygon Amoy network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Polygon Amoy network');
      }
    }
  }

  disconnect(): void {
    this.account = '';
    this.isConnected = false;
    this.signer = null;
    this.contract = null;
  }

  getAccount(): string {
    return this.account;
  }

  async isOwner(): Promise<boolean> {
    if (!this.contract) return false;
    
    try {
      const owner = await this.contract.owner();
      return owner.toLowerCase() === this.account.toLowerCase();
    } catch (error) {
      console.error('Error checking owner:', error);
      return false;
    }
  }

  async getNGOs(): Promise<NGO[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const ngoAddresses = await this.contract.getAllNGOs();
      const ngos: NGO[] = [];

      for (const address of ngoAddresses) {
        try {
          const ngoData = await this.contract.getNGO(address);
          ngos.push({
            wallet: ngoData.wallet,
            name: ngoData.name,
            metadataCID: ngoData.metadataCID,
            approved: ngoData.approved,
            totalReceived: ngoData.totalReceived.toString(),
            totalWithdrawn: ngoData.totalWithdrawn.toString(),
            description: ngoData.description,
            website: ngoData.website,
            contact: ngoData.contact,
          });
        } catch (error) {
          console.warn(`Failed to load NGO ${address}:`, error);
        }
      }

      return ngos;
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      throw new Error('Failed to fetch NGOs from blockchain');
    }
  }

  async getDonations(): Promise<Donation[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const donationIds = await this.contract.getAllDonations();
      const donations: Donation[] = [];

      for (const id of donationIds) {
        try {
          const donationData = await this.contract.getDonation(id);
          donations.push({
            id: Number(donationData.id),
            donor: donationData.donor,
            ngo: donationData.ngo,
            amount: donationData.amount.toString(),
            timestamp: Number(donationData.timestamp),
            message: donationData.message,
            proofCID: donationData.proofCID,
          });
        } catch (error) {
          console.warn(`Failed to load donation ${id}:`, error);
        }
      }

      // Sort by timestamp (newest first)
      return donations.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw new Error('Failed to fetch donations from blockchain');
    }
  }

  async getPendingWithdrawals(): Promise<{ [key: string]: string }> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const ngos = await this.getNGOs();
      const pendingWithdrawals: { [key: string]: string } = {};

      for (const ngo of ngos) {
        if (ngo.approved) {
          try {
            const pending = await this.contract.getPendingWithdrawal(ngo.wallet);
            if (pending > 0) {
              pendingWithdrawals[ngo.wallet] = pending.toString();
            }
          } catch (error) {
            console.warn(`Failed to get pending withdrawal for ${ngo.wallet}:`, error);
          }
        }
      }

      return pendingWithdrawals;
    } catch (error) {
      console.error('Error fetching pending withdrawals:', error);
      throw new Error('Failed to fetch pending withdrawals');
    }
  }

  async registerNGO(
    name: string,
    metadata: string,
    description: string,
    website: string,
    contact: string
  ): Promise<void> {
    if (!this.contract || !this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.registerNGO(name, metadata, description, website, contact);
      await tx.wait();
    } catch (error: any) {
      console.error('Error registering NGO:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      }
      throw new Error(error.reason || 'Failed to register NGO');
    }
  }

  async donate(ngoWallet: string, amount: string, message: string): Promise<void> {
    if (!this.contract || !this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await this.contract.donate(ngoWallet, message, { value: amountWei });
      await tx.wait();
    } catch (error: any) {
      console.error('Error making donation:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      }
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction');
      }
      throw new Error(error.reason || 'Failed to make donation');
    }
  }

  async addProof(donationId: number, cid: string): Promise<void> {
    if (!this.contract || !this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.addProof(donationId, cid);
      await tx.wait();
    } catch (error: any) {
      console.error('Error adding proof:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      }
      throw new Error(error.reason || 'Failed to add proof');
    }
  }

  async withdraw(amount: string): Promise<void> {
    if (!this.contract || !this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await this.contract.withdraw(amountWei);
      await tx.wait();
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      }
      throw new Error(error.reason || 'Failed to withdraw funds');
    }
  }

  async approveNGO(ngoWallet: string, approved: boolean): Promise<void> {
    if (!this.contract || !this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const tx = await this.contract.approveNGO(ngoWallet, approved);
      await tx.wait();
    } catch (error: any) {
      console.error('Error approving NGO:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction rejected by user');
      }
      throw new Error(error.reason || 'Failed to approve NGO');
    }
  }

  // Utility functions
  formatEther(wei: string): string {
    return ethers.formatEther(wei);
  }

  parseEther(ether: string): string {
    return ethers.parseEther(ether).toString();
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.provider) return '0';
    
    try {
      const balance = await this.provider.getBalance(address || this.account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async getTransactionReceipt(txHash: string) {
    if (!this.provider) return null;
    
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return null;
    }
  }
}

// Global type declarations for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}