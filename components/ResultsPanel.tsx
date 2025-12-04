import React, { useState } from 'react';
import { Detection } from '../types';
import { getGlasswareExplanation } from '../services/geminiService';
import { CLASS_COLORS, LABELS_PT } from '../constants';

interface ResultsPanelProps {
  detections: Detection[];
  isLoading: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ detections, isLoading }) => {
  const [explanation, setExplanation] = useState<{ id: string, text: string } | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);

  const handleExplain = async (det: Detection) => {
    if (loadingExplanation) return;
    setLoadingExplanation(det.id);
    const text = await getGlasswareExplanation(det.label);
    setExplanation({ id: det.id, text });
    setLoadingExplanation(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Processando rede neural...</p>
        <p className="text-xs text-slate-400 mt-2">Enviando dados para o backend</p>
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
            <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900">Nenhuma detecção</h3>
        <p className="text-slate-500 mt-1 max-w-xs">
          Tente diminuir o nível de confiança ou enviar uma imagem de vidraria mais clara.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Itens Detectados</h2>
        <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full font-bold">
          {detections.length} Encontrados
        </span>
      </div>
      
      <div className="divide-y divide-slate-100">
        {detections.map((det) => {
          const colorClass = CLASS_COLORS[det.label] || CLASS_COLORS["default"];
          const isExplaining = loadingExplanation === det.id;
          const currentExplanation = explanation?.id === det.id ? explanation.text : null;
          const displayLabel = LABELS_PT[det.label] || det.label;

          return (
            <div key={det.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${colorClass}`}>
                        {displayLabel}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                        Conf: {(det.score * 100).toFixed(1)}%
                    </span>
                </div>
                <button
                    onClick={() => handleExplain(det)}
                    disabled={!!loadingExplanation}
                    className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none disabled:opacity-50"
                >
                    {isExplaining ? (
                        <span className="animate-pulse">Pensando...</span>
                    ) : (
                        <>
                           <span>✨ Perguntar à IA</span>
                        </>
                    )}
                </button>
              </div>

              {currentExplanation && (
                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                      <p><strong>Gemini:</strong> {currentExplanation}</p>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};