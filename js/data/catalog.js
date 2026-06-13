/**
 * Book catalog data
 */
export const CATEGORIES = [
  { id: 'all', label: 'All Realms' },
  { id: 'novel', label: 'Novels' },
  { id: 'science', label: 'Science' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'technology', label: 'Technology' },
  { id: 'literature', label: 'Literature' },
  { id: 'spirituality', label: 'Spirituality' }
];

export const CATEGORY_GRADIENTS = {
  science: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(124,58,237,0.08))',
  philosophy: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.08))',
  technology: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(124,58,237,0.08))',
  literature: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.06))',
  spirituality: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(124,58,237,0.06))'
};

export const BOOKS = [
  {
    id: 'khwaab',
    title: 'Khwaab ki Tabeer',
    author: '',
    category: 'spirituality',
    cover: 'images/DP.png',
    rating: 4.9,
    premium: true,
    price: 19,
    featured: true,
    samplePdf: 'pdfs/khwaab.pdf',
    downloadFile: "https://drive.google.com/uc?export=download&id=1XFHV5PjT-0x5FyRzus6ZPj6mJD-5mfkR"
  },
{
  id: 'DSA',
  title: 'Data Structures & Algorithms Notes',
  author: '',
  category: 'technology',
  cover: 'images/dsa.png',
  rating: 4.7,
  premium: true,
  price: 99,
  featured: true,
  confidential: true,
  samplePdf: null,
downloadFile: "https://drive.google.com/uc?export=download&id=1jfML-jUSh2xfwk3zI08BzCiwR7LHvaoB"
},
  {
    id: 'ai2',
    title: 'Adhura Ishq',
    author: 'Shaik Jahash ahmed',
    category: 'Novels',
    cover: 'images/ai.png',
    rating: 4.8,
    premium: false,
    price: 0,
    featured: false,
    samplePdf: 'pdfs/ai2.pdf',
    downloadFile: 'pdfs/ai2.pdf'
  },
  {
    id: 'pd2',
    title: 'Pichla Darwaza',
    author: 'Ahmed',
    category: 'Novels',
    cover: 'images/F.png',
    rating: 4.6,
    premium: false,
    price: 0,
    featured: false,
    samplePdf: 'pdfs/pd2.pdf',
    downloadFile: 'pdfs/pd2.pdf'
  },
  {
    id: 'java',
    title: 'Java Programming Notes',
    author: '',
    category: 'technology',
    cover: 'images/java.png',
    rating: 4.9,
    premium: true,
    confidential: true,
    price: 9,
    featured: true,
    downloadFile: "https://drive.google.com/uc?export=download&id=1r1--SkIY7eEaIO0gAuvTlsMUJTB_Qowm"
  },
  {
    id: 'bk-stellar-math',
    title: 'Stellar Mathematics',
    author: 'Dr. Kenji Nakamura',
    category: 'science',
    cover: 'images/covers/stellar-math.jpg',
    rating: 4.5,
    premium: true,
    price: 449,
    featured: false,
    samplePdf: 'samples/bk-stellar-math-sample.pdf',
    downloadFile: 'books/bk-stellar-math.pdf'
  },
  {
    id: 'bk-digital-zen',
    title: 'Digital Zen',
    author: 'Master Kai Flow',
    category: 'spirituality',
    cover: 'images/covers/digital-zen.jpg',
    rating: 4.7,
    premium: false,
    price: 0,
    featured: false,
    samplePdf: 'samples/bk-digital-zen-sample.pdf',
    downloadFile: 'books/bk-digital-zen.pdf'
  },
  {
    id: 'bk-blockchain-soul',
    title: 'Blockchain & The Soul',
    author: 'Vikram Chain',
    category: 'technology',
    cover: 'images/covers/blockchain-soul.jpg',
    rating: 4.4,
    premium: true,
    price: 379,
    featured: false,
    samplePdf: 'samples/bk-blockchain-soul-sample.pdf',
    downloadFile: 'books/bk-blockchain-soul.pdf'
  }
];

export function getBookById(id) {
  return BOOKS.find(b => b.id === id) || null;
}

export function getFeaturedBooks() {
  return BOOKS.filter(b => b.featured);
}

export function filterBooks(query = '', category = 'all') {
  const q = query.toLowerCase().trim();
  return BOOKS.filter(book => {
    const matchCategory = category === 'all' || book.category === category;
    const matchQuery = !q ||
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.category.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });
}
