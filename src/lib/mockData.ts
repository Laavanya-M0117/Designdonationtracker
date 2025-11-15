// Mock data for demonstration purposes - India focused food donation NGOs

export interface MockNGO {
  wallet: string;
  name: string;
  description: string;
  website: string;
  contact: string;
  metadata: string;
  approved: boolean;
  registrationTimestamp: number;
}

export interface MockDonation {
  id: number;
  donor: string;
  ngo: string;
  amount: string;
  timestamp: number;
  message: string;
  proofCID: string;
}

// Sample approved NGOs in India focused on food security
export const mockNGOs: MockNGO[] = [
  {
    wallet: '0x1234567890123456789012345678901234567890',
    name: 'Akshaya Patra Foundation',
    description: 'Providing mid-day meals to underprivileged school children across India. Serving 2 million+ meals daily.',
    website: 'https://www.akshayapatra.org',
    contact: 'contact@akshayapatra.org',
    metadata: 'QmAkshayaPatra123',
    approved: true,
    registrationTimestamp: Date.now() / 1000 - 86400 * 30,
  },
  {
    wallet: '0x2345678901234567890123456789012345678901',
    name: 'Feeding India',
    description: 'Fighting hunger and malnutrition across India. Redistributing excess food from events and restaurants to the needy.',
    website: 'https://www.feedingindia.org',
    contact: 'info@feedingindia.org',
    metadata: 'QmFeedingIndia456',
    approved: true,
    registrationTimestamp: Date.now() / 1000 - 86400 * 25,
  },
  {
    wallet: '0x3456789012345678901234567890123456789012',
    name: 'The Robin Hood Army',
    description: 'Volunteer-based organization that redistributes surplus food from restaurants to the less fortunate in cities across India.',
    website: 'https://www.robinhoodarmy.com',
    contact: 'support@robinhoodarmy.com',
    metadata: 'QmRobinHood789',
    approved: true,
    registrationTimestamp: Date.now() / 1000 - 86400 * 20,
  },
  {
    wallet: '0x4567890123456789012345678901234567890123',
    name: 'India FoodBanking Network',
    description: 'Working to eliminate hunger and malnutrition by soliciting and distributing food to the underprivileged.',
    website: 'https://www.indiafoodbanking.org',
    contact: 'contact@indiafoodbanking.org',
    metadata: 'QmFoodBank101',
    approved: true,
    registrationTimestamp: Date.now() / 1000 - 86400 * 15,
  },
  {
    wallet: '0x5678901234567890123456789012345678901234',
    name: 'Annamrita Foundation',
    description: 'Providing freshly cooked nutritious meals to school children from economically disadvantaged backgrounds.',
    website: 'https://www.annamrita.org',
    contact: 'info@annamrita.org',
    metadata: 'QmAnnamrita202',
    approved: true,
    registrationTimestamp: Date.now() / 1000 - 86400 * 12,
  },
  {
    wallet: '0x6789012345678901234567890123456789012345',
    name: 'Goonj',
    description: 'Disaster relief, humanitarian aid, and community development with focus on food security in rural India.',
    website: 'https://www.goonj.org',
    contact: 'contact@goonj.org',
    metadata: 'QmGoonj303',
    approved: true,
    registrationTimestamp: Date.now() / 1000 - 86400 * 10,
  },
];

// Sample donations
export const mockDonations: MockDonation[] = [
  {
    id: 1,
    donor: '0xA111111111111111111111111111111111111111',
    ngo: '0x1234567890123456789012345678901234567890',
    amount: '100000000000000000', // 0.1 MATIC
    timestamp: Date.now() / 1000 - 3600 * 2,
    message: 'Supporting mid-day meals for children in Karnataka. Every child deserves nutritious food!',
    proofCID: 'QmProof1',
  },
  {
    id: 2,
    donor: '0xB222222222222222222222222222222222222222',
    ngo: '0x2345678901234567890123456789012345678901',
    amount: '250000000000000000', // 0.25 MATIC
    timestamp: Date.now() / 1000 - 3600 * 5,
    message: 'Proud to support food redistribution in Mumbai. Fighting food waste and hunger together.',
    proofCID: '',
  },
  {
    id: 3,
    donor: '0xC333333333333333333333333333333333333333',
    ngo: '0x3456789012345678901234567890123456789012',
    amount: '500000000000000000', // 0.5 MATIC
    timestamp: Date.now() / 1000 - 3600 * 12,
    message: 'Amazing work by Robin Hood Army volunteers in Delhi. Keep it up!',
    proofCID: 'QmProof2',
  },
  {
    id: 4,
    donor: '0xD444444444444444444444444444444444444444',
    ngo: '0x4567890123456789012345678901234567890123',
    amount: '150000000000000000', // 0.15 MATIC
    timestamp: Date.now() / 1000 - 3600 * 18,
    message: 'Food banking is essential for our communities. Happy to contribute.',
    proofCID: '',
  },
  {
    id: 5,
    donor: '0xE555555555555555555555555555555555555555',
    ngo: '0x5678901234567890123456789012345678901234',
    amount: '300000000000000000', // 0.3 MATIC
    timestamp: Date.now() / 1000 - 3600 * 24,
    message: 'Nutritious meals for school children - this is the future of India!',
    proofCID: 'QmProof3',
  },
  {
    id: 6,
    donor: '0xF666666666666666666666666666666666666666',
    ngo: '0x6789012345678901234567890123456789012345',
    amount: '200000000000000000', // 0.2 MATIC
    timestamp: Date.now() / 1000 - 3600 * 36,
    message: 'Goonj\'s work in disaster relief and food security is truly inspiring.',
    proofCID: '',
  },
  {
    id: 7,
    donor: '0xA111111111111111111111111111111111111111',
    ngo: '0x2345678901234567890123456789012345678901',
    amount: '400000000000000000', // 0.4 MATIC
    timestamp: Date.now() / 1000 - 3600 * 48,
    message: 'Second donation to Feeding India. Love the transparency through blockchain!',
    proofCID: 'QmProof4',
  },
  {
    id: 8,
    donor: '0xB222222222222222222222222222222222222222',
    ngo: '0x1234567890123456789012345678901234567890',
    amount: '350000000000000000', // 0.35 MATIC
    timestamp: Date.now() / 1000 - 3600 * 60,
    message: 'Supporting Akshaya Patra\'s mission to end hunger among children.',
    proofCID: '',
  },
  {
    id: 9,
    donor: '0xC333333333333333333333333333333333333333',
    ngo: '0x5678901234567890123456789012345678901234',
    amount: '180000000000000000', // 0.18 MATIC
    timestamp: Date.now() / 1000 - 3600 * 72,
    message: 'Every meal counts. Thank you Annamrita for your dedicated work.',
    proofCID: 'QmProof5',
  },
  {
    id: 10,
    donor: '0xD444444444444444444444444444444444444444',
    ngo: '0x3456789012345678901234567890123456789012',
    amount: '220000000000000000', // 0.22 MATIC
    timestamp: Date.now() / 1000 - 3600 * 96,
    message: 'Volunteer work + blockchain transparency = perfect combination!',
    proofCID: '',
  },
];
