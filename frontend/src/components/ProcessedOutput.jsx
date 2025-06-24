function ProcessedOutput({ result, file, isLoading }) {
  const download = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = file?.type?.startsWith("video/") ? "toon-shader.mp4" : "toon-shader.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!result && !isLoading) return null;

  const isVideo = file?.type?.startsWith("video/");

  return (
    <div className="flex flex-col items-center relative group w-[40vw] h-[60vh]">
      <p className="text-xs text-gray-500 mb-1">Po obróbce</p>

{isVideo ? (
  <div className="relative w-full h-full">
    {result && (
      <video
        key={result}
        src={result}
        controls
        className="w-full h-full object-contain rounded shadow"
        preload="auto"
      />
    )}

    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )}

    {result && (
      <button
        onClick={download}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-2 shadow"
        aria-label="Pobierz video"
      >
        <img
          src="/icons8-download-16.png"
          alt="Pobierz"
          className="w-4 h-4"
        />
      </button>
    )}
  </div>
) : (
        <div className="relative w-full h-full">
          {result && (
            <img
              src={result}
              alt="Po obróbce"
              className="w-full h-full object-contain rounded shadow"
            />
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded">
              <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {result && (
            <button
              onClick={download}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-2 shadow"
              aria-label="Pobierz obraz"
            >
              <img
                src="/icons8-download-16.png"
                alt="Pobierz"
                className="w-4 h-4"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}


export default ProcessedOutput;
