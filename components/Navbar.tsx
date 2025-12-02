import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, Upload, LogOut, Share2, Check } from 'lucide-react';
import { ViewState, Profile } from '../types';

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  currentProfile: Profile | null;
  onSwitchProfile: () => void;
  onSearch: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, currentProfile, onSwitchProfile, onSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showShareFeedback, setShowShareFeedback] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      onSearch(''); // Clear search when closing
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try Modern API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      // Fallback for older browsers or HTTP
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (e) {
        console.error('Copy failed', e);
        return false;
      }
    }
  };

  const handleShare = async () => {
    // Definindo o domínio oficial para compartilhamento
    const officialUrl = 'https://www.jefflix.com.br';
    
    const shareData = {
      title: 'Jefflix | www.jefflix.com.br',
      text: 'Assista seus vídeos favoritos no Jefflix! Acesse agora:',
      url: officialUrl,
    };

    // 1. Try Native Share (Mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return; // Success, stop here
      } catch (err) {
        console.log('User closed share dialog or error, falling back to copy');
        // If native share fails (user cancels), we continue to copy logic below
      }
    }

    // 2. Fallback to Copy Link
    const success = await copyToClipboard(officialUrl);
    
    if (success) {
      setShowShareFeedback(true);
      setTimeout(() => setShowShareFeedback(false), 2000);
    } else {
      // Last resort: Alert the user
      prompt('Copie o link oficial:', officialUrl);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-zinc-950' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="px-4 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo - Agora em Verde Limão */}
          <button onClick={() => onNavigate(ViewState.HOME)} className="text-3xl font-bold text-lime-400 tracking-tighter uppercase cursor-pointer hover:scale-105 transition-transform shadow-lime-400/20 drop-shadow-sm flex flex-col items-start leading-none">
            Jefflix
            <span className="text-[10px] tracking-widest text-white opacity-60 font-normal">.COM.BR</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-200">
            <button onClick={() => onNavigate(ViewState.HOME)} className={`hover:text-lime-300 transition-colors ${currentView === ViewState.HOME ? 'text-white font-bold' : ''}`}>Início</button>
            <button className="hover:text-lime-300 transition-colors">Séries</button>
            <button className="hover:text-lime-300 transition-colors">Filmes</button>
            <button className="hover:text-lime-300 transition-colors">Bombando</button>
            <button onClick={() => onNavigate(ViewState.UPLOAD)} className={`flex items-center gap-2 hover:text-lime-300 transition-colors ${currentView === ViewState.UPLOAD ? 'text-lime-400 font-bold' : ''}`}>
              <Upload size={16} />
              Minha Lista (Upload)
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6 text-gray-200">
          
          {/* Search Bar */}
          <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'bg-black/80 border border-gray-600 px-3 py-1 rounded-full focus-within:border-lime-400' : ''}`}>
            <button onClick={toggleSearch} className="hover:text-white transition-colors">
              <Search size={20} />
            </button>
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Títulos, gente, gêneros..."
              className={`bg-transparent border-none outline-none text-white text-sm ml-2 transition-all duration-300 ${isSearchOpen ? 'w-48 sm:w-64 opacity-100' : 'w-0 opacity-0'}`}
              onChange={(e) => onSearch(e.target.value)}
              onBlur={() => !searchInputRef.current?.value && setIsSearchOpen(false)}
            />
          </div>

          <button onClick={handleShare} className="hidden sm:block hover:text-lime-400 transition-colors relative" title="Compartilhar Jefflix.com.br">
            {showShareFeedback ? <Check size={20} className="text-lime-400" /> : <Share2 size={20} />}
            {showShareFeedback && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-lime-500 text-black px-1 rounded whitespace-nowrap font-bold">Link Copiado!</span>}
          </button>

          <button className="hidden sm:block hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img 
                src={currentProfile?.avatarUrl || "https://picsum.photos/200"} 
                alt="Profile" 
                className="w-8 h-8 rounded border border-transparent group-hover:border-lime-400 transition-all"
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-gray-700 rounded shadow-xl py-2 flex flex-col">
                <div className="px-4 py-2 border-b border-gray-700 text-sm text-gray-300">
                  Olá, {currentProfile?.name}
                </div>
                <button 
                  onClick={() => { onSwitchProfile(); setIsProfileMenuOpen(false); }}
                  className="px-4 py-3 hover:bg-gray-800 text-left text-sm flex items-center gap-2 transition-colors hover:text-lime-400"
                >
                  <LogOut size={16} /> Trocar Perfil
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 px-4 py-4 flex flex-col gap-4 text-gray-300 border-t border-zinc-800">
          <button onClick={() => { onNavigate(ViewState.HOME); setIsMobileMenuOpen(false); }} className="hover:text-white">Início</button>
          <button className="hover:text-white">Séries</button>
          <button className="hover:text-white">Filmes</button>
          <button onClick={() => { onNavigate(ViewState.UPLOAD); setIsMobileMenuOpen(false); }} className="hover:text-white flex items-center gap-2">
            <Upload size={16} /> Enviar Vídeo
          </button>
          <button onClick={handleShare} className="hover:text-lime-400 flex items-center gap-2">
             <Share2 size={16} /> Compartilhar Jefflix
          </button>
          <button onClick={() => { onSwitchProfile(); setIsMobileMenuOpen(false); }} className="hover:text-white text-lime-400 flex items-center gap-2">
             <LogOut size={16} /> Trocar Perfil
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;