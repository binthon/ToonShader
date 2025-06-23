import { useState, useEffect } from 'react';
import axios from 'axios';

const edgeMethods = [
  { id: 'canny', name: 'Canny (precyzyjny)' },
  { id: 'sobel', name: 'Sobel (szybki)' },
  { id: 'laplacian', name: 'Laplacian (ostra krawędź)' },
  { id: 'adaptive', name: 'Adaptive Threshold (komiksowy)' },
  { id: 'dog', name: 'DoG (styl mangi)' },
  { id: 'gaussian', name: 'Gaussian' },
];

function App() {
  const [file, setFile] = useState(null);
  const [k, setK] = useState(5);
  const [kMin, setKMin] = useState(0);
  const [kMax, setKMax] = useState(10);
  const [kStep, setKStep] = useState(1);
  const [edgeMethod, setEdgeMethod] = useState('canny');
  const [result, setResult] = useState(null);
  const [shouldProcess, setShouldProcess] = useState(false);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [suggestedK, setSuggestedK] = useState(null);
  const [previews, setPreviews] = useState({});
  const [brightness, setBrightness] = useState(1.0);
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [useHalftone, setUseHalftone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  const analyzeImage = async (uploadedFile, method) => {
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('edge_method', method);
    const analyzeRes = await axios.post('http://localhost:8000/analyze/', formData);
    return analyzeRes.data.suggested_k;
  };

  const setupSliderFromK = (analyzedK) => {
    const range = analyzedK < 10 ? 5 : Math.round(analyzedK * 0.5);
    const min = Math.max(0, analyzedK - range);
    const max = analyzedK + range;
    const step = analyzedK < 5 ? 0.5 : 1;
    setKMin(min);
    setKMax(max);
    setKStep(step);
    setK(analyzedK);
  };

  const handleUpload = async (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;
    setFile(uploaded);
    setOriginalUrl(URL.createObjectURL(uploaded));
    setShouldProcess(false);
    setResult(null);

    const img = new Image();
    img.onload = () => setIsPortrait(img.height > img.width);
    img.src = URL.createObjectURL(uploaded);

    const newPreviews = {};
    for (const method of edgeMethods) {
      const formData = new FormData();
      formData.append('file', uploaded);
      formData.append('edge_method', method.id);
      const res = await axios.post('http://localhost:8000/preview/', formData, { responseType: 'blob' });
      newPreviews[method.id] = URL.createObjectURL(res.data);
    }
    setPreviews(newPreviews);

    const analyzedK = await analyzeImage(uploaded, edgeMethod);
    setSuggestedK(analyzedK);
    setupSliderFromK(analyzedK);
    setShouldProcess(true); 
  };

const handleEdgeMethodChange = async (newMethod) => {
  setEdgeMethod(newMethod);
  setShouldProcess(false); // <- możesz też to usunąć
  if (file) {
    const analyzedK = await analyzeImage(file, newMethod);
    setSuggestedK(analyzedK);
    setupSliderFromK(analyzedK);
    setResult(null);
    setShouldProcess(true); // <=== TO JEST KLUCZ
  }
};

  const processImage = async (file, kVal, method) => {
    setIsLoading(true);
    const scaledK = Math.round(Math.max(2, Math.min(30, kVal)));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('k', scaledK);
    formData.append('edge_method', method);
    formData.append('brightness', brightness);
    formData.append('stroke_enabled', strokeEnabled ? 1 : 0);
    formData.append('use_halftone', useHalftone ? 1 : 0);

    try {
      const res = await axios.post('http://localhost:8000/process/', formData, { responseType: 'blob' });
      setResult(URL.createObjectURL(res.data));
    } catch (err) {
      console.error("Błąd przetwarzania:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (file && shouldProcess) {
      const timeout = setTimeout(() => {
        processImage(file, parseFloat(k), edgeMethod);
        setShouldProcess(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [k, shouldProcess, file, edgeMethod]);

  return (
    <div className="w-screen min-h-screen bg-white p-8 font-sans overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Toon Shader Demo</h1>

      <div className="relative w-full flex flex-row gap-4 justify-center items-center">
        {originalUrl && (
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 mb-1">Oryginał</p>
            <img src={originalUrl} alt="Oryginalny"  className="w-[40vw] h-[60vh] object-cover rounded shadow" />
          </div>
        )}
        {result && (
          <div className="flex flex-col items-center">
            <p className="text-xs text-gray-500 mb-1">Po obróbce</p>
            <img src={result} alt="Po obóbce"  className="w-[40vw] h-[60vh] object-cover rounded shadow" />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <input type="file" onChange={handleUpload} className="mb-4" />

      <div className="flex overflow-x-auto gap-4 mb-4">
        {edgeMethods.map((method) => (
          <div key={method.id} className="cursor-pointer flex-shrink-0" onClick={() => handleEdgeMethodChange(method.id)}>
            <img
              src={previews[method.id]}
              alt={method.name}
              className={`w-24 h-24 object-cover rounded border-2 ${
                edgeMethod === method.id ? 'border-blue-500' : 'border-transparent'
              }`}
            />
            <p className="text-xs text-center mt-1 whitespace-nowrap">{method.name}</p>
          </div>
        ))}
      </div>

        <div className="w-full max-w-3xl">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Współczynnik: {k} | Sugerowany środek: {suggestedK}
          </label>
          <input
            type="range"
            min={kMin}
            max={kMax}
            step={kStep}
            value={k}
            onChange={(e) => {
              setK(parseFloat(e.target.value));
              setShouldProcess(true);
            }}
            disabled={!file}
            className="w-full mb-4"
          />

          <label className="text-sm font-medium text-gray-700 block mb-2">
            Posterizacja jasności: {brightness.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={brightness}
            onChange={(e) => {
              setBrightness(parseFloat(e.target.value));
              setShouldProcess(true);
            }}
            disabled={!file}
            className="w-full mb-4"
          />

          <label className="text-sm font-medium text-gray-700 block">
            <input
              type="checkbox"
              checked={strokeEnabled}
              onChange={(e) => {
                setStrokeEnabled(e.target.checked);
                setShouldProcess(true);
              }}
              disabled={!file}
              className="mr-2"
            />
            Kreskowanie w tle
          </label>

          <label className="text-sm font-medium text-gray-700 block mt-2">
            <input
              type="checkbox"
              checked={useHalftone}
              onChange={(e) => {
                setUseHalftone(e.target.checked);
                setShouldProcess(true);
              }}
              disabled={!file}
              className="mr-2"
            />
            Efekt halftone (komiksowe kropki)
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;