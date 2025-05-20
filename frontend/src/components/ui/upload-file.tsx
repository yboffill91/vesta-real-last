"use client";

import React, { useRef } from 'react';
import { CloudUpload } from 'lucide-react';
import { useState } from 'react';

// Custom hook para manejar el estado del archivo y exponer setter y getter
export function useUploadFile(initialFile: File | null = null) {
  const [file, setFile] = useState<File | null>(initialFile);
  return { file, setFile };
}

interface UploadFileProps {
  id?: string;
  label?: string;
  accept?: string;
  file?: File | null;
  setFile?: (file: File | null) => void;
  className?: string;
}

export const UploadFile: React.FC<UploadFileProps> = ({
  id = 'upload-file',
  label = 'Archivo',
  accept = '.png,.jpg,.jpeg,.webp',
  file,
  setFile,
  className = '',
}) => {
  // Si no se pasa file/setFile, manejar estado interno
  const internal = useUploadFile();
  const fileToUse = file !== undefined ? file : internal.file;
  const setFileToUse = setFile !== undefined ? setFile : internal.setFile;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFileToUse(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileToUse(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`border relative rounded-lg bg-input border-accent shadow ${className}`}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      style={{ cursor: 'pointer' }}
    >
      <label
        className="absolute -top-2 left-2 bg-card px-2 rounded-lg text-sm"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <CloudUpload className="text-muted-foreground size-12" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold">Click para subir</span> o arrastra hasta aqu&iacute;
        </p>
        <p className="text-xs text-muted-foreground">
          Imágenes PNG, JPG o WEBP
        </p>
      </div>
      <input
        id={id}
        type="file"
        className="hidden"
        accept={accept}
        ref={inputRef}
        onChange={handleFileChange}
      />
      {fileToUse && (
        <div className="mt-2 text-xs bg-accent text-accent-foreground rounded-b-lg py-0.5 px-2">
          Seleccionado: {fileToUse.name}
        </div>
      )}
    </div>
  );
};



