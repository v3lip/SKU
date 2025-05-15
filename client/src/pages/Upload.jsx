import React, { useState, useRef } from 'react';
import './Upload.css';
import { API_URL } from '../config';

function Upload() {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('key');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleKeySubmit = async (e) => {
    e.preventDefault();
    if (!key) return;
    try {
      const res = await fetch(`${API_URL}/api/upload/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setStep('upload');
        setMessage('');
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (err) {
      setMessage('Error validating key');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !key) return;
    try {
      // Initialize chunked upload
      const chunkSize = 1 * 1024 * 1024; // 1MB
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      // Step 1: Initialize upload
      const initRes = await fetch(`${API_URL}/api/upload/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, originalName: file.name, totalChunks }),
      });
      
      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(`Failed to initialize upload: ${err.message}`);
      }
      
      const { uploadId } = await initRes.json();
      
      // Step 2: Upload chunks
      let uploadedChunks = 0;
      setUploadProgress(0);
      
      // Upload chunks sequentially instead of in parallel
      for (let index = 0; index < totalChunks; index++) {
        const start = index * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const blob = file.slice(start, end);
        const form = new FormData();
        form.append('chunk', blob);
        form.append('uploadId', uploadId);
        form.append('chunkIndex', index);
        
        const chunkRes = await fetch(`${API_URL}/api/upload/chunk`, { 
          method: 'POST', 
          body: form 
        });
        
        if (!chunkRes.ok) {
          throw new Error(`Failed to upload chunk ${index + 1}/${totalChunks}`);
        }
        
        uploadedChunks++;
        setUploadProgress(Math.round((uploadedChunks / totalChunks) * 100));
      }
      
      // Step 3: Complete upload
      const compRes = await fetch(`${API_URL}/api/upload/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, key }),
      });
      
      if (!compRes.ok) {
        const err = await compRes.json();
        throw new Error(`Failed to complete upload: ${err.message}`);
      }
      
      const data = await compRes.json();
      setMessage(`Upload successful! File ID: ${data.id}`);
      
    } catch (err) {
      console.error('Upload error:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        {step === 'key' ? (
          <>
            <h2>Enter Upload Key</h2>
            <form onSubmit={handleKeySubmit}>
              <input
                type="password"
                placeholder="Upload Key"
                value={key}
                onChange={e => setKey(e.target.value)}
              />
              <button type="submit">Next</button>
            </form>
          </>
        ) : (
          <>
            <h2>Upload File</h2>
            <form onSubmit={handleSubmit} className="upload-form">
              <div
                className={`file-drop-area ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                {file ? (
                  <p className="file-name">{file.name}</p>
                ) : (
                  <p>Drag & drop your file here or click to select</p>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="file-input"
                  onChange={e => setFile(e.target.files[0])}
                />
              </div>
              {uploadProgress > 0 && (
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
              <button type="submit" disabled={!file}>Upload</button>
            </form>
          </>
        )}
        {message && <p className="message">{message}</p>}
        <a href="/admin" className="admin-link">Go to Admin Login</a>
      </div>
    </div>
  );
}

export default Upload; 
