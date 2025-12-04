import React, { useState } from 'react';

interface BackendScriptModalProps {
  onClose: () => void;
}

type TabType = 'python' | 'requirements' | 'procfile';

export const BackendScriptModal: React.FC<BackendScriptModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('python');
  const [copied, setCopied] = useState(false);

  const pythonCode = `import os
import torch
import torchvision
from torchvision import transforms
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io

# ==============================================================================
# CONFIGURAÇÕES DO SERVIDOR
# ==============================================================================
app = Flask(__name__)
# Habilita CORS para todas as rotas e origens
CORS(app, resources={r"/*": {"origins": "*"}}) 

DEVICE = torch.device('cpu') 

# Caminho do modelo (Tenta o caminho original ou fallback local)
PATH_MODELO_ORIGINAL = "IA/Glassware/Github/modelo_labglassware.pth"
PATH_MODELO_LOCAL = "modelo_labglassware.pth"

CLASSES = [
    "background",
    "beaker",
    "compass",
    "digital_balance",
    "erlenmeyer_flask",
    "funnel",
    "graduated_cylinder",
    "horseshoe_magnet",
    "objects",
    "stirring_rod",
    "test_tube",
    "test_tube_rack",
    "thermometer",
]

model = None

def load_detection_model():
    """Carrega o modelo Faster R-CNN."""
    global model
    try:
        print("Instanciando arquitetura Faster R-CNN...")
        m = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights=None, num_classes=len(CLASSES))
        
        path = PATH_MODELO_LOCAL
        if os.path.exists(PATH_MODELO_ORIGINAL):
            path = PATH_MODELO_ORIGINAL
        elif not os.path.exists(path):
            print(f"ERRO: Modelo não encontrado em {PATH_MODELO_ORIGINAL} ou {PATH_MODELO_LOCAL}")
            return None

        print(f"Carregando pesos de: {path}")
        m.load_state_dict(torch.load(path, map_location=DEVICE))
        m.to(DEVICE)
        m.eval()
        print("Modelo carregado com sucesso!")
        return m
    except Exception as e:
        print(f"Erro crítico ao carregar modelo: {e}")
        return None

# Carrega na inicialização
model = load_detection_model()

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    global model
    if model is None:
        model = load_detection_model()
        if model is None:
            return jsonify({'error': 'Modelo não disponível. Verifique o arquivo .pth.'}), 500

    if 'image' not in request.files:
        return jsonify({'error': 'Nenhuma imagem enviada'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Nome de arquivo vazio'}), 400

    try:
        image_bytes = file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        width, height = pil_image.size

        transform = transforms.Compose([transforms.ToTensor()])
        img_tensor = transform(pil_image).to(DEVICE)

        with torch.no_grad():
            outputs = model([img_tensor])

        output = outputs[0]
        boxes = output['boxes'].cpu().numpy().tolist()
        labels = output['labels'].cpu().numpy().tolist()
        scores = output['scores'].cpu().numpy().tolist()

        detections = []
        for i, score in enumerate(scores):
            if score > 0.1: # Filtro básico
                label_idx = int(labels[i])
                label_name = CLASSES[label_idx] if label_idx < len(CLASSES) else f"unknown_{label_idx}"
                
                detections.append({
                    'id': str(i),
                    'class_id': label_idx,
                    'label': label_name,
                    'score': float(score),
                    'box': {
                        'x1': float(boxes[i][0]),
                        'y1': float(boxes[i][1]),
                        'x2': float(boxes[i][2]),
                        'y2': float(boxes[i][3])
                    }
                })

        return jsonify({
            'imageWidth': width,
            'imageHeight': height,
            'detections': detections
        })

    except Exception as e:
        print(f"Erro durante a predição: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    status = "running" if model else "model_error"
    return jsonify({'status': status, 'message': 'Servidor LabGlass AI rodando'})

if __name__ == '__main__':
    print("--- INICIANDO SERVIDOR FLASK ---")
    # Railway/Heroku fornecem a porta via variável de ambiente PORT
    port = int(os.environ.get("PORT", 5000))
    print(f"Aguardando conexões na porta {port}")
    # host='0.0.0.0' é mandatório para containers Docker (Railway/Render)
    app.run(debug=False, host='0.0.0.0', port=port)
`;

  const requirementsCode = `flask
flask-cors
torch
torchvision
pillow
numpy`;

  const procfileCode = `web: python flask_server.py`;

  const getCode = () => {
    switch (activeTab) {
      case 'python': return pythonCode;
      case 'requirements': return requirementsCode;
      case 'procfile': return procfileCode;
      default: return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] border border-slate-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
          <div>
             <h3 className="font-bold text-xl text-slate-800">Arquivos de Deploy</h3>
             <p className="text-sm text-slate-500">Arquivos necessários para rodar o backend (Railway/Render).</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button 
            onClick={() => setActiveTab('python')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'python' ? 'border-cyan-500 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            flask_server.py
          </button>
          <button 
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'requirements' ? 'border-cyan-500 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            requirements.txt
          </button>
          <button 
            onClick={() => setActiveTab('procfile')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'procfile' ? 'border-cyan-500 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Procfile
          </button>
        </div>

        <div className="p-6 overflow-y-auto font-mono text-sm bg-slate-900 text-slate-100 relative min-h-[300px]">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-sans transition-colors border border-white/10"
          >
            {copied ? '✓ Copiado!' : 'Copiar Código'}
          </button>
          <pre className="whitespace-pre-wrap break-all">{getCode()}</pre>
        </div>

        <div className="p-6 bg-white rounded-b-2xl border-t border-slate-100">
           <h4 className="font-bold text-slate-800 mb-2">Instruções Rápidas:</h4>
           {activeTab === 'python' && (
             <p className="text-sm text-slate-600">Este é o servidor principal. Deve ser salvo como <code>flask_server.py</code> na raiz do projeto.</p>
           )}
           {activeTab === 'requirements' && (
             <p className="text-sm text-slate-600">Lista de dependências que o servidor (Railway/Render) instalará automaticamente. Salve como <code>requirements.txt</code>.</p>
           )}
           {activeTab === 'procfile' && (
             <p className="text-sm text-slate-600">Comando de inicialização usado por Railway e Heroku. Salve como <code>Procfile</code> (sem extensão).</p>
           )}
        </div>
      </div>
    </div>
  );
};