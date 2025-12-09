// Configuration management for the blockchain donation tracker

export interface AppConfig {
  contractAddress: string;
  networkConfig: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
}

const getEnvironmentVariable = (keys: string[]): string => {
  // Try process.env first (Node.js/Next.js)
  if (typeof process !== 'undefined' && process.env) {
    for (const key of keys) {
      const value = process.env[key];
      if (value) return value;
    }
  }
  
  // Try import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    for (const key of keys) {
      const value = (import.meta as any).env[key];
      if (value) return value;
    }
  }
  
  // Try window-based env vars
  if (typeof window !== 'undefined' && (window as any).ENV) {
    for (const key of keys) {
      const value = (window as any).ENV[key];
      if (value) return value;
    }
  }
  
  return '';
};

const getContractAddress = (): string => {
  const address = getEnvironmentVariable([
    'NEXT_PUBLIC_CONTRACT_ADDRESS',
    'VITE_CONTRACT_ADDRESS',
    'CONTRACT_ADDRESS'
  ]);
  
  // Return default fallback for development
  return address || '0x0000000000000000000000000000000000000000';
};

export const config: AppConfig = {
  contractAddress: getContractAddress(),
  networkConfig: {
    chainId: getEnvironmentVariable(['VITE_CHAIN_ID', 'NEXT_PUBLIC_CHAIN_ID']) || '0x7A69',
    chainName: getEnvironmentVariable(['VITE_CHAIN_ID', 'NEXT_PUBLIC_CHAIN_ID']) === '0x7A69'
      ? 'Hardhat Local Network'
      : 'Polygon Amoy Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [getEnvironmentVariable(['VITE_RPC_URL', 'NEXT_PUBLIC_RPC_URL']) || 'http://127.0.0.1:8545'],
    blockExplorerUrls: [getEnvironmentVariable(['VITE_BLOCK_EXPLORER', 'NEXT_PUBLIC_BLOCK_EXPLORER']) || 'http://127.0.0.1:8545'],
  },
};

// Helper functions
export const isValidContractAddress = (address: string): boolean => {
  return address !== '0x0000000000000000000000000000000000000000' && 
         address.length === 42 && 
         address.startsWith('0x');
};

export const isProductionReady = (): boolean => {
  return isValidContractAddress(config.contractAddress);
};

// Development helpers
export const getSetupInstructions = () => {
  return {
    environmentVariables: [
      {
        name: 'NEXT_PUBLIC_CONTRACT_ADDRESS',
        description: 'For Next.js applications',
        example: 'NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890'
      },
      {
        name: 'VITE_CONTRACT_ADDRESS',
        description: 'For Vite applications',
        example: 'VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890'
      }
    ],
    deploymentSteps: [
      'Deploy your smart contract to Polygon Amoy testnet using Hardhat',
      'Copy the deployed contract address',
      'Set the contract address in your environment variables',
      'Restart your development server'
    ]
  };
};