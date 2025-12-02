import React, { useState, useRef } from 'react';
import { Upload, Film, Wand2, Loader2, Play, Tv, FileVideo, X, Image as ImageIcon, Globe, Link as LinkIcon } from 'lucide-react';
import { Movie, Episode } from '../types';
import { generateMovieMetadata } from '../services/geminiService';

interface UploadViewProps {
  onUpload: (movies: Movie[]) => void;
}

type UploadType = 'movie' | 'series' | 'external';

const UploadView: React.FC<UploadViewProps> = ({ onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadType, setUploadType] = useState<UploadType>('movie');
  const [userNotes, setUserNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // External Link State
  const [externalUrl, setExternalUrl] = useState('');
  const [externalTitle, setExternalTitle] = useState('');
  const [externalThumb, setExternalThumb] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      if (uploadType === 'movie') {
        setFiles([selectedFiles[0]]);
      } else {
        setFiles(prev => [...prev, ...selectedFiles]);
      }
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleGenerateMetadata = async () => {
    if (uploadType !== 'external' && files.length === 0) return;
    if (uploadType === 'external' && (!externalUrl || !externalTitle)) return;
    
    setIsGenerating(true);
    
    // Determine thumbnail URL
    const customThumbnailUrl = coverFile ? URL.createObjectURL(coverFile) : null;
    const defaultThumbnailUrl = 'https://picsum.photos/800/450?grayscale';
    
    const newMovies: Movie[] = [];

    if (uploadType === 'external') {
        // Handling External Link (Jefflix.com.br Domain Simulation)
        newMovies.push({
            id: `ext-${Date.now()}`,
            title: externalTitle,
            description: userNotes || "Conteúdo adicionado via Link Externo (Jefflix.com.br).",
            genre: "Web / Online",
            matchScore: 100,
            year: new Date().getFullYear(),
            duration: 'Online',
            thumbnailUrl: externalThumb || defaultThumbnailUrl,
            videoUrl: externalUrl,
            isLocal: false // External links persist in localStorage
        });
    } else {
        // Handling Local Files
        const metadata = await generateMovieMetadata(files[0].name, userNotes, uploadType);
        const finalThumbnailUrl = customThumbnailUrl || defaultThumbnailUrl;

        if (uploadType === 'series') {
            const seriesId = `local-series-${Date.now()}`;
            const episodes: Episode[] = files.map((file, index) => {
                 const objectUrl = URL.createObjectURL(file);
                 return {
                    id: `${seriesId}-ep-${index}`,
                    title: `${metadata.title} - Episódio ${index + 1}`,
                    description: `Episódio ${index + 1} da série ${metadata.title}.`,
                    thumbnailUrl: finalThumbnailUrl,
                    videoUrl: objectUrl,
                    duration: '45m',
                    season: 1,
                    number: index + 1
                 };
            });

            newMovies.push({
                id: seriesId,
                title: metadata.title,
                description: metadata.description,
                genre: metadata.genre,
                matchScore: metadata.matchScore || 85,
                year: new Date().getFullYear(),
                duration: `${files.length} Episódios`,
                thumbnailUrl: finalThumbnailUrl,
                videoUrl: '',
                isLocal: true,
                episodes: episodes
            });

        } else {
            const objectUrl = URL.createObjectURL(files[0]);
            newMovies.push({
                id: `local-movie-${Date.now()}`,
                title: metadata.title,
                description: metadata.description,
                genre: metadata.genre,
                matchScore: metadata.matchScore || 85,
                year: new Date().getFullYear(),
                duration: 'Filme',
                thumbnailUrl: finalThumbnailUrl,
                videoUrl: objectUrl,
                isLocal: true
            });
        }
    }

    onUpload(newMovies);
    setIsGenerating(false);
    
    // Reset Fields
    setFiles([]);
    setExternalUrl('');
    setExternalTitle('');
    setUserNotes('');
    setCoverFile(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (uploadType === 'external') return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
           const droppedFiles = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('video/'));
           if (droppedFiles.length > 0) {
             if (uploadType === 'movie') {
                 setFiles([droppedFiles[0]]);
             } else {
                 setFiles(prev => [...prev, ...droppedFiles]);
             }
           }
      }
  }

  const toggleType = (type: UploadType) => {
      setUploadType(type);
      setFiles([]);
  }

  return (
    <div className="pt-24 px-4 md:px-12 min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Upload className="text-lime-400" /> Adicionar à Minha Lista
        </h1>

        {/* Category Selection */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            <button 
                onClick={() => toggleType('movie')}
                className={`flex-1 min-w-[120px] py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${uploadType === 'movie' ? 'border-lime-500 bg-lime-500/10 text-white shadow-[0_0_15px_rgba(163,230,53,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
                <Film size={32} className={uploadType === 'movie' ? 'text-lime-400' : ''} />
                <span className="font-bold">Filme</span>
                <span className="text-xs opacity-70">Arquivo Local</span>
            </button>
            <button 
                onClick={() => toggleType('series')}
                className={`flex-1 min-w-[120px] py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${uploadType === 'series' ? 'border-lime-500 bg-lime-500/10 text-white shadow-[0_0_15px_rgba(163,230,53,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
                <Tv size={32} className={uploadType === 'series' ? 'text-lime-400' : ''} />
                <span className="font-bold">Série</span>
                <span className="text-xs opacity-70">Múltiplos Eps</span>
            </button>
            <button 
                onClick={() => toggleType('external')}
                className={`flex-1 min-w-[120px] py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${uploadType === 'external' ? 'border-lime-500 bg-lime-500/10 text-white shadow-[0_0_15px_rgba(163,230,53,0.2)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
            >
                <Globe size={32} className={uploadType === 'external' ? 'text-lime-400' : ''} />
                <span className="font-bold">Link Online</span>
                <span className="text-xs opacity-70">jefflix.com.br</span>
            </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Upload/Input Area */}
          <div className="space-y-6">
            
            {uploadType === 'external' ? (
                // External Link Inputs
                <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <LinkIcon className="text-lime-400" /> Detalhes do Link
                    </h2>
                    
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Título do Vídeo</label>
                        <input 
                            type="text" 
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-lime-400 outline-none"
                            placeholder="Ex: Tutorial Exclusivo"
                            value={externalTitle}
                            onChange={(e) => setExternalTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">URL do Vídeo (MP4, MKV, WebM)</label>
                        <input 
                            type="text" 
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-lime-400 outline-none font-mono text-sm"
                            placeholder="https://www.jefflix.com.br/video.mp4"
                            value={externalUrl}
                            onChange={(e) => setExternalUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">URL da Capa (Opcional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-lime-400 outline-none font-mono text-sm"
                            placeholder="https://..."
                            value={externalThumb}
                            onChange={(e) => setExternalThumb(e.target.value)}
                        />
                    </div>
                    
                    <div className="p-3 bg-blue-900/20 border border-blue-900/50 rounded text-xs text-blue-200">
                        <strong>Dica:</strong> Links adicionados aqui ficam salvos no seu perfil mesmo se você atualizar a página.
                    </div>
                </div>
            ) : (
                // Local File Dropzone
                <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center h-64 transition-colors ${files.length > 0 ? 'border-lime-500 bg-lime-900/10' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900'}`}
                >
                <Upload className={`w-16 h-16 mb-4 ${files.length > 0 ? 'text-lime-400' : 'text-zinc-500'}`} />
                <p className="text-lg font-medium mb-2">
                    {uploadType === 'movie' ? 'Arraste seu filme aqui' : 'Arraste seus episódios aqui'}
                </p>
                <p className="text-sm text-gray-500 mb-4">Suporta MP4, WebM até 10GB</p>
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-lime-500 hover:bg-lime-400 text-black px-6 py-2 rounded font-bold transition-colors"
                >
                    Selecionar Arquivo{uploadType === 'series' && 's'}
                </button>
                
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="video/*" 
                    multiple={uploadType === 'series'}
                    className="hidden" 
                    onChange={handleFileSelect}
                />
                </div>
            )}

            {/* Custom Cover Upload Section (Only for local files or if external wants manual upload override, but keeping simple for now) */}
            {uploadType !== 'external' && (
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-start gap-6">
                    <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="w-24 aspect-[2/3] shrink-0 bg-zinc-950 rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors overflow-hidden relative group"
                    >
                        {coverFile ? (
                            <>
                                <img 
                                    src={URL.createObjectURL(coverFile)} 
                                    alt="Cover preview" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] text-white font-bold">TROCAR</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="text-zinc-500 mb-2 w-6 h-6" />
                                <span className="text-[10px] text-zinc-500 text-center px-1 leading-tight">Capa (Vertical)</span>
                            </>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-200 mb-1">Capa do {uploadType === 'movie' ? 'Filme' : 'Seriado'}</h3>
                        <p className="text-xs text-gray-500 mb-3">
                            Envie uma imagem JPG ou PNG (Vertical/Poster) para ser usada como capa na sua biblioteca.
                        </p>
                        <button 
                            onClick={() => coverInputRef.current?.click()}
                            className="text-xs border border-zinc-600 px-3 py-1.5 rounded hover:bg-zinc-800 transition-colors text-white"
                        >
                            Escolher Imagem
                        </button>
                        <input 
                            ref={coverInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleCoverSelect}
                        />
                    </div>
                </div>
            )}

            {/* AI Context Input */}
            {(files.length > 0 || uploadType === 'external') && (
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2 mb-4 text-purple-400">
                  <Wand2 size={20} />
                  <h3 className="font-bold">{uploadType === 'external' ? 'Descrição / Notas' : 'Melhoria com IA Jefflix'}</h3>
                </div>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder={uploadType === 'external' ? "Adicione uma descrição para este link..." : "Descreva o conteúdo para a IA gerar metadados..."}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-purple-500 outline-none h-24 resize-none"
                />
              </div>
            )}
          </div>

          {/* Right Column: Files List & Action */}
          <div className="space-y-6 flex flex-col h-full">
            <h2 className="text-xl font-semibold text-gray-300 flex justify-between items-center">
                <span>{uploadType === 'external' ? 'Resumo' : 'Arquivos Selecionados'}</span>
                {uploadType !== 'external' && <span className="text-sm text-gray-500">{files.length} arquivo(s)</span>}
            </h2>
            
            <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                {uploadType === 'external' ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <Globe size={48} className={`mb-4 ${externalUrl ? 'text-lime-400' : 'text-zinc-700'}`} />
                        {externalTitle ? (
                            <div className="w-full">
                                <h3 className="font-bold text-lg text-white mb-1">{externalTitle}</h3>
                                <p className="text-xs text-gray-500 truncate">{externalUrl}</p>
                                {externalThumb && <img src={externalThumb} className="mt-4 w-24 h-36 object-cover mx-auto rounded border border-zinc-700" alt="Preview" />}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm">Preencha os dados do link ao lado para visualizar o resumo.</p>
                        )}
                     </div>
                ) : (
                    files.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                            <FileVideo size={48} className="opacity-20 mb-2" />
                            <span className="text-sm">Nenhum arquivo na fila</span>
                        </div>
                    ) : (
                        <div className="overflow-y-auto max-h-[400px] p-2 space-y-2 no-scrollbar">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-zinc-950 p-3 rounded border border-zinc-800">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-zinc-800 p-2 rounded text-lime-400">
                                            <Play size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate text-white">{file.name}</p>
                                            <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFile(idx)} className="text-zinc-500 hover:text-red-500 p-2">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <button
              onClick={handleGenerateMetadata}
              disabled={isGenerating || (uploadType !== 'external' && files.length === 0) || (uploadType === 'external' && !externalTitle)}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                isGenerating || (uploadType !== 'external' && files.length === 0) || (uploadType === 'external' && !externalTitle)
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-lime-500 to-emerald-600 text-black hover:opacity-90 shadow-lg shadow-lime-900/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <Wand2 size={20} /> 
                  {uploadType === 'external' ? 'Salvar Link' : `Adicionar ${files.length > 1 ? 'Série' : 'Filme'}`}
                </>
              )}
            </button>
             <p className="text-xs text-center text-zinc-500">
                {uploadType === 'external' 
                    ? 'Links externos são de responsabilidade do provedor de hospedagem.' 
                    : 'Arquivos grandes são processados localmente. Metadados gerados via API Gemini.'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadView;