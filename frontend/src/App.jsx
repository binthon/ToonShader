import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [k, setK] = useState(5);
  const [suggestedK, setSuggestedK] = useState(5);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;
    setFile(uploaded);

    const formData = new FormData();
    formData.append("file", uploaded);
    const analyzeRes = await axios.post("http://localhost:8000/analyze/", formData);
    const kValue = analyzeRes.data.suggested_k;
    setSuggestedK(kValue);
    setK(kValue);
  };

  const processImage = async (file, kVal) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("k", kVal);
    const res = await axios.post("http://localhost:8000/process/", formData, {
      responseType: "blob",
    });
    setResult(URL.createObjectURL(res.data));
  };

  useEffect(() => {
    if (file) {
      const timeout = setTimeout(() => {
        processImage(file, parseInt(k));
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [k]);

  return (
    <div className="w-screen h-screen bg-white p-8 box-border font-sans overflow-auto">
      <div className="flex flex-row justify-between h-full gap-8">
        {/* Lewa kolumna */}
        <div className="flex flex-col max-w-[30vw]">
          <h1 className="text-3xl font-bold mb-6">Toon Shader Demo</h1>
          <input type="file" onChange={handleUpload} className="mb-4" />
          {file && <p className="text-sm text-gray-600">{file.name}</p>}
        </div>

        {/* Prawa kolumna */}
        <div className="flex flex-col items-end w-full">
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-w-[65vw] w-full flex justify-center items-center min-h-[300px]">
            {result ? (
              <img
                src={result}
                alt="Toon shader"
                className="w-full h-auto max-h-[80vh] rounded shadow"
              />
            ) : (
              <p className="text-gray-400 text-sm">Brak obrazu. Wgraj plik po lewej stronie.</p>
            )}
          </div>

          <div className="max-w-[65vw] w-full mt-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Współczynnik kreskówkowania (k): {k}
            </label>
            <input
              type="range"
              min={2}
              max={suggestedK}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
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
