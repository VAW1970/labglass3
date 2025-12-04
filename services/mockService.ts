import { Detection, AnalysisResult, GlasswareType } from '../types';

/**
 * SIMULATION: In a real app, this would be a fetch call to your Flask API.
 * 
 * Example Flask Endpoint:
 * @app.route('/predict', methods=['POST'])
 * def predict():
 *     file = request.files['image']
 *     # ... run torch model ...
 *     return jsonify({'detections': [...]})
 */
export const analyzeImageMock = async (file: File, threshold: number): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Create a fake image dimension context
      const width = 800;
      const height = 600;
      
      // Mock detections based on randomness to simulate model inference
      const mockDetections: Detection[] = [
        {
          id: '1',
          class_id: 1,
          label: GlasswareType.BEAKER,
          score: 0.95,
          box: { x1: 100, y1: 200, x2: 250, y2: 400 }
        },
        {
          id: '2',
          class_id: 4,
          label: GlasswareType.ERLENMEYER_FLASK,
          score: 0.88,
          box: { x1: 300, y1: 150, x2: 450, y2: 420 }
        },
        {
          id: '3',
          class_id: 12,
          label: GlasswareType.THERMOMETER,
          score: 0.76,
          box: { x1: 500, y1: 100, x2: 550, y2: 500 }
        }
      ].filter(d => d.score >= threshold);

      resolve({
        imageWidth: width,
        imageHeight: height,
        detections: mockDetections
      });
    }, 1500); // Simulate network/processing delay
  });
};