import { useEffect } from "react";
import FileUploader from "./components/FileUploader";
import PreviewSelector from "./components/PreviewSelector";
import SlidersPanel from "./components/SlidersPanel";
import ProcessedOutput from "./components/ProcessedOutput";
import { useProcessing } from "./hooks/useProcessing";

function App() {
  const {
    file,
    k, setK,
    kMin, kMax, kStep,
    edgeMethod,
    result,
    lastResult,
    shouldProcess, setShouldProcess,
    originalUrl,
    suggestedK,
    previews,
    brightness, setBrightness,
    strokeEnabled, setStrokeEnabled,
    useHalftone, setUseHalftone,
    useCrosshatch, setUseCrosshatch,
    isLoading,
    isVideo,
    handleUpload,
    processImage,
    handleEdgeMethodChange,
  } = useProcessing();

useEffect(() => {
  if (file && shouldProcess && !isVideo) { 
    const timeout = setTimeout(() => {
      processImage();
      setShouldProcess(false);
    }, 300);
    return () => clearTimeout(timeout);
  }
}, [k, shouldProcess, file, edgeMethod, isVideo]);

  return (
    
<div class="w-full min-h-screen bg-white px-8 pt-4 font-sans overflow-auto relative">

{!file ? (
 
  <div className="flex justify-center mb-2">
    <img
      src="/clicks.jpg"
      alt="Toon Shader Logo"
      className="w-[350px] h-[350px] object-contain"
    />
  </div>
) : (
  
  <div className="absolute top-4 left-4 z-10">
    <img
      src="/clicks.jpg"
      alt="Toon Shader Logo"
      className="w-[160px] h-[160px] object-contain"
    />
  </div>
)}



      <div className="relative w-full flex flex-row gap-4 justify-center items-center">
        {originalUrl && (
<div className="w-[40vw] h-[60vh] flex flex-col items-center">
  <p className="text-xs text-gray-500 mb-1">Oryginał</p>
            {file?.type?.startsWith("video/") ? (
              <video
                src={originalUrl}
                controls
                className="w-[40vw] h-[60vh] object-contain rounded shadow"
              />
            ) : (
              <img
                src={originalUrl}
                alt="Oryginalny"
                className="w-[40vw] h-[60vh] object-contain rounded shadow"
              />
            )}
          </div>
        )}

{(result || isLoading) && (
  <ProcessedOutput
    result={result}
    file={file}
    isLoading={isLoading}
  />
)}

      </div>

<div className="mt-8 w-full max-w-screen-lg mx-auto px-4 flex flex-col items-center">
        <FileUploader onUpload={handleUpload} />

      {file && (
        
        <>
          <PreviewSelector
            previews={previews}
            selected={edgeMethod}
            onChange={handleEdgeMethodChange}
          />

          <SlidersPanel
            k={k} setK={(val) => { setK(val); setShouldProcess(true); }}
            kMin={kMin} kMax={kMax} kStep={kStep}
            brightness={brightness} setBrightness={(val) => { setBrightness(val); setShouldProcess(true); }}
            strokeEnabled={strokeEnabled} setStrokeEnabled={(val) => { setStrokeEnabled(val); setShouldProcess(true); }}
            useHalftone={useHalftone} setUseHalftone={(val) => { setUseHalftone(val); setShouldProcess(true); }}
            useCrosshatch={useCrosshatch} setUseCrosshatch={(val) => { setUseCrosshatch(val); setShouldProcess(true); }}
            suggestedK={suggestedK}
            disabled={!file}
          />
          {isVideo && (
  <div className="mt-6  mb-8 flex flex-col items-center">
    <button
      onClick={processImage}
      disabled={isLoading}
      className={`px-6 py-3 rounded-lg text-white font-semibold transition duration-200 ${
        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800'
      }`}
    >
      🎬 {isLoading ? 'Trwa generowanie...' : 'Generuj wideo'}
    </button>

    {isLoading && (
      <p className="mt-2 mb-8 text-sm text-gray-600">
        Przetwarzanie filmu – może to chwilę potrwać...☕
      </p>
    )}
  </div>
)}
        </>
      )}
      </div>
      
    </div>
  );
}

export default App;