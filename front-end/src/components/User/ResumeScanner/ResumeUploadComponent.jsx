import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const ResumeUploadComponent = ({ onFileUpload, onJdChange, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      onFileUpload(droppedFile);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileUpload(selectedFile);
    }
  };

  const handleJdChange = (e) => {
    setJd(e.target.value);
    onJdChange(e.target.value);
  };

  const removeFile = () => {
    setFile(null);
    onFileUpload(null);
  };

  return (
    <div className="xl:sticky xl:top-4 xl:z-10 space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg border-2 border-green-500">
        <h2 className="text-lg sm:text-xl font-semibold text-black mb-3 sm:mb-4">Upload Resume</h2>
        
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
              dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="hidden"
              id="file-upload"
              disabled={isLoading}
            />
            
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-green-500 mb-3 sm:mb-4" />
              <p className="text-black font-medium text-sm sm:text-base mb-2">
                <span className="hidden sm:inline">Drop your resume here or click to browse</span>
                <span className="sm:hidden">Tap to upload resume</span>
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                Supports PDF, DOC, DOCX files
              </p>
            </label>
          </div>
        ) : (
          <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-green-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              </div>
              <button
                onClick={removeFile}
                className="ml-4 text-sm text-red-600 hover:text-red-800 font-medium"
                disabled={isLoading}
              >
                Remove
              </button>
            </div>
            <div className="mt-3 flex items-center">
              <div className="flex-1 bg-green-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>
              <span className="ml-3 text-sm font-medium text-green-800">Uploaded</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg border-2 border-green-500">
        <h2 className="text-lg sm:text-xl font-semibold text-black mb-3 sm:mb-4">Job Description</h2>
        <textarea 
          value={jd}
          onChange={handleJdChange}
          placeholder="Paste the job description here..."
          className="w-full h-32 sm:h-40 p-3 sm:p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-sm sm:text-base"
          disabled={isLoading}
        />
      </div>

      <button 
        onClick={() => onFileUpload(file, jd)}
        disabled={!file || !jd.trim() || isLoading}
        className="w-full bg-green-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Scanning Resume...' : 'Scan Resume'}
      </button>
    </div>
  );
};

export default ResumeUploadComponent;