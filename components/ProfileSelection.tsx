import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Profile } from '../types';

interface ProfileSelectionProps {
  profiles: Profile[];
  onSelectProfile: (profileId: string) => void;
  onAddProfile: (name: string) => void;
}

const ProfileSelection: React.FC<ProfileSelectionProps> = ({ profiles, onSelectProfile, onAddProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleCreate = () => {
    if (newProfileName.trim()) {
      onAddProfile(newProfileName.trim());
      setNewProfileName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 text-white">Quem está assistindo?</h1>
      
      <div className="flex flex-wrap justify-center gap-8 px-4">
        {profiles.map((profile) => (
          <div 
            key={profile.id}
            onClick={() => onSelectProfile(profile.id)}
            className="group flex flex-col items-center cursor-pointer gap-4 w-32"
          >
            <div className="w-32 h-32 rounded-md overflow-hidden border-2 border-transparent group-hover:border-lime-400 transition-all">
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-gray-400 group-hover:text-white text-lg transition-colors">{profile.name}</span>
          </div>
        ))}

        {profiles.length < 4 && (
          !isAdding ? (
            <div 
              onClick={() => setIsAdding(true)}
              className="group flex flex-col items-center cursor-pointer gap-4 w-32"
            >
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-transparent group-hover:bg-white transition-colors">
                <PlusCircle className="w-20 h-20 text-gray-400 group-hover:text-gray-800" />
              </div>
              <span className="text-gray-400 group-hover:text-white text-lg transition-colors">Adicionar Perfil</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-48">
              <div className="w-32 h-32 rounded-md bg-zinc-800 flex items-center justify-center">
                <span className="text-3xl">?</span>
              </div>
              <input
                type="text"
                placeholder="Nome"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                autoFocus
                className="w-full bg-zinc-800 text-white px-3 py-1 rounded border border-zinc-600 focus:border-lime-400 outline-none text-center"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleCreate}
                  className="bg-lime-500 text-black font-bold px-4 py-1 rounded text-sm hover:bg-lime-400"
                >
                  Salvar
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="border border-gray-500 text-gray-400 px-4 py-1 rounded text-sm hover:border-white hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <button className="mt-16 border border-gray-500 text-gray-500 px-8 py-2 tracking-widest hover:border-white hover:text-white transition-all uppercase text-sm">
        Gerenciar Perfis
      </button>
    </div>
  );
};

export default ProfileSelection;