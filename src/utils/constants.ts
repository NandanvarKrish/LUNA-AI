import { PersonaInfo, PersonaType } from '../types';

export const PERSONAS: Record<PersonaType, PersonaInfo> = {
  luna: {
    id: 'luna',
    name: 'Luna Core',
    tagline: 'Perceptive Celestial Intelligence',
    description: 'Balanced, insightful, elegant reasoning and radiant clarity.',
    avatarIcon: 'Moon',
    accentColor: '#38bdf8', // Sky cyan
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  architect: {
    id: 'architect',
    name: 'Code Architect',
    tagline: 'Systems & Engineering Mastery',
    description: 'Clean design patterns, high performance code, and architectural precision.',
    avatarIcon: 'Cpu',
    accentColor: '#10b981', // Emerald
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  creative: {
    id: 'creative',
    name: 'Creative Muse',
    tagline: 'Visionary & Evocative Arts',
    description: 'Imaginative writing, narrative world-building, conceptual branding, and design.',
    avatarIcon: 'Sparkles',
    accentColor: '#c084fc', // Purple/Violet
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  thinker: {
    id: 'thinker',
    name: 'Deep Thinker',
    tagline: 'First-Principles & Strategy',
    description: 'Rigorous philosophical breakdown, second-order effects, and strategic synthesis.',
    avatarIcon: 'Brain',
    accentColor: '#f59e0b', // Amber
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  zen: {
    id: 'zen',
    name: 'Zen Presence',
    tagline: 'Clarity, Brevity & Mindfulness',
    description: 'Distilled calmness, mindful focus, uncluttering complex dilemmas.',
    avatarIcon: 'Compass',
    accentColor: '#2dd4bf', // Teal
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
};

export const DEFAULT_PROMPT_CARDS = [
  {
    icon: 'Terminal',
    title: 'Architect a Scalable API',
    prompt: 'Design a clean, fault-tolerant TypeScript microservice architecture for real-time collaboration with WebSockets and caching.',
    category: 'Engineering',
  },
  {
    icon: 'Compass',
    title: 'First-Principles Analysis',
    prompt: 'Analyze the trade-offs of centralized cloud computing vs decentralized edge inference over the next 5 years.',
    category: 'Reasoning',
  },
  {
    icon: 'Feather',
    title: 'Cosmic Narrative Concept',
    prompt: 'Write an evocative prologue for a science-fiction novel where humanity awakens a sleeping lunar sentient core.',
    category: 'Creative',
  },
  {
    icon: 'ShieldCheck',
    title: 'Security Audit & Hardening',
    prompt: 'What are the top 7 subtle security vulnerabilities in modern single-page applications and how do we mitigate each?',
    category: 'Security',
  },
];
