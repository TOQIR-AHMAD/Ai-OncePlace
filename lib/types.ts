export type Pricing = 'free' | 'freemium' | 'paid' | 'free-trial';

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  url: string;
  /** Optional explicit logo (path or external URL). Empty string => derive a favicon. */
  logo: string;
  pricing: Pricing;
  /** Category slugs this tool belongs to. */
  categories: string[];
  tags: string[];
  upvotes: number;
  featured: boolean;
  verified: boolean;
  /** ISO date (YYYY-MM-DD). */
  dateAdded: string;
  source: 'manual' | 'auto';
}

export interface Category {
  slug: string;
  name: string;
  /** PascalCase lucide-react icon name. */
  icon: string;
  description: string;
}
