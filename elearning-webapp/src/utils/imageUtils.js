/**
 * Compresses an image file if it's too large.
 * Targets a specific max dimension and quality to stay under 4.5MB (Vercel limit).
 */
export const compressImage = async (file, { maxWidth = 1920, quality = 0.8, maxSizeMB = 4 } = {}) => {
  if (!file || !file.type.startsWith('image/')) return file;

  // Don't compress if it's already small enough (under 1MB for safety)
  if (file.size < 1 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if exceeds maxWidth
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            // If still too large, try again with lower quality
            if (compressedFile.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
              resolve(compressImage(compressedFile, { maxWidth, quality: quality - 0.2, maxSizeMB }));
            } else {
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
};
