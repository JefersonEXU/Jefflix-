export interface Episode {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  season?: number;
  number?: number;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  genre: string;
  duration: string;
  isLocal?: boolean;
  year: number;
  matchScore: number;
  episodes?: Episode[]; // Optional: if present, this is a series
  season?: number; // Keep for legacy/single file uploads context
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  myList: string[]; // Array of Movie IDs
  likes: string[]; // Array of Movie IDs
}

export enum ViewState {
  PROFILE_SELECTION = 'PROFILE_SELECTION',
  HOME = 'HOME',
  PLAYER = 'PLAYER',
  UPLOAD = 'UPLOAD',
  SERIES_DETAILS = 'SERIES_DETAILS'
}