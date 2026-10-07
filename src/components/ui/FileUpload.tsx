"use client";

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  helperText?: string;
  error?: string;
  /** Called with selected File objects */
  onFilesChange?: (files: File[]) => void;
}

interface PreviewFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function FileUpload({
  label,
  accept = "image/jpeg, image/png, image/heic, .heic",
  multiple = true,
  maxFiles = 3,
  maxSizeMB = 20, // 20MB untuk limit ukuran SEBELUM dikompres
  helperText,
  error,
  onFilesChange,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Bersihkan object URL saat komponen di-unmount atau preview dihapus
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [previews]);

  const notifyChange = (newPreviews: PreviewFile[]) => {
    onFilesChange?.(newPreviews.map((p) => p.file));
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setInternalError(null);

    const newFiles = Array.from(fileList);
    
    // Validasi jumlah foto
    if (previews.length + newFiles.length > maxFiles) {
      setInternalError(`Maksimal ${maxFiles} foto diperbolehkan.`);
      return;
    }

    setIsCompressing(true);
    const processedFiles: PreviewFile[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      let file = newFiles[i];

      // Validasi format file
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isHeic = file.type === "image/heic" || file.type === "image/heif" || ext === "heic";
      const validTypes = ["image/jpeg", "image/png"];
      
      if (!isHeic && !validTypes.includes(file.type)) {
        setInternalError(`Format file ${file.name} tidak didukung. Gunakan JPG atau PNG.`);
        continue;
      }

      // Validasi ukuran sebelum kompresi (mencegah browser hang)
      if (file.size > maxSizeMB * 1024 * 1024) {
        setInternalError(`Ukuran file ${file.name} terlalu besar (maks ${maxSizeMB}MB sebelum kompresi).`);
        continue;
      }

      try {
        // Konversi HEIC ke JPG menggunakan heic2any
        if (isHeic) {
          const heic2any = (await import("heic2any")).default;
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });
          // heic2any bisa mereturn array jika animasi, kita ambil frame pertama
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          file = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
        }

        // Kompresi JPG/PNG dengan browser-image-compression
        const options = {
          maxSizeMB: 0.3, // Target ~300 KB
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          initialQuality: 0.8,
        };
        const imageCompression = (await import("browser-image-compression")).default;
        const compressedBlob = await imageCompression(file, options);
        // Pertahankan nama file asli, ganti ukurannya
        const compressedFile = new File([compressedBlob], file.name, { type: file.type });

        processedFiles.push({
          id: Math.random().toString(36).substring(7),
          file: compressedFile,
          previewUrl: URL.createObjectURL(compressedFile),
        });
      } catch (err) {
        console.error("Error compressing image:", err);
        setInternalError(`Gagal memproses file ${file.name}.`);
      }
    }

    // Update state dan form
    if (processedFiles.length > 0) {
      const updatedPreviews = [...previews, ...processedFiles];
      setPreviews(updatedPreviews);
      notifyChange(updatedPreviews);
    }
    
    setIsCompressing(false);
    if (inputRef.current) inputRef.current.value = ""; // Reset input type file
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (idToRemove: string) => {
    const updated = previews.filter((p) => p.id !== idToRemove);
    setPreviews(updated);
    notifyChange(updated);
    // Cleanup URL segera
    const toRemove = previews.find((p) => p.id === idToRemove);
    if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
    setInternalError(null);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-text">{label}</span>
          <span className="text-[11px] text-text-muted">{previews.length}/{maxFiles}</span>
        </div>
      )}
      
      {/* Area Preview */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-1">
          {previews.map((preview) => (
            <div key={preview.id} className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview.previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={() => removeFile(preview.id)}
                className="absolute top-1 right-1 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 backdrop-blur-sm"
                aria-label="Hapus foto"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Area Upload (Hilang otomatis jika mencapai batas maxFiles) */}
      {previews.length < maxFiles && (
        <div
          role="button"
          tabIndex={0}
          aria-label={label ?? "Upload file"}
          onClick={() => { if (!isCompressing) inputRef.current?.click(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !isCompressing) inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); if (!isCompressing) setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={!isCompressing ? handleDrop : (e) => e.preventDefault()}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed transition-all duration-150 ${
            isCompressing ? "cursor-wait opacity-70 border-border" : "cursor-pointer"
          } ${
            isDragging
              ? "border-accent bg-blue-50"
              : error || internalError
              ? "border-red-400 bg-red-50 hover:bg-red-50"
              : "border-border bg-white hover:border-accent hover:bg-bg"
          }`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center gap-2 text-text">
              <svg className="w-6 h-6 animate-spin text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-25" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium">Memproses foto...</p>
            </div>
          ) : (
            <>
              {/* Upload icon */}
              <svg
                className={`w-8 h-8 ${isDragging ? "text-accent" : "text-gray-400"}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>

              <div className="text-center">
                <p className="text-sm font-medium text-text">
                  Klik atau seret foto ke sini
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">
                  JPG / PNG / HEIC
                </p>
              </div>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={handleChange}
            aria-hidden="true"
            disabled={isCompressing}
          />
        </div>
      )}
      
      {/* Error / Helper text */}
      {(error || internalError) && <p className="text-[11px] text-red-500 font-medium">{internalError || error}</p>}
      {!(error || internalError) && helperText && (
        <p className="text-[11px] text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
