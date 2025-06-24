import { useState } from "react";

function FileUploader({ onUpload }) {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onUpload(e);
    }
  };

  return (
    <div className="mb-6 flex flex-col items-center justify-center text-center gap-2 mt-6 mb-10">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.mp4"
          onChange={handleChange}
          className="text-lg text-gray-800 file:py-2 file:px-4
                     file:rounded-lg file:border-0 
                     file:bg-emerald-700 file:text-white hover:file:bg-emerald-800
                     transition duration-200 ease-in-out cursor-pointer"
        />
      </div>
      <span className="text-xs text-gray-500">
        (Dozwolone formaty: .jpg, .jpeg, .png, .mp4)
      </span>
    </div>
  );
}

export default FileUploader;
