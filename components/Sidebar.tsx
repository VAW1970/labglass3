import React from 'react';

interface SidebarProps {
  threshold: number;
  setThreshold: (val: number) => void;
  onExampleClick: (url: string) => void;
  onShowBackendInfo: () => void;
  backendStatus: 'checking' | 'online' | 'offline';
}

// Arquivos locais solicitados (devem estar na pasta public/)
const EXAMPLES = [
  "Bequer3.jpeg",
  "Erlenmeyer7.jpeg",
  "Varios2.jpeg"
];

// Logo personalizado (opcional, deve estar na pasta public/)
const LOGO_SRC = "Taleh azul 3D ícone.png";

export const Sidebar: React.FC<SidebarProps> = ({ threshold, setThreshold, onExampleClick, onShowBackendInfo, backendStatus }) => {
  return (
    <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full sticky top-0 overflow-y-auto z-10">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          {/* Tenta carregar o logo personalizado, fallback para emoji se falhar (pode usar onError em img real, mas aqui simplificado) */}
          <div className="w-12 h-12 flex-shrink-0">
             <img 
               src={LOGO_SRC} 
               alt="Logo" 
               className="w-full h-full object-contain"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
               }}
             />
             <div className="hidden w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-200">
               🔭
             </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Vidraria Lab <br/><span className="text-sm font-normal text-slate-500">Detector AI</span></h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
           <div className={`w-2 h-2 rounded-full ${
               backendStatus === 'online' ? 'bg-green-500 animate-pulse' : 
               backendStatus === 'offline' ? 'bg-red-500' : 'bg-slate-300'
           }`}></div>
           <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
               {backendStatus === 'online' ? 'Sistema Online' : 
                backendStatus === 'offline' ? 'Servidor Offline' : 'Conectando...'}
           </p>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* Controles */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Controles de Detecção</h3>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Nível de Confiança</label>
              <span className="text-sm font-bold text-cyan-600">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Ajustar este controle filtra detecções com pontuações de confiança mais baixas.
            </p>
          </div>
        </div>

        {/* Exemplos */}
        <div>
           <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Imagens de Exemplo</h3>
           <div className="grid grid-cols-3 gap-2">
             {EXAMPLES.map((url, idx) => (
               <button 
                 key={idx}
                 onClick={() => onExampleClick(url)}
                 className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-100"
                 title={`Carregar ${url}`}
               >
                 <img 
                    src={url} 
                    alt={`Exemplo ${idx}`} 
                    className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                        // Fallback visual se a imagem não for encontrada
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerText = 'Img?';
                        e.currentTarget.parentElement!.classList.add('text-xs', 'text-slate-400', 'flex', 'items-center', 'justify-center');
                    }}
                 />
               </button>
             ))}
           </div>
           {backendStatus === 'offline' && (
               <p className="text-[10px] text-red-400 mt-2">Necessário servidor rodando para processar.</p>
           )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
             <span className="text-2xl">⚡</span>
             <div>
               <h4 className="font-semibold text-blue-900 text-sm">Aceleração GPU</h4>
               <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                 Modelo treinado no Google Colab usando Torchvision Faster R-CNN.
               </p>
             </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
         <button 
           onClick={onShowBackendInfo}
           className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
         >
           <span>🖥️</span> Configurar Servidor
         </button>
         <p className="text-center text-[10px] text-slate-400 mt-1">Frontend React • Compatível com Flask</p>
      </div>
    </aside>
  );
};