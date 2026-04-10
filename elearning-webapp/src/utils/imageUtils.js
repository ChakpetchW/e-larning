/**
 * Utilities for client-side image processing and compression
 */

/**
 * Compresses an image file before upload to avoid Vercel's 4.5MB payload limit.
 * @param {File} file - The original file
 * @param {object} options - Compression options
 * @returns {Promise<File>} - The compressed file
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.8,
    type = 'image/jpeg'
  } = options;

  // Don't process non-images or small files
  if (!file.type.startsWith('image/') || file.size < 1024 * 1024) {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            // Preserve original filename but maybe change extension if converted
            const newFile = new File([blob], file.name, {
              type: type,
              lastModified: Date.now()
            });
            resolve(newFile);
          },
          type,
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
