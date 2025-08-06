import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ObjectUploaderProps {
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{ method: 'PUT'; url: string }>;
  onComplete: (result: any) => void;
  buttonClassName?: string;
  children: React.ReactNode;
}

export function ObjectUploader({
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children
}: ObjectUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size
    if (file.size > maxFileSize) {
      alert(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`);
      return;
    }

    try {
      // Get upload parameters
      const { method, url } = await onGetUploadParameters();
      
      // Upload the file
      const response = await fetch(url, {
        method,
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const responseBody = await response.json().catch(() => ({}));

      // Call onComplete with mock Uppy-like result
      onComplete({
        successful: [{
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          response: {
            body: responseBody
          }
        }],
        failed: []
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.fbx,.obj,.glb,.gltf"
      />
      <Button
        onClick={handleClick}
        className={buttonClassName}
        type="button"
      >
        {children}
      </Button>
    </>
  );
}
