import React, { useState } from 'react';
import { Eye, FileText, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogOverlay } from '@/components/ui/dialog';
import ResumePreviewComponent from '@/components/User/ResumeScanner/ResumePreviewComponent';
import ResumeUploadComponent from '@/components/User/ResumeScanner/ResumeUploadComponent';
import { toast } from 'sonner';

const ScanResume = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  const handleFileUpload = (uploadedFile, jd) => {
    if (jd !== undefined) {
      scanResume(uploadedFile, jd);
    } else {
      setFile(uploadedFile);
    }
  };

  const handleJdChange = (jd) => {
    setJobDescription(jd);
  };

  const scanResume = async (resumeFile, jd) => {
    setIsLoading(true);
    setShowPreviewDialog(false); // Close preview dialog when scanning starts
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("job_description", jd);

      const response = await fetch(
        `${import.meta.env.VITE_RESUME_MICROSERVICE}/scan-resume/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResultsDialog(true); // Auto-open results dialog
        toast.success("Resume scanned successfully!");
      } else {
        toast.error(`Failed to scan resume: ${response.statusText}`);
      }
    } catch (error) {
      toast.error(`⚠️ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-full mx-auto">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6 lg:mb-8">
          Resume ATS Scanner
        </h1>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="space-y-4">
            <ResumeUploadComponent 
              onFileUpload={handleFileUpload}
              onJdChange={handleJdChange}
              isLoading={isLoading}
            />

            {/* Mobile Action Buttons */}
            <div className="flex gap-3">
              {/* Preview Button */}
              {file && (
                <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                  <DialogTrigger asChild>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Eye className="h-4 w-4" />
                      Preview Resume
                    </button>
                  </DialogTrigger>
                  <DialogOverlay className="z-[9998] backdrop-blur-sm bg-black/50" />
                  <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 z-[9999] bg-white">
                    <DialogHeader className="p-4 pb-0">
                      <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Resume Preview
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 overflow-auto max-h-[80vh]">
                      <ResumePreviewComponent 
                        file={file}
                        isLoading={isLoading}
                        results={null}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Results Button */}
              {results && (
                <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}  >
                  <DialogTrigger asChild>
                    <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <BarChart3 className="h-4 w-4" />
                      View Results
                    </button>
                  </DialogTrigger>
                  <DialogOverlay className="z-[9998] backdrop-blur-sm bg-white" />
                  <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 z-[9999] bg-white">
                    <DialogHeader className="p-4 pb-0">
                      <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Scan Results
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 overflow-auto max-h-[80vh]">
                      <ResumePreviewComponent 
                        file={file}
                        isLoading={isLoading}
                        results={results}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Loading State on Mobile */}
            {isLoading && (
              <div className="bg-white rounded-lg border-2 border-green-500 p-6">
                <ResumePreviewComponent 
                  file={file}
                  isLoading={isLoading}
                  results={null}
                />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout - Side by side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left side - Upload components */}
          <div className="space-y-6">
            <ResumeUploadComponent 
              onFileUpload={handleFileUpload}
              onJdChange={handleJdChange}
              isLoading={isLoading}
            />
          </div>

          {/* Right side - Preview and results */}
          <div className="space-y-6">
            <ResumePreviewComponent 
              file={file}
              isLoading={isLoading}
              results={results}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanResume;