export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: any; // Firebase Timestamp or string
  updatedAt: any; // Firebase Timestamp or string
  tags: string[];
  category: string;
  featured: boolean;
  imageUrl?: string;
  readTime: number;
  status?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}
