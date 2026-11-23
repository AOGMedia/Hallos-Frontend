// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Upload speed: "2.4 MB/s", "380 KB/s"
export const formatSpeed = (bytesPerSecond: number): string => {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return '';
  const kb = bytesPerSecond / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB/s` : `${(kb / 1024).toFixed(1)} MB/s`;
};

// Time left: "about 4 min left", "less than a minute left", "about 1 h 20 min left"
export const formatTimeLeft = (seconds: number | null): string => {
  if (seconds === null || !Number.isFinite(seconds)) return '';
  if (seconds < 60) return 'less than a minute left';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `about ${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `about ${hours} h${rest ? ` ${rest} min` : ''} left`;
};

const VIDEO_EXTENSIONS = /\.(mp4|m4v|mov|qt|webm|mkv|avi|wmv|flv|3gp|3g2|mpeg|mpg|ts|mts|m2ts|ogv)$/i;

// Some systems give video files no type (e.g. .mkv): fall back to the name.
export const isVideoFile = (file: File): boolean =>
  file.type.startsWith('video/') || (!file.type && VIDEO_EXTENSIONS.test(file.name));

// Format upload progress percentage
export const formatProgress = (progress: number): string => {
  return `${Math.round(progress)}%`;
};

// Format duration for video
export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};