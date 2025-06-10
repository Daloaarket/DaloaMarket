export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('225') && cleaned.length === 13) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  
  if (cleaned.length === 10) {
    return `+225 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const validateIvorianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('225')) {
    return cleaned.length === 13;
  }
  
  return cleaned.length === 10;
};

export const DISTRICTS = [
  'Abattoir 1',
  'Abattoir 2 (Sud B)',
  'Aviation',
  'Baoulé',
  'Belleville',
  'Bribouo',
  'CAFOP',
  'Commerce',
  'Dalolabia',
  'Dioulabougou',
  'Gbeuliville',
  'Gbokora',
  'Gbobélé',
  'Huberson',
  'Kennedy 1',
  'Kennedy 2',
  'Kirman',
  'Lobia',
  'Marais',
  'Orly 1',
  'Piscine',
  'Sapia',
  'Soleil 1',
  'Soleil 2',
  'Sud A',
  'Tagoura',
  'Tazibouo',
  'Tazibouo Piscine',
  'Zakoua'
];

export const CATEGORIES = [
  { id: 'fashion', label: 'Mode & Accessoires' },
  { id: 'electronics', label: 'Électronique & High-tech' },
  { id: 'home', label: 'Maison & Jardin' },
  { id: 'vehicles', label: 'Auto & Moto' },
  { id: 'sports', label: 'Sports & Loisirs' },
  { id: 'books', label: 'Livres & Culture' },
];

export const CONDITIONS = [
  { id: 'new', label: 'Neuf' },
  { id: 'like_new', label: 'Très bon état' },
  { id: 'good', label: 'Bon état' },
  { id: 'used', label: 'Usagé' },
];