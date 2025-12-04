import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ImageDisplay } from './components/ImageDisplay';
import { ResultsPanel } from './components/ResultsPanel';
import { BackendScriptModal } from './components/BackendScriptModal';
import { Detection } from './types';
import { analyzeImage, checkBackendHealth } from './services/api';

const App: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(0.6);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showBackendInfo, setShowBackendInfo] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Checar status do backend ao montar
  useEffect(() => {
    const checkStatus = async () => {
      const isOnline = await checkBackendHealth();
      setBackendStatus(isOnline ? 'online' : 'offline');
    };
    checkStatus();
    
    // Opcional: Polling a cada 10 segundos
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar detecções localmente quando o threshold muda para feedback imediato
  const visibleDetections = detections.filter(d => d.score >= threshold);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      
      // Criar preview
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Acionar análise
      processImage(file);
    }
  };

  const handleExampleClick = async (url: string) => {
    setIsProcessing(true);
    setImagePreview(url);
    setError(null);
    // Fetch blob da url para simular upload de arquivo
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Imagem não encontrada");
        const blob = await response.blob();
        
        // Tenta extrair o nome do arquivo da URL (ex: "Bequer3.jpeg")
        const fileName = url.split('/').pop() || "exemplo.jpg";
        
        const file = new File([blob], fileName, { type: "image/jpeg" });
        setSelectedFile(file);
        processImage(file);
    } catch (err) {
        console.error("Erro ao carregar exemplo", err);
        setError(`Falha ao carregar a imagem "${url}". Certifique-se de que ela está na pasta pública.`);
        setIsProcessing(false);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setDetections([]); // Limpar anteriores
    setError(null);
    
    try {
      const result = await analyzeImage(file);
      setDetections(result.detections);
      setBackendStatus('online'); // Se sucesso, está online
    } catch (error: any) {
      console.error("Erro ao analisar imagem:", error);
      setError(error.message || "Falha ao analisar imagem.");
      setBackendStatus('offline'); // Se falha de rede, provavelmente offline
      
      // Mostrar info do backend automaticamente se a conexão falhar
      if (error.message.includes("Could not connect") || error.message.includes("Não foi possível conectar")) {
         setShowBackendInfo(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Limpar object URL
  useEffect(() => {
    return () => {
      if (imagePreview && selectedFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, selectedFile]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        threshold={threshold} 
        setThreshold={setThreshold} 
        onExampleClick={handleExampleClick}
        onShowBackendInfo={() => setShowBackendInfo(true)}
        backendStatus={backendStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Action Area */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Nova Análise</h2>
              <p className="text-slate-500 mt-1">Carregue uma imagem de laboratório para detectar vidrarias.</p>
            </div>
            
            <label className={`relative cursor-pointer group ${backendStatus === 'offline' ? 'opacity-70' : ''}`}>
               <div className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-cyan-200 group-hover:bg-cyan-700 group-hover:shadow-cyan-300 transition-all flex items-center gap-2">
                 <span>📂 Carregar Imagem</span>
               </div>
               <input 
                 type="file" 
                 accept="image/png, image/jpeg" 
                 onChange={handleFileChange} 
                 className="hidden" 
                 disabled={backendStatus === 'offline'}
               />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
               <span>⚠️</span>
               <div className="flex-1">
                  <p className="font-bold">Erro</p>
                  <p className="text-sm">{error}</p>
               </div>
               <button 
                 onClick={() => setShowBackendInfo(true)}
                 className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg font-bold transition-colors"
               >
                 Ver Solução
               </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Image Visualization */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-slate-700">Resultado Visual</h3>
                 {imagePreview && (
                   <span className="text-xs font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">
                     {selectedFile?.name || "imagem.jpg"}
                   </span>
                 )}
              </div>
              <ImageDisplay 
                imageSrc={imagePreview} 
                detections={detections} 
                threshold={threshold}
              />
            </div>

            {/* Right Column: Data & Insights */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700">Dados da Detecção</h3>
              <ResultsPanel 
                detections={visibleDetections} 
                isLoading={isProcessing} 
              />
            </div>
          </div>
        </div>
      </main>

      {/* Backend Script Modal */}
      {showBackendInfo && (
        <BackendScriptModal onClose={() => setShowBackendInfo(false)} />
      )}
    </div>
  );
};

export default App;