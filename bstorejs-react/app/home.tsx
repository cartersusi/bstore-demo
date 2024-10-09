'use client'

import { useState, useRef, ChangeEvent } from 'react';
import { Put, Get, Del } from 'bstorejs-react';
import { BstoreIFrame, BstoreApplication, BstoreImage, BstoreVideo } from 'bstorejs-react';

export function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStatus('idle');
    setBlobUrl(null);

    try {
      const res = await Put(selectedFile.name, selectedFile, 'public');
      if (res.status !== 200) {
        setUploadStatus('error');
      } else {
        console.log('Upload successful:', res);
        console.log('Upload successful:', res.url as string);
        setBlobUrl(res.url as string);
        setUploadStatus('success');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && fileInputRef.current) {
      fileInputRef.current.files = event.dataTransfer.files;
      handleFileChange({ target: { files: event.dataTransfer.files } } as ChangeEvent<HTMLInputElement>);
    }
  };

  const testFunctions = async () => {
    setTestResults('Testing functions...\n');
    
    if (!file) {
      setTestResults('No file selected. Please select a file first.\n');
      return;
    }

    try {
      setTestResults(prev => prev + 'Testing put function...\n');
      const putRes = await Put(file.name, file, 'public');
      setTestResults(prev => prev + `Put result: ${JSON.stringify(putRes)}\n\n`);

      setTestResults(prev => prev + 'Testing get function...\n');
      const getRes = await Get(file.name, 'public');
      console.log('getRes:', getRes);
      
      const url = URL.createObjectURL(getRes.file as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getRes.file?.name as string;
      a.click();

      setTestResults(prev => prev + `Get result: ${JSON.stringify(getRes)}\n\n`);

      setTestResults(prev => prev + 'Testing del function...\n');
      const delRes = await Del(file.name, 'public');
      setTestResults(prev => prev + `Del result: ${JSON.stringify(delRes)}\n\n`);

      setTestResults(prev => prev + 'All tests completed.\n');
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => prev + `Test failed: ${error}\n`);
    }
  };

  const renderFilePreview = () => {
    if (!blobUrl) return null
    console.log('blobUrl:', blobUrl);

    switch (blobUrl) {
      case 'image':
        return (
          <BstoreImage 
            path={blobUrl} 
            alt="Uploaded file"
            className="max-w-full max-h-full object-contain" 
          />)
      case 'video':
        return ( 
          <BstoreVideo
            path={blobUrl}
            controls={true}
            className="max-w-full max-h-full"
          />)
      case 'application':
        return (
          <BstoreApplication
            path={blobUrl}
            type={file?.type || ''}
            className="w-full h-full border-0"
          />)
      default:
        return (
          <BstoreIFrame
            path={blobUrl}
            className="w-full h-full border-0"
          />)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 p-4 flex flex-col">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="h-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 mb-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-center text-gray-600">
            Drag & drop a file here, or click to select a file
          </p>
        </div>
        <button 
          onClick={testFunctions}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Bstore Functions
        </button>
      </div>

      <div className="w-2/3 p-4 flex flex-col">
        <div className="mb-4">
          {file && (
            <p
              className={`text-lg font-semibold ${
                uploadStatus === 'success' ? 'text-green-600' : uploadStatus === 'error' ? 'text-red-600' : 'text-gray-800'
              }`}
            >
              {file.name}
            </p>
          )}
        </div>

        <div className="flex-grow border rounded-lg overflow-hidden bg-white mb-4">
          {uploadStatus === 'success' ? renderFilePreview() : null}
        </div>

        <div className="border rounded-lg p-4 bg-white h-1/3 overflow-auto">
          <h3 className="font-bold mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap">{testResults}</pre>
        </div>
      </div>
    </div>
  )
}