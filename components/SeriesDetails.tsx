import React, { useState, useRef } from 'react';
import { X, Play, Clock, Calendar, Star, Trash2, Plus, Upload, Layers } from 'lucide-react';
import { Movie, Episode } from '../types';

interface SeriesDetailsProps {
  series: Movie;
  onClose: () => void;
  onPlayEpisode: (episode: Episode) => void;
  onDelete: (e: React.MouseEvent, movie: Movie) => void;
  onAddEpisodes: (seriesId: string, files: File[], seasonNumber: number) => void;
  onSetFeatured?: (id: string) => void;
}

const SeriesDetails: React.FC<SeriesDetailsProps> = ({ series, onClose, onPlayEpisode, onDelete, onAddEpisodes, onSetFeatured }) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'info'>('episodes');
  const [uploadMode, setUploadMode] = useState<'episode' | 'season'>('episode');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure we have episodes to map
  const episodes = series.episodes || [];

  // Determine the likely next season number based on the last episode
  const lastSeason = episodes.length > 0 ? Math.max(...episodes.map(e => e.season || 1)) : 1;

  const handleAddClick = (mode: 'episode' | 'season') => {
      setUploadMode(mode);
      fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Determine suggested season based on mode
      const suggestedSeason = uploadMode === 'season' ? lastSeason + 1 : lastSeason;
      
      const promptText = uploadMode === 'season' 
        ? `Iniciando a Temporada ${suggestedSeason}. Confirma o número da temporada?`
        : `Adicionando episódios à Temporada ${suggestedSeason}. Confirma o número?`;

      const seasonInput = window.prompt(promptText, suggestedSeason.toString());
      
      if (seasonInput !== null) {
          const seasonNumber = parseInt(seasonInput) || suggestedSeason;
          onAddEpisodes(series.id, files, seasonNumber);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-xl overflow-hidden shadow-2xl flex flex-col relative border border-zinc-800">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors"
        >
          <X size={24} />
        </button>

        {/* Hero Header - Increased Height */}
        <div className="relative h-80 sm:h-[450px] shrink-0 group">
          <div 
            className="absolute inset-0 bg-cover bg-top"
            style={{ backgroundImage: `url(${series.thumbnailUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-transparent to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-6 sm:p-10 w-full max-w-3xl">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-3 shadow-black drop-shadow-lg leading-tight">{series.title}</h2>
            
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
              <span className="text-lime-400 font-bold bg-black/40 px-2 py-0.5 rounded">{series.matchScore}% Match</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> {series.year}</span>
              <span className="border border-gray-600 px-1 rounded text-xs">{episodes.length} Eps</span>
              <span className="text-gray-400 border border-gray-700 bg-black/30 px-2 rounded-full">{series.genre}</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {episodes.length > 0 && (
                <button 
                  onClick={() => onPlayEpisode(episodes[0])}
                  className="bg-lime-400 text-black px-8 py-3 rounded font-bold hover:bg-lime-300 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                >
                  <Play fill="black" size={20} /> Assistir T1:E1
                </button>
              )}
               {onSetFeatured && (
                <button 
                  onClick={() => {
                      onSetFeatured(series.id);
                      onClose();
                  }}
                  className="bg-zinc-800/80 text-white border border-gray-600 px-6 py-3 rounded font-medium hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                >
                  <Star size={18} /> Destaque
                </button>
              )}
              <button 
                onClick={(e) => {
                    if (window.confirm("Apagar toda a série?")) {
                        onDelete(e, series);
                        onClose();
                    }
                }}
                className="bg-zinc-800/50 text-red-500 border border-red-500/30 px-4 py-3 rounded font-medium hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 px-6 sm:px-10 bg-zinc-900 sticky top-0 z-10">
          <button 
            onClick={() => setActiveTab('episodes')}
            className={`py-4 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'episodes' ? 'border-lime-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Episódios
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            className={`py-4 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'info' ? 'border-lime-500 text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Detalhes & Sinopse
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar bg-zinc-900">
          {activeTab === 'episodes' ? (
            <div className="space-y-4 pb-10">
              
              {/* Add Content Actions */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Button 1: Add to Current Season */}
                  <div 
                    onClick={() => handleAddClick('episode')}
                    className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-zinc-700 rounded-lg hover:border-lime-500 hover:bg-zinc-800/50 cursor-pointer transition-all text-gray-400 hover:text-white group"
                  >
                    <Plus size={24} className="group-hover:text-lime-400" />
                    <span className="font-bold text-sm sm:text-lg group-hover:text-lime-400">Add à Temp {lastSeason}</span>
                  </div>

                  {/* Button 2: New Season */}
                  <div 
                    onClick={() => handleAddClick('season')}
                    className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-zinc-700 rounded-lg hover:border-lime-500 hover:bg-zinc-800/50 cursor-pointer transition-all text-gray-400 hover:text-white group"
                  >
                    <Layers size={24} className="group-hover:text-lime-400" />
                    <span className="font-bold text-sm sm:text-lg group-hover:text-lime-400">Nova Temporada {lastSeason + 1}</span>
                  </div>

                  <input 
                      type="file" 
                      multiple 
                      accept="video/*" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileSelect}
                  />
              </div>

              {episodes.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhum episódio disponível.</p>
              ) : (
                episodes.map((ep, index) => (
                  <div 
                    key={ep.id} 
                    onClick={() => onPlayEpisode(ep)}
                    className="group flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-zinc-700"
                  >
                    <div className="relative w-full sm:w-48 aspect-video bg-zinc-950 rounded overflow-hidden shrink-0 shadow-lg">
                      <img src={ep.thumbnailUrl || series.thumbnailUrl} alt={ep.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-500" />
                      <div className="absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white z-10 border border-white/10">
                        T{ep.season || 1}:E{ep.number || index + 1}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Play size={32} className="text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg scale-75 group-hover:scale-100 duration-300" fill="currentColor" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-between mb-1">
                        <h4 className="font-bold text-white text-lg truncate group-hover:text-lime-400 transition-colors">{ep.title}</h4>
                        <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0 bg-zinc-800 px-2 py-0.5 rounded"><Clock size={12}/> {ep.duration}</span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{ep.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-8 max-w-3xl">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Sinopse</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{series.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-8 text-sm text-gray-400 p-6 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <div>
                   <span className="block text-gray-500 mb-1 uppercase tracking-wider text-xs">Gênero</span>
                   <span className="text-white text-lg">{series.genre}</span>
                </div>
                <div>
                   <span className="block text-gray-500 mb-1 uppercase tracking-wider text-xs">Avaliação IA</span>
                   <span className="text-lime-400 font-bold text-lg">{series.matchScore}/100</span>
                </div>
                <div>
                   <span className="block text-gray-500 mb-1 uppercase tracking-wider text-xs">Ano de Lançamento</span>
                   <span className="text-white text-lg">{series.year}</span>
                </div>
                 <div>
                   <span className="block text-gray-500 mb-1 uppercase tracking-wider text-xs">Total</span>
                   <span className="text-white text-lg">{episodes.length} Episódios</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SeriesDetails;