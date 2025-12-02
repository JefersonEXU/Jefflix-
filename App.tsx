import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoPlayer from './components/VideoPlayer';
import UploadView from './components/UploadView';
import AiChat from './components/AiChat';
import ProfileSelection from './components/ProfileSelection';
import SeriesDetails from './components/SeriesDetails';
import { Movie, ViewState, Profile, Episode } from './types';
import { INITIAL_MOVIES, HERO_MOVIE, INITIAL_PROFILES } from './constants';
import { Play, Plus, Check, ThumbsUp, Trash2, Layers, Star, Save } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE INITIALIZATION WITH PERSISTENCE ---
  const [viewState, setViewState] = useState<ViewState>(ViewState.PROFILE_SELECTION);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Load Profiles from LocalStorage or fallback to constants
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('jefflix_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Load Featured Movie ID
  const [featuredMovieId, setFeaturedMovieId] = useState<string>(() => {
    return localStorage.getItem('jefflix_featured') || 'hero-1';
  });

  // Load Library (Merging constants with potential persistent logic, though local files can't be persisted easily in LS)
  const [movieLibrary, setMovieLibrary] = useState<Movie[]>(() => {
    // We only persist non-local movies to avoid broken blob links
    const saved = localStorage.getItem('jefflix_library');
    if (saved) {
      const parsed = JSON.parse(saved) as Movie[];
      // Merge with initial in case we added new hardcoded ones, but prioritize saved logic if needed
      // For simplicity, we just use the initial ones + any saved (non-local) ones
      // Actually, let's just use the current logic: Start with INITIAL, uploads are session only.
      // But if we want to support "deleting" system movies, we should check LS.
      return parsed.length > 0 ? parsed : INITIAL_MOVIES;
    }
    return INITIAL_MOVIES;
  });

  // --- PERSISTENCE EFFECTS ---

  // Save Profiles whenever they change
  useEffect(() => {
    localStorage.setItem('jefflix_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Save Featured Movie ID
  useEffect(() => {
    localStorage.setItem('jefflix_featured', featuredMovieId);
  }, [featuredMovieId]);

  // Save Library (Filtering out local files because Blobs expire on refresh)
  useEffect(() => {
    const persistantLibrary = movieLibrary.filter(m => !m.isLocal);
    localStorage.setItem('jefflix_library', JSON.stringify(persistantLibrary));
  }, [movieLibrary]);


  // Helper to show save feedback
  const triggerSaveNotification = () => {
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 2000);
  };

  const activeProfile = profiles.find(p => p.id === currentProfileId) || null;

  // Determine current hero movie
  const activeFeaturedMovie = 
      movieLibrary.find(m => m.id === featuredMovieId) || 
      (featuredMovieId === 'hero-1' ? HERO_MOVIE : null) || 
      movieLibrary[0] || 
      HERO_MOVIE;

  const handleSetFeatured = (movieId: string) => {
      setFeaturedMovieId(movieId);
      triggerSaveNotification();
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Profile Management
  const handleSelectProfile = (id: string) => {
    setCurrentProfileId(id);
    setViewState(ViewState.HOME);
  };

  const handleAddProfile = (name: string) => {
    const newProfile: Profile = {
      id: `p${Date.now()}`,
      name: name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=${Math.floor(Math.random()*16777215).toString(16)}`,
      myList: [],
      likes: []
    };
    setProfiles([...profiles, newProfile]);
    triggerSaveNotification();
  };

  const handleSwitchProfile = () => {
    setCurrentProfileId(null);
    setViewState(ViewState.PROFILE_SELECTION);
  };

  // Interactions
  const handleToggleMyList = (movie: Movie) => {
    if (!activeProfile) return;
    
    setProfiles(prevProfiles => prevProfiles.map(p => {
      if (p.id === activeProfile.id) {
        const list = p.myList.includes(movie.id)
          ? p.myList.filter(id => id !== movie.id)
          : [...p.myList, movie.id];
        return { ...p, myList: list };
      }
      return p;
    }));
  };

  const handleToggleLike = (movie: Movie) => {
     if (!activeProfile) return;
    
    setProfiles(prevProfiles => prevProfiles.map(p => {
      if (p.id === activeProfile.id) {
        const likes = p.likes.includes(movie.id)
          ? p.likes.filter(id => id !== movie.id)
          : [...p.likes, movie.id];
        return { ...p, likes: likes };
      }
      return p;
    }));
  };

  const handleDeleteMovie = (e: React.MouseEvent, movie: Movie) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm(`Tem certeza que deseja apagar "${movie.title}" da biblioteca? Esta ação não pode ser desfeita.`)) {
      
      // Check if we are deleting the currently open movie
      if (currentMovie && currentMovie.id === movie.id) {
          handleBack(); // Close the player/details
      }

      // 1. Remove from library
      setMovieLibrary(prev => prev.filter(m => m.id !== movie.id));

      // 2. Remove references from all profiles (likes and lists)
      setProfiles(prev => prev.map(p => ({
        ...p,
        myList: p.myList.filter(id => id !== movie.id),
        likes: p.likes.filter(id => id !== movie.id)
      })));

      // 3. Reset featured if deleted
      if (featuredMovieId === movie.id) {
          setFeaturedMovieId('hero-1');
      }

      // 4. Clean up blob URL if local
      if (movie.isLocal) {
        if (movie.videoUrl && movie.videoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(movie.videoUrl);
        }
        if (movie.thumbnailUrl && movie.thumbnailUrl.startsWith('blob:')) {
            URL.revokeObjectURL(movie.thumbnailUrl);
        }
        if (movie.episodes) {
            movie.episodes.forEach(ep => {
                if (ep.videoUrl.startsWith('blob:')) URL.revokeObjectURL(ep.videoUrl);
            });
        }
      }
      triggerSaveNotification();
    }
  };

  // Movie Player Logic
  const handlePlay = (movie: Movie) => {
    if (movie.episodes && movie.episodes.length > 0) {
        setCurrentMovie(movie);
        setViewState(ViewState.SERIES_DETAILS);
    } else {
        setCurrentMovie(movie);
        setViewState(ViewState.PLAYER);
    }
  };

  const handlePlayEpisode = (episode: Episode) => {
      const episodeMovie: Movie = {
          id: episode.id,
          title: episode.title,
          description: episode.description,
          thumbnailUrl: episode.thumbnailUrl,
          videoUrl: episode.videoUrl,
          genre: 'Série',
          duration: episode.duration,
          year: new Date().getFullYear(),
          matchScore: 0,
          isLocal: true
      };
      setCurrentMovie(episodeMovie);
      setViewState(ViewState.PLAYER);
  };

  const handleBack = () => {
    setCurrentMovie(null);
    setViewState(ViewState.HOME);
  };

  const handleUpload = (newMovies: Movie[]) => {
    setMovieLibrary([...newMovies, ...movieLibrary]);
    if (activeProfile && newMovies.length > 0) {
        newMovies.forEach(m => handleToggleMyList(m));
    }
    setViewState(ViewState.HOME);
  };

  const handleAddEpisodes = (seriesId: string, files: File[], seasonNumber: number) => {
    const seriesIndex = movieLibrary.findIndex(m => m.id === seriesId);
    if (seriesIndex === -1) return;

    const series = movieLibrary[seriesIndex];
    const currentEpisodes = series.episodes || [];
    
    const newEpisodes: Episode[] = files.map((file, idx) => {
        const epNumber = currentEpisodes.length + idx + 1;
        return {
            id: `${seriesId}-ep-added-${Date.now()}-${idx}`,
            title: `Episódio ${epNumber}`,
            description: `Adicionado manualmente. Arquivo: ${file.name}`,
            thumbnailUrl: series.thumbnailUrl, 
            videoUrl: URL.createObjectURL(file),
            duration: '45m',
            season: seasonNumber,
            number: epNumber
        };
    });

    const updatedSeries = {
        ...series,
        episodes: [...currentEpisodes, ...newEpisodes],
        duration: `${currentEpisodes.length + newEpisodes.length} Episódios`
    };

    const newLibrary = [...movieLibrary];
    newLibrary[seriesIndex] = updatedSeries;
    setMovieLibrary(newLibrary);
    setCurrentMovie(updatedSeries);
  };

  const filteredLibrary = movieLibrary.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    movie.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (viewState === ViewState.PROFILE_SELECTION || !activeProfile) {
    return (
      <ProfileSelection 
        profiles={profiles} 
        onSelectProfile={handleSelectProfile} 
        onAddProfile={handleAddProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-lime-400 selection:text-black">
      {/* Toast Notification */}
      <div className={`fixed top-4 right-4 bg-lime-500 text-black px-4 py-2 rounded-lg shadow-lg z-[100] transition-all duration-500 flex items-center gap-2 font-bold ${showSaveNotification ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <Save size={18} /> Dados Salvos
      </div>

      {viewState !== ViewState.PLAYER && (
        <Navbar 
            onNavigate={setViewState} 
            currentView={viewState}
            currentProfile={activeProfile}
            onSwitchProfile={handleSwitchProfile}
            onSearch={setSearchQuery}
        />
      )}

      {viewState === ViewState.HOME && (
        <>
          {!searchQuery && (
            <Hero 
                movie={activeFeaturedMovie} 
                onPlay={handlePlay}
                isInList={activeProfile.myList.includes(activeFeaturedMovie.id)}
                isLiked={activeProfile.likes.includes(activeFeaturedMovie.id)}
                onToggleList={handleToggleMyList}
                onToggleLike={handleToggleLike}
            />
          )}
          
          <div className={`px-4 md:px-12 relative z-10 pb-20 space-y-12 ${searchQuery ? 'pt-24 min-h-screen' : '-mt-32'}`}>
            
            {searchQuery ? (
                <section>
                    <h2 className="text-2xl font-bold mb-6 text-white">Resultados para "{searchQuery}"</h2>
                    {filteredLibrary.length > 0 ? (
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredLibrary.map((movie) => (
                                <MovieCard 
                                    key={movie.id} 
                                    movie={movie} 
                                    profile={activeProfile}
                                    onPlay={handlePlay} 
                                    onToggleList={handleToggleMyList}
                                    onToggleLike={handleToggleLike}
                                    onDelete={handleDeleteMovie}
                                    onSetFeatured={handleSetFeatured}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-400">Nenhum título encontrado.</div>
                    )}
                </section>
            ) : (
                <>
                    {/* My List Section */}
                    {activeProfile.myList.length > 0 && (
                        <section>
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-white drop-shadow-md">
                            Lista de {activeProfile.name}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {movieLibrary
                                .filter(m => activeProfile.myList.includes(m.id))
                                .map((movie) => (
                                <MovieCard 
                                    key={movie.id} 
                                    movie={movie} 
                                    profile={activeProfile}
                                    onPlay={handlePlay} 
                                    onToggleList={handleToggleMyList}
                                    onToggleLike={handleToggleLike}
                                    onDelete={handleDeleteMovie}
                                    onSetFeatured={handleSetFeatured}
                                />
                            ))}
                        </div>
                        </section>
                    )}

                    {/* Trending Section */}
                    <section>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 text-white drop-shadow-md">Em Alta</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {movieLibrary.map((movie) => (
                        <MovieCard 
                            key={movie.id} 
                            movie={movie} 
                            profile={activeProfile}
                            onPlay={handlePlay} 
                            onToggleList={handleToggleMyList}
                            onToggleLike={handleToggleLike}
                            onDelete={handleDeleteMovie}
                            onSetFeatured={handleSetFeatured}
                        />
                        ))}
                    </div>
                    </section>

                    {/* Categories Mock */}
                    <section>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-300">Ficção Científica & Cyberpunk</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="min-w-[160px] aspect-[2/3] bg-zinc-800 rounded-md hover:scale-105 transition-transform cursor-pointer relative overflow-hidden group border border-zinc-800 hover:border-lime-400/50">
                                <img src={`https://picsum.photos/400/600?random=${i+10}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                <div className="absolute top-2 right-2 font-bold text-4xl text-black stroke-white drop-shadow-lg opacity-50 italic">#{i}</div>
                            </div>
                        ))}
                    </div>
                    </section>
                </>
            )}
          </div>
        </>
      )}

      {viewState === ViewState.PLAYER && currentMovie && (
        <VideoPlayer movie={currentMovie} onBack={handleBack} />
      )}

      {viewState === ViewState.SERIES_DETAILS && currentMovie && (
          <SeriesDetails 
            series={currentMovie} 
            onClose={() => setViewState(ViewState.HOME)} 
            onPlayEpisode={handlePlayEpisode}
            onDelete={handleDeleteMovie}
            onAddEpisodes={handleAddEpisodes}
            onSetFeatured={handleSetFeatured}
          />
      )}

      {viewState === ViewState.UPLOAD && (
        <UploadView onUpload={handleUpload} />
      )}

      {viewState !== ViewState.PLAYER && (
        <AiChat context={viewState === ViewState.UPLOAD ? "O usuário está fazendo upload de um vídeo." : `O usuário ${activeProfile.name} está navegando.`} />
      )}
    </div>
  );
};

// Subcomponent for Movie Cards - Portrait Mode
const MovieCard: React.FC<{
    movie: Movie; 
    profile: Profile;
    onPlay: (m: Movie) => void; 
    onToggleList: (m: Movie) => void;
    onToggleLike: (m: Movie) => void;
    onDelete: (e: React.MouseEvent, m: Movie) => void;
    onSetFeatured: (id: string) => void;
}> = ({ movie, profile, onPlay, onToggleList, onToggleLike, onDelete, onSetFeatured }) => {
    const isInList = profile.myList.includes(movie.id);
    const isLiked = profile.likes.includes(movie.id);
    const isSeries = movie.episodes && movie.episodes.length > 0;

    const hasValidThumbnail = movie.thumbnailUrl && (
        movie.thumbnailUrl.startsWith('http') || 
        movie.thumbnailUrl.startsWith('blob:') ||
        movie.thumbnailUrl.startsWith('data:')
    );

    return (
        <div 
        className="group relative aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-xl hover:shadow-black hover:ring-2 hover:ring-lime-400/50"
        onClick={() => onPlay(movie)}
        >
        {movie.isLocal && !hasValidThumbnail ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <div className="text-center">
                        <Play className="mx-auto mb-2 text-lime-400" />
                        <span className="text-xs text-gray-400">Vídeo Local</span>
                    </div>
                </div>
        ) : (
            <img 
                src={movie.thumbnailUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
        )}

        {isSeries && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold border border-gray-600 flex items-center gap-1 text-lime-400 shadow-lg">
                <Layers size={10} /> SÉRIE
            </div>
        )}
        
        {/* Hover Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <h3 className="font-bold text-sm text-white mb-1 leading-tight">{movie.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-300 mb-2">
                <span className="text-lime-400 font-bold">{movie.matchScore}%</span>
                <span>{isSeries ? `${movie.episodes?.length} Eps` : movie.duration}</span>
            </div>
            
            <div className="flex gap-2 justify-between items-center">
                <div className="flex gap-2">
                    <button className="bg-white text-black rounded-full p-1.5 hover:bg-lime-400 transition-colors" title="Assistir">
                        <Play size={12} fill="black" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleList(movie); }} 
                        className={`border rounded-full p-1.5 hover:bg-gray-800 ${isInList ? 'border-lime-500 text-lime-500' : 'border-gray-400 text-white'}`}
                        title={isInList ? "Remover da Lista" : "Adicionar à Lista"}
                    >
                        {isInList ? <Check size={12} /> : <Plus size={12} />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleLike(movie); }} 
                        className={`border rounded-full p-1.5 hover:bg-gray-800 ${isLiked ? 'border-blue-500 text-blue-500' : 'border-gray-400 text-white'}`}
                        title="Gostei"
                    >
                        <ThumbsUp size={12} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                </div>
                
                {/* Menu Action Dots / More */}
                <div className="flex gap-1">
                     <button
                        onClick={(e) => { e.stopPropagation(); onSetFeatured(movie.id); }}
                        className="text-gray-400 hover:text-yellow-400 p-1"
                        title="Definir como Destaque"
                    >
                        <Star size={12} />
                    </button>
                    <button
                        onClick={(e) => onDelete(e, movie)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Apagar"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
}

export default App;