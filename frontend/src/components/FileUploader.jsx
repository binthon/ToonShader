function FileUploader({ onUpload }) {
  return (
    <div className="mb-4">
      <input
        type="file"
        onChange={onUpload}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
}

export default FileUploader;