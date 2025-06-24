function ProcessedOutput({ result, file }) {
  const download = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = file?.type?.startsWith("video/") ? "toon-shader.mp4" : "toon-shader.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return result ? (
    <div className="flex flex-col items-center mt-6">
      <p className="text-xs text-gray-500 mb-1">Po obróbce</p>
      {file?.type?.startsWith("video/") ? (
        <video key={result} src={result} controls className="w-[40vw] h-[60vh] object-contain rounded shadow" preload="auto" />
      ) : (
        <img src={result} alt="Po obróbce" className="w-[40vw] h-[60vh] object-contain rounded shadow" />
      )}

      <button
        onClick={download}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Pobierz przetworzony obraz
      </button>
    </div>
  ) : null;
}

export default ProcessedOutput;
