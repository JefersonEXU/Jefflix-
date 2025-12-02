import React, { useState } from 'react';
import { Play, Info, Plus, Check, ThumbsUp } from 'lucide-react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  isInList: boolean;
  isLiked: boolean;
  onToggleList: (movie: Movie) => void;
  onToggleLike: (movie: Movie) => void;
}

const Hero: React.FC<HeroProps> = ({ movie, onPlay, isInList, isLiked, onToggleList, onToggleLike }) => {
  return (
    <div className="relative h-[90vh] w-full group">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-105"
        style={{ backgroundImage: `url(${movie.thumbnailUrl})` }}
      >
        {/* Gradient Overlay - Stronger at bottom/left to protect text */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/30 to-transparent" />
      </div>

      {/* Content - Aligned to Bottom Left now */}
      <div className="absolute inset-0 flex items-end px-4 md:px-12 pb-32">
        <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-lime-400/20 backdrop-blur-md text-lime-400 text-xs font-bold px-3 py-1 rounded border border-lime-400/50">
                <span className="animate-pulse">●</span> DESTAQUE DO MÊS
            </div>
          <h1 className="text-5xl md:text-8xl font-bold text-white drop-shadow-2xl leading-tight tracking-tight">
            {movie.title}
          </h1>
          
          <div className="flex items-center gap-4 text-base font-medium text-gray-200">
            <span className="text-lime-400 font-bold bg-black/50 px-2 py-0.5 rounded">{movie.matchScore}% Relevância</span>
            <span>{movie.year}</span>
            <span className="border border-gray-400 px-1.5 rounded text-xs bg-black/30">4K Ultra HD</span>
            <span>{movie.episodes ? `${movie.episodes.length} Episódios` : movie.duration}</span>
          </div>

          <p className="text-lg md:text-xl text-gray-300 line-clamp-3 drop-shadow-md max-w-2xl">
            {movie.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={() => onPlay(movie)}
              className="flex items-center gap-3 bg-lime-400 text-black px-8 py-4 rounded hover:bg-lime-300 transition-all hover:scale-105 font-bold text-xl shadow-[0_0_20px_rgba(163,230,53,0.4)]"
            >
              <Play fill="black" size={28} /> Assistir
            </button>
            <button className="hidden sm:flex items-center gap-3 bg-zinc-800/80 text-white px-8 py-4 rounded hover:bg-zinc-700 transition-colors font-bold text-lg backdrop-blur-md border border-zinc-600">
              <Info size={28} /> Mais Info
            </button>
            
            <button 
              onClick={() => onToggleList(movie)}
              className={`p-4 rounded-full border-2 transition-all hover:bg-white/10 active:scale-95 ${isInList ? 'border-lime-500 text-lime-500 bg-lime-500/10' : 'border-gray-400 text-gray-200'}`}
              title={isInList ? "Remover da Minha Lista" : "Adicionar à Minha Lista"}
            >
              {isInList ? <Check size={24} /> : <Plus size={24} />}
            </button>

            <button 
              onClick={() => onToggleLike(movie)}
              className={`p-4 rounded-full border-2 transition-all hover:bg-white/10 active:scale-95 ${isLiked ? 'border-lime-500 text-lime-500 bg-lime-500/10' : 'border-gray-400 text-gray-200'}`}
              title={isLiked ? "Gostei" : "Gostar"}
            >
              <ThumbsUp size={24} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;