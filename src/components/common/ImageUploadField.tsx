import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Video, Loader2, Link as LinkIcon, X, FolderOpen, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.ts';
import { MediaItem } from '../../types.ts';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  required?: boolean;
}

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.m4v') ||
    url.includes('/video')
  );
};

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  required = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setUploadError('Please select a valid image (JPG, PNG, WebP, AVIF, SVG) or video (MP4, WebM, MOV)');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Media file size exceeds maximum limit of 100MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const res = await api.uploadMedia(file);
      onChange(res.url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Media upload failed. You may enter a media URL directly.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenMediaLibrary = async () => {
    setShowMediaModal(true);
    setLoadingMedia(true);
    try {
      const items = await api.getMediaLibrary();
      setMediaLibrary(items);
    } catch (err) {
      console.error('Failed to load media library:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleDeleteMediaFromLibrary = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this media file from storage?')) return;
    try {
      await api.deleteMedia(id);
      setMediaLibrary((prev) => prev.filter((item) => item.id !== id));
      if (value.includes(id)) {
        onChange('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete media asset');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const filteredMedia = mediaLibrary.filter((item) => {
    if (mediaFilter === 'image') return item.mimeType?.startsWith('image/');
    if (mediaFilter === 'video') return item.mimeType?.startsWith('video/');
    return true;
  });

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#A39E93]">
            {label} {required && <span className="text-[#B08D57]">*</span>}
          </label>
          {value && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#B08D57]/20 text-[#B08D57] uppercase font-semibold">
              {isVideoUrl(value) ? 'Video Asset' : 'Image Asset'}
            </span>
          )}
        </div>
      )}

      {/* Current Preview or Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border transition-all rounded-none ${
          isDragging
            ? 'border-[#B08D57] bg-[#B08D57]/10'
            : value
            ? 'border-white/10 bg-[#161616]'
            : 'border-dashed border-white/20 hover:border-white/40 bg-[#141414]'
        } p-4`}
      >
        {value ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-32 h-24 bg-black/80 border border-white/10 overflow-hidden flex-shrink-0 group">
              {isVideoUrl(value) ? (
                <video
                  src={value}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <img
                  src={value}
                  alt="Uploaded media preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              )}
              <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-[#F2EEE7] pointer-events-none">
                {isVideoUrl(value) ? 'VIDEO' : 'PHOTO'}
              </div>
            </div>

            <div className="flex-grow min-w-0">
              <p className="text-xs font-mono text-[#E4DCD0] truncate max-w-md">{value}</p>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs font-mono text-[#B08D57] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Replace Photo / Video
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={handleOpenMediaLibrary}
                  className="text-xs font-mono text-[#B08D57] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Media Library
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs font-mono text-[#A39E93] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3" />
                  Edit URL
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-xs font-mono text-red-400/80 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#B08D57]">
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </div>
            <p className="text-sm font-serif text-[#F2EEE7]">
              Drag photography or video clip here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-[#B08D57] hover:underline font-semibold cursor-pointer"
              >
                browse files
              </button>
            </p>
            <p className="text-[11px] font-mono text-[#A39E93] mt-1">
              Supports JPG, PNG, WebP, AVIF, MP4, WebM up to 100MB • Stored in Persistent Storage
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenMediaLibrary}
                className="text-xs font-mono text-[#B08D57] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Select from Media Library
              </button>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-mono text-white/50 hover:text-[#B08D57] underline cursor-pointer"
              >
                {showUrlInput ? 'Hide URL input' : 'Enter external URL'}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Manual URL Input Field */}
      {showUrlInput && (
        <div className="pt-2 animate-in fade-in duration-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/... or /api/media/..."
              className="flex-grow px-3 py-2 bg-[#1A1A1A] border border-white/20 focus:border-[#B08D57] text-xs font-mono text-[#F2EEE7] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="px-3 py-2 bg-[#2B2D2F] text-xs font-mono text-[#E4DCD0] hover:bg-[#3A3C3E] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress / Error Messages */}
      {isUploading && (
        <div className="flex items-center gap-2 text-xs font-mono text-[#B08D57] pt-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Uploading and streaming media blob to persistent cloud storage...</span>
        </div>
      )}

      {uploadError && (
        <div className="text-xs font-mono text-red-400 pt-1 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {helperText && !uploadError && (
        <p className="text-[11px] font-mono text-[#8C8276]">{helperText}</p>
      )}

      {/* Media Library Selection Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-[#202124]/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#202124] border border-[#3A3C3E] max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-[#3A3C3E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#B08D57]" />
                <h3 className="font-serif-title uppercase text-sm tracking-widest text-[#F2EEE7]">
                  Persistent Media Storage Library
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-[#3A3C3E] text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setMediaFilter('all')}
                    className={`px-2.5 py-1 ${mediaFilter === 'all' ? 'bg-[#B08D57] text-[#202124] font-bold' : 'text-[#D6CBBE]'}`}
                  >
                    All ({mediaLibrary.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('image')}
                    className={`px-2.5 py-1 ${mediaFilter === 'image' ? 'bg-[#B08D57] text-[#202124] font-bold' : 'text-[#D6CBBE]'}`}
                  >
                    Images
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaFilter('video')}
                    className={`px-2.5 py-1 ${mediaFilter === 'video' ? 'bg-[#B08D57] text-[#202124] font-bold' : 'text-[#D6CBBE]'}`}
                  >
                    Videos
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="text-[#D6CBBE] hover:text-[#F2EEE7] p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              {loadingMedia ? (
                <div className="py-12 text-center text-[#8C8276] text-xs font-mono flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#B08D57]" />
                  Loading persistent media assets...
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="py-12 text-center text-[#8C8276] text-xs font-mono space-y-2">
                  <p>No media files found matching the filter.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#B08D57] text-[#202124] font-semibold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Upload New Asset
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredMedia.map((item) => {
                    const isVideo = item.mimeType?.startsWith('video/') || isVideoUrl(item.url);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onChange(item.url);
                          setShowMediaModal(false);
                        }}
                        className="group relative border border-[#3A3C3E] hover:border-[#B08D57] bg-[#2B2D2F] cursor-pointer overflow-hidden aspect-video flex flex-col justify-between"
                      >
                        {isVideo ? (
                          <div className="relative w-full h-full bg-black flex items-center justify-center">
                            <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Video className="w-8 h-8 text-[#B08D57]" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.altText || item.fileName}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        )}

                        <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMediaFromLibrary(e, item.id)}
                            className="p-1 bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="absolute inset-0 bg-[#202124]/80 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] font-mono text-[#F2EEE7]">
                          <span className="truncate">{item.originalName || item.fileName}</span>
                          <div className="flex items-center justify-between text-[#B08D57] mt-1">
                            <span>{isVideo ? 'VIDEO' : 'PHOTO'}</span>
                            <span className="font-semibold underline">Select</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#3A3C3E] bg-[#2B2D2F] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#8C8276]">
                {filteredMedia.length} of {mediaLibrary.length} stored media assets
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#B08D57] hover:bg-[#9A7745] text-xs font-mono text-[#202124] font-semibold transition-colors cursor-pointer"
                >
                  Upload New File
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaModal(false)}
                  className="px-4 py-1.5 bg-[#202124] hover:bg-[#3A3C3E] text-xs font-mono text-[#F2EEE7] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
