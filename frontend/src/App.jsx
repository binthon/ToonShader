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
    if (file && shouldProcess) {
      const timeout = setTimeout(() => {
        processImage();
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

        <ProcessedOutput result={result} file={file} />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <FileUploader onUpload={handleUpload} />

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
      </div>
    </div>
  );
}

export default App;