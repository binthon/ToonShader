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
        onChange={(e) => setK(parseFloat(e.target.value))}
        disabled={disabled}
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
        onChange={(e) => setBrightness(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full mb-4"
      />

      <label className="text-sm font-medium text-gray-700 block">
        <input
          type="checkbox"
          checked={strokeEnabled}
          onChange={(e) => setStrokeEnabled(e.target.checked)}
          disabled={disabled}
          className="mr-2"
        />
        Kreskowanie w tle
      </label>

      <label className="text-sm font-medium text-gray-700 block mt-2">
        <input
          type="checkbox"
          checked={useHalftone}
          onChange={(e) => setUseHalftone(e.target.checked)}
          disabled={disabled}
          className="mr-2"
        />
        Efekt halftone (komiksowe kropki)
      </label>

      <label className="text-sm font-medium text-gray-700 block mt-2">
        <input
          type="checkbox"
          checked={useCrosshatch}
          onChange={(e) => setUseCrosshatch(e.target.checked)}
          disabled={disabled}
          className="mr-2"
        />
        Crosshatch shading (cieniowanie kreskowe)
      </label>
    </div>
  );
}

export default SlidersPanel;
