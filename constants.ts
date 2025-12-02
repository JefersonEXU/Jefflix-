import { Movie, Profile } from './types';

export const HERO_MOVIE: Movie = {
  id: 'hero-1',
  title: 'Cyberpunk: Alvorecer Neon',
  description: 'Em um futuro onde corporações governam as estrelas, um hacker solitário descobre uma conspiração que pode destruir a realidade digital de Neo-Tokyo. Uma produção original Jefflix.',
  thumbnailUrl: 'https://picsum.photos/1920/1080?random=1',
  videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  genre: 'Ficção Científica',
  duration: '2h 14m',
  year: 2024,
  matchScore: 98
};

export const INITIAL_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'O Oceano Silencioso',
    description: 'Um documentário explorando as trincheiras mais profundas das Marianas.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=2',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genre: 'Documentário',
    duration: '1h 30m',
    year: 2023,
    matchScore: 95
  },
  {
    id: '2',
    title: 'Velocidade Máxima',
    description: 'Drama de corrida de alta octanagem nas ruas de Mônaco.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=3',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    genre: 'Ação',
    duration: '1h 55m',
    year: 2022,
    matchScore: 88
  },
  {
    id: '3',
    title: 'Lareira Aconchegante',
    description: 'Relaxe com os sons de uma fogueira crepitante.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=4',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    genre: 'Relaxamento',
    duration: '3h 00m',
    year: 2021,
    matchScore: 92
  },
  {
    id: '4',
    title: 'Picos da Montanha',
    description: 'Escalando os cumes mais altos do mundo.',
    thumbnailUrl: 'https://picsum.photos/800/450?random=5',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    genre: 'Aventura',
    duration: '1h 45m',
    year: 2024,
    matchScore: 91
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'p1',
    name: 'Jeff',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jeff&backgroundColor=b6e3f4',
    myList: ['1', '3'],
    likes: ['hero-1']
  },
  {
    id: 'p2',
    name: 'Infantil',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kids&backgroundColor=ffdfbf',
    myList: ['2'],
    likes: []
  }
];