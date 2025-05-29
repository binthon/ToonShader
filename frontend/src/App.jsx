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

    const analyzedK = await analyzeImage(uploaded, edgeMethod);
    setSuggestedK(analyzedK);
    setupSliderFromK(analyzedK);
    setResult(null);
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
  const scaledK = Math.round(Math.max(2, Math.min(30, kVal))); 
  const formData = new FormData();
  formData.append('file', file);
  formData.append('k', scaledK);
  formData.append('edge_method', method);
  const res = await axios.post('http://localhost:8000/process/', formData, {
    responseType: 'blob',
  });
  setResult(URL.createObjectURL(res.data));
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
          {file && <p className="text-sm text-gray-600 mb-4">{file.name}</p>}

          <label className="text-sm font-medium text-gray-700 mb-2">Algorytm krawędzi:</label>
          <Listbox value={edgeMethod} onChange={handleEdgeMethodChange} disabled={!file}>
            <div className="w-full border border-gray-300 rounded p-2">
              {edgeMethods.map((method) => (
                <Listbox.Option
                  key={method.id}
                  value={method.id}
                  className={({ active, selected }) =>
                    `cursor-pointer px-3 py-2 rounded 
                    ${selected ? 'bg-blue-500 text-white font-bold' : ''}
                    ${!selected && active ? 'bg-blue-100' : ''}`
                  }
                >
                  {method.name}
                </Listbox.Option>
              ))}
            </div>
          </Listbox>
        </div>

        {/* Prawa kolumna */}
        <div className="flex flex-col items-end w-full">
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-w-[65vw] w-full flex justify-center items-center min-h-[300px]">
            {(result || originalUrl) ? (
              <img
                src={result || originalUrl}
                alt="Toon shader"
                className="w-full h-auto max-h-[80vh] rounded shadow"
              />
            ) : (
              <p className="text-gray-400 text-sm">Brak obrazu. Wgraj plik po lewej stronie.</p>
            )}
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
        </div>
      </div>
    </div>
  );
}

export default App;
