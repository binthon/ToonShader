
import axios from "axios";
import { edgeMethods } from "../utils/edgeMethods";
import { useState, useEffect } from "react";
export function useProcessing() {
  const [file, setFile] = useState(null);
  const [k, setK] = useState(5);
  const [kMin, setKMin] = useState(0);
  const [kMax, setKMax] = useState(10);
  const [kStep, setKStep] = useState(1);
  const [edgeMethod, setEdgeMethod] = useState("canny");
  const [result, setResult] = useState(null);
  const [shouldProcess, setShouldProcess] = useState(false);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [suggestedK, setSuggestedK] = useState(null);
  const [previews, setPreviews] = useState({});
  const [brightness, setBrightness] = useState(1.0);
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [useHalftone, setUseHalftone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [useCrosshatch, setUseCrosshatch] = useState(false);
  const [lastResult, setLastResult] = useState(null);


  
  const setupSliderFromK = (analyzedK) => {
    const range = analyzedK < 10 ? 5 : Math.round(analyzedK * 0.5);
    const min = Math.max(0, analyzedK - range);
    const max = analyzedK + range;
    const step = analyzedK < 5 ? 0.5 : 1;
    setKMin(min);
    setKMax(max);
    setKStep(step);
    setK(analyzedK);
  };

  const analyzeImage = async (uploadedFile, method) => {
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("edge_method", method);
    const res = await axios.post("http://localhost:8000/analyze/", formData);
    return res.data.suggested_k;
  };

  useEffect(() => {
  if (result) {
    setLastResult(result);
  }
}, [result]);

  const autoSelectBestMethod = async (file) => {
    let bestMethod = "canny";
    let bestDensity = 0;

    for (const method of edgeMethods) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("edge_method", method.id);

      try {
        const res = await axios.post("http://localhost:8000/analyze/", formData);
        const density = res.data.density;

        if (density > bestDensity) {
          bestDensity = density;
          bestMethod = method.id;
        }
      } catch (err) {
        console.warn("Błąd analizy metody:", method.id);
      }
    }

    return bestMethod;
  };

 const handleUpload = async (e) => {
  const uploaded = e.target.files[0];
  if (!uploaded) return;

  const isVid = uploaded.type.startsWith("video/");
  setIsVideo(isVid);
  setFile(uploaded);
  setOriginalUrl(URL.createObjectURL(uploaded));
  setShouldProcess(false);
  setResult(null);

  if (isVid) {
    // Ustawiamy domyślne podglądy dla metod (np. ikona filmu)
    const videoPreviewIcon = "/clicks.jpg"; // ścieżka do ikony
    const videoPreviews = {};
    for (const method of edgeMethods) {
      videoPreviews[method.id] = videoPreviewIcon;
    }
    setPreviews(videoPreviews);
    return;
  }

  const img = new Image();
  img.onload = () => setIsPortrait(img.height > img.width);
  img.src = URL.createObjectURL(uploaded);

  const newPreviews = {};
  for (const method of edgeMethods) {
    const formData = new FormData();
    formData.append("file", uploaded);
    formData.append("edge_method", method.id);
    try {
      const res = await axios.post("http://localhost:8000/preview/", formData, {
        responseType: "blob",
      });
      newPreviews[method.id] = URL.createObjectURL(res.data);
    } catch (err) {
      console.error(`Błąd preview (${method.id}):`, err);
    }
  }
  setPreviews(newPreviews);

  const bestMethod = await autoSelectBestMethod(uploaded);
  setEdgeMethod(bestMethod);
  const analyzedK = await analyzeImage(uploaded, bestMethod);
  setSuggestedK(analyzedK);
  setupSliderFromK(analyzedK);
  setShouldProcess(true);
};


  const processVideo = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("k", k);
      formData.append("brightness", brightness);
      formData.append("stroke_enabled", strokeEnabled ? 1 : 0);
      formData.append("use_halftone", useHalftone ? 1 : 0);
      formData.append("edge_method", edgeMethod);

      const res = await axios.post("http://localhost:8000/process-video/", formData, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(blob);
      setResult(videoUrl);
    } catch (err) {
      console.error("Błąd przetwarzania wideo:", err);
    } finally {
      setIsLoading(false);
    }
  };

const processImage = async () => {
  if (!file) return;

  if (isVideo) {
    await processVideo(file);
    return;
  }

  setIsLoading(true);
  const scaledK = Math.round(Math.max(2, Math.min(30, k)));
  const formData = new FormData();
  formData.append("file", file);
  formData.append("k", scaledK);
  formData.append("edge_method", edgeMethod);
  formData.append("brightness", brightness);
  formData.append("stroke_enabled", strokeEnabled ? 1 : 0);
  formData.append("use_halftone", useHalftone ? 1 : 0);
  formData.append("use_crosshatch", useCrosshatch ? 1 : 0);

  try {
    const res = await axios.post("http://localhost:8000/process/", formData, {
      responseType: "blob",
    });
    const blobUrl = URL.createObjectURL(res.data);
    setResult(blobUrl);
  } catch (err) {
    console.error("Błąd przetwarzania obrazu:", err);
  } finally {
    setIsLoading(false);
  }
};

  const handleEdgeMethodChange = async (newMethod) => {
    setEdgeMethod(newMethod);
    setShouldProcess(false);
    if (file) {
      const analyzedK = await analyzeImage(file, newMethod);
      setSuggestedK(analyzedK);
      setupSliderFromK(analyzedK);
      setShouldProcess(true);
    }
  };

return {
  file, setFile,
  k, setK,
  kMin, kMax, kStep,
  edgeMethod, setEdgeMethod,
  result, setResult,
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
  isPortrait,
  isVideo,
  handleUpload,
  processImage,
  handleEdgeMethodChange
};
}
