function SlidersPanel({
  k, kMin, kMax, kStep, setK,
  brightness, setBrightness,
  strokeEnabled, setStrokeEnabled,
  useHalftone, setUseHalftone,
  useCrosshatch, setUseCrosshatch,
  suggestedK,
  disabled
}) {
  return (
    <div className="w-full max-w-3xl flex flex-col gap-8 mt-8">
      {/* Suwak K */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Współczynnik: {k}
        </label>
        <input
          type="range"
          min={kMin}
          max={kMax}
          step={kStep}
          value={k}
          onChange={(e) => setK(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full accent-black"
        />
      </div>

      {/* Suwak jasności */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Posterizacja jasności: {brightness.toFixed(2)}
        </label>
        <input
          type="range"
          min={0.1}
          max={1.0}
          step={0.05}
          value={brightness}
          onChange={(e) => setBrightness(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full accent-black"
        />
      </div>

      {/* Checkboxy w jednej linii */}
<div className="flex flex-row justify-center items-center gap-6 mt-4 mb-8">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <input
            type="checkbox"
            checked={strokeEnabled}
            onChange={(e) => setStrokeEnabled(e.target.checked)}
            disabled={disabled}
            className="mr-2 accent-black"
          />
          Efekt kreskowania
        </label>

        <label className="text-sm font-medium text-gray-700 flex items-center">
          <input
            type="checkbox"
            checked={useHalftone}
            onChange={(e) => setUseHalftone(e.target.checked)}
            disabled={disabled}
            className="mr-2 accent-black"
          />
          Efekt halftone (komiksowe kropki)
        </label>

        <label className="text-sm font-medium text-gray-700 flex items-center">
          <input
            type="checkbox"
            checked={useCrosshatch}
            onChange={(e) => setUseCrosshatch(e.target.checked)}
            disabled={disabled}
            className="mr-2 accent-black"
          />
          Crosshatch shading (cieniowanie kreskowe)
        </label>
      </div>
    </div>
  );
}

export default SlidersPanel;
