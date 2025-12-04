import React, { useRef, useState, useEffect } from 'react';
import { Detection } from '../types';
import { LABELS_PT } from '../constants';

interface ImageDisplayProps {
  imageSrc: string | null;
  detections: Detection[];
  threshold: number;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageSrc, detections, threshold }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // Precisamos das dimensões naturais da imagem para mapear as bounding boxes corretamente
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  // Resetar tamanho natural quando a fonte da imagem mudar
  useEffect(() => {
    setNaturalSize({ w: 0, h: 0 });
  }, [imageSrc]);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setNaturalSize({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight
      });
    }
  };

  // Filtrar com base no threshold novamente (segurança dupla)
  const visibleDetections = detections.filter(d => d.score >= threshold);

  if (!imageSrc) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>Nenhuma imagem selecionada</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-slate-900 group">
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Conteúdo analisado"
        className="w-full h-auto block"
        onLoad={handleImageLoad}
      />
      
      {/* Camada de Overlay SVG */}
      {naturalSize.w > 0 && (
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`} 
          preserveAspectRatio="none" 
        >
          {visibleDetections.map((det) => {
             // Traduzir label se possível
             const displayLabel = LABELS_PT[det.label] || det.label;

             return (
              <g key={det.id}>
                <rect
                  x={det.box.x1}
                  y={det.box.y1}
                  width={det.box.x2 - det.box.x1}
                  height={det.box.y2 - det.box.y1}
                  fill="none"
                  strokeWidth={Math.max(3, naturalSize.w / 200)} // Escalar traço baseado no tamanho
                  className="stroke-cyan-400 drop-shadow-md animate-pulse" 
                  strokeDasharray={`${Math.max(10, naturalSize.w/80)},${Math.max(5, naturalSize.w/160)}`}
                />
                <text
                  x={det.box.x1}
                  y={det.box.y1 - (naturalSize.h * 0.02)}
                  fill="#22d3ee" // Cyan-400
                  fontSize={Math.max(16, naturalSize.w / 40)} // Escalar fonte
                  fontWeight="bold"
                  className="drop-shadow-md"
                  style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {displayLabel} ({det.score.toFixed(2)})
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};