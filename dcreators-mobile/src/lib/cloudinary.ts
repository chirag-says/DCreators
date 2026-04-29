const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

type TransformOptions = {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
};

/**
 * Build an optimized Cloudinary URL from a public ID.
 * No API key needed — uses the delivery URL pattern.
 */
export function getCloudinaryUrl(publicId: string, options: TransformOptions = {}): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;

  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push(`c_${crop}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);

  const transformStr = transforms.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
}
