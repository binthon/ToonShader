import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [k, setK] = useState(5);
  const [result, setResult] = useState(null);

  const processImage = async (file, k) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("k", k);
    const res = await axios.post("http://localhost:8000/process/", formData, {
      responseType: "blob",
    });
    setResult(URL.createObjectURL(res.data));
  };

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setImage(URL.createObjectURL(uploadedFile));
    }
  };

  useEffect(() => {
    if (file) {
      const timeout = setTimeout(() => {
        processImage(file, k);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [k, file]);

  return (
    <div className="w-screen h-screen bg-white p-8 box-border font-sans">
      <div className="flex justify-between">
        {/* Lewa góra */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-6">Toon Shader Demo</h1>
          <input type="file" onChange={handleUpload} className="mb-4" />
        </div>

        {/* Prawa – kontener z obrazami i suwakiem */}
        <div className="w-[600px] flex flex-col items-center">
          {/* Obrazki w kontenerze */}
          <div className="flex justify-center items-center gap-4 border border-gray-300 rounded-md p-4 w-full h-[250px] bg-gray-50">
            {image ? (
              <>
                <img src={image} alt="Oryginał" className="w-[240px] rounded shadow" />
                <img src={result} alt="Wynik" className="w-[240px] rounded shadow" />
              </>
            ) : (
              <p className="text-gray-400 text-sm">Brak obrazu. Wgraj plik po lewej stronie.</p>
            )}
          </div>

          {/* Suwak */}
          <div className="w-full mt-6">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Number of Colors: {k}
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={k}
              onChange={(e) => setK(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
