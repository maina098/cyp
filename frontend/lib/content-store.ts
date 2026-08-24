export type MemberRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
};

export type MemberApplication = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  publishedAt: string;
  author: string;
};

export const MEMBER_STORAGE_KEY = 'cyp_members';
export const APPLICATION_STORAGE_KEY = 'cyp_member_applications';
export const BLOG_STORAGE_KEY = 'cyp_blog_posts';

const defaultMembers: MemberRecord[] = [
  { id: 'm-101', name: 'Amina Mwangangi', email: 'amina@cyp.org', role: 'Member', status: 'active', joinedAt: '2025-01-14' },
  { id: 'm-102', name: 'Joel Kivuva', email: 'joel@cyp.org', role: 'Secretary', status: 'active', joinedAt: '2025-02-07' },
  { id: 'm-103', name: 'Njeri Mshai', email: 'njeri@cyp.org', role: 'Member', status: 'pending', joinedAt: '2025-03-19' },
  { id: 'm-104', name: 'Daniel Kamau', email: 'daniel@cyp.org', role: 'Member', status: 'active', joinedAt: '2025-04-22' },
  { id: 'm-105', name: 'Salma Noor', email: 'salma@cyp.org', role: 'Communications', status: 'suspended', joinedAt: '2025-05-03' },
];

const defaultApplications: MemberApplication[] = [
  {
    id: 'a-201',
    name: 'Moses Chai',
    email: 'moses@example.com',
    message: 'I would like to join the coastal youth parliament and contribute to youth representation in the blue economy agenda.',
    status: 'pending',
    submittedAt: '2026-08-03',
  },
  {
    id: 'a-202',
    name: 'Grace Wanjiku',
    email: 'grace@example.com',
    message: 'Seeking membership to support policy advocacy and youth entrepreneurship initiatives in the coastal counties.',
    status: 'pending',
    submittedAt: '2026-08-06',
  },
  {
    id: 'a-203',
    name: 'Abdallah Said',
    email: 'abdallah@example.com',
    message: 'Interested in volunteering and attending leadership sessions to support regional growth and youth engagement.',
    status: 'approved',
    submittedAt: '2026-08-08',
  },
];

const defaultBlogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'CYP Launches Youth Leadership Forum',
    summary: 'A new forum will bring together youth leaders to address governance, entrepreneurship, and coastal development priorities.',
    content: 'The Coastal Youth Parliament has launched a leadership forum designed to create a practical platform for youth innovators, policymakers, and community leaders to engage on pressing coastal development priorities.',
    category: 'News',
    publishedAt: '2026-08-01',
    author: 'Admin Team',
  },
];

function readStorage<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getStoredMembers(): MemberRecord[] {
  return readStorage<MemberRecord>(MEMBER_STORAGE_KEY, defaultMembers);
}

export function getStoredApplications(): MemberApplication[] {
  return readStorage<MemberApplication>(APPLICATION_STORAGE_KEY, defaultApplications);
}

export function getStoredBlogPosts(): BlogPost[] {
  return readStorage<BlogPost>(BLOG_STORAGE_KEY, defaultBlogPosts);
}

export function persistMembers(members: MemberRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(members));
}

export function persistApplications(applications: MemberApplication[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(applications));
}

export function persistBlogPosts(posts: BlogPost[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  window.dispatchEvent(new CustomEvent('cyp-content-updated'));
}

export function createBlogPost(input: { title: string; summary: string; content: string; category: string; author: string; }): BlogPost {
  return {
    id: `blog-${Date.now()}`,
    title: input.title,
    summary: input.summary,
    content: input.content,
    category: input.category,
    publishedAt: new Date().toISOString().slice(0, 10),
    author: input.author,
  };
}
