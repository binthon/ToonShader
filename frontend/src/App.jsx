import { useState, useEffect } from 'react';
import axios from 'axios';
import { Listbox } from '@headlessui/react';

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
    setK(analyzedK); // używamy dokładnej wartości z backendu jako punkt wyjścia
  };

  const handleUpload = async (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;
    setFile(uploaded);
    setOriginalUrl(URL.createObjectURL(uploaded));
    setShouldProcess(false);
    setResult(null);

    // podglądy
    const newPreviews = {};
    for (const method of edgeMethods) {
      const formData = new FormData();
      formData.append('file', uploaded);
      formData.append('edge_method', method.id);
      const res = await axios.post('http://localhost:8000/preview/', formData, {
        responseType: 'blob',
      });
      newPreviews[method.id] = URL.createObjectURL(res.data);
    }
    setPreviews(newPreviews);

    const analyzedK = await analyzeImage(uploaded, edgeMethod);
    setSuggestedK(analyzedK);
    setupSliderFromK(analyzedK);
  };

  const handleEdgeMethodChange = async (newMethod) => {
    setEdgeMethod(newMethod);
    setShouldProcess(false);
    if (file) {
      const analyzedK = await analyzeImage(file, newMethod);
      setSuggestedK(analyzedK);
      setupSliderFromK(analyzedK);
      setResult(null);
    }
  };

  const processImage = async (file, kVal, method) => {
    setIsLoading(true); // <== dodaj
    const scaledK = Math.round(Math.max(2, Math.min(30, kVal)));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('k', scaledK);
    formData.append('edge_method', method);
    formData.append('brightness', brightness);
    formData.append('stroke_enabled', strokeEnabled ? 1 : 0);
    formData.append('use_halftone', useHalftone ? 1 : 0);

    try {
      const res = await axios.post('http://localhost:8000/process/', formData, {
        responseType: 'blob',
      });
      setResult(URL.createObjectURL(res.data));
    } catch (err) {
      console.error("Błąd przetwarzania:", err);
    } finally {
      setIsLoading(false); // <== dodaj
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
    <div className="w-screen h-screen bg-white p-8 box-border font-sans overflow-auto">
      <div className="flex flex-row justify-between h-full gap-8">
        {/* Lewa kolumna */}
        <div className="flex flex-col max-w-[30vw]">
          <h1 className="text-3xl font-bold mb-6">Toon Shader Demo</h1>
          <input type="file" onChange={handleUpload} className="mb-4" />
        

          <label className="text-sm font-medium text-gray-700 mb-2">Algorytm krawędzi:</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {edgeMethods.map((method) => (
            <div key={method.id} className="cursor-pointer" onClick={() => handleEdgeMethodChange(method.id)}>
              <img
                src={previews[method.id]}
                alt={method.name}
                className={`w-24 h-24 object-cover rounded border-2 ${
                  edgeMethod === method.id ? 'border-blue-500' : 'border-transparent'
                }`}
              />
              <p className="text-xs text-center mt-1">{method.name}</p>
            </div>
          ))}
        </div>
        </div>

        {/* Prawa kolumna */}
        <div className="flex flex-col items-end w-full">
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-w-[65vw] w-full flex justify-center items-center min-h-[300px] overflow-hidden">
          <div className="relative w-full flex justify-center items-center max-h-[75vh]">
            {result || originalUrl ? (
              <img
                src={result || originalUrl}
                alt="Toon shader"
                className="max-w-full max-h-[75vh] object-contain rounded shadow"
              />
            ) : (
              <p className="text-gray-400 text-sm">Brak obrazu. Wgraj plik po lewej stronie.</p>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          </div>

          <div className="max-w-[65vw] w-full mt-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Współczynnik: {k} &nbsp;|&nbsp; Sugerowany środek: {suggestedK}
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
              className="w-full"
            />
          </div>
          <div className="max-w-[65vw] w-full mt-4">
  <label className="text-sm font-medium text-gray-700 block mb-2">
    Posterizacja jasności (Brightness Posterization): {brightness.toFixed(2)}
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
    className="w-full"
  />
</div>

<div className="max-w-[65vw] w-full mt-4">
  <label className="text-sm font-medium text-gray-700 block mb-2">
    Kreskowanie w tle (ENABLE)
  </label>
  <input
    type="checkbox"
    checked={strokeEnabled}
    onChange={(e) => {
      setStrokeEnabled(e.target.checked);
      setShouldProcess(true);
    }}
    disabled={!file}
  />
    <label className="text-sm font-medium text-gray-700 block mb-2">
    Efekt halftone (komiksowe kropki)
  </label>
  <input
    type="checkbox"
    checked={useHalftone}
    onChange={(e) => {
      setUseHalftone(e.target.checked);
      setShouldProcess(true);
    }}
    disabled={!file}
  />
</div>

        </div>
      </div>
    </div>
  );
}

export default App;
