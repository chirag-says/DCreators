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

/**
 * Upload a local image URI to Cloudinary via unsigned upload preset.
 * Returns the secure_url of the uploaded image.
 * @param localUri  - file:// or content:// URI from ImagePicker
 * @param folder    - Cloudinary folder name (e.g. 'portfolio', 'artworks')
 */
export async function uploadToCloudinary(localUri: string, folder = 'dcreators'): Promise<string> {
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'dcreators_unsigned';
  if (!cloudName) throw new Error('Cloudinary cloud name not configured.');

  const formData = new FormData();
  // React Native FormData accepts { uri, type, name }
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: `upload_${Date.now()}.jpg`,
  } as any);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const json = await response.json();
  return json.secure_url as string;
}
