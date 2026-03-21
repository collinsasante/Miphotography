const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

/** Build a Cloudinary delivery URL with transformations */
export function getImageUrl(
  publicId: string,
  opts: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: "auto" | "webp" | "avif" | "jpg";
    watermark?: boolean;
    crop?: "fill" | "fit" | "scale" | "thumb";
    gravity?: "auto" | "face" | "center";
  } = {}
): string {
  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    watermark = false,
    crop = "fill",
    gravity = "auto",
  } = opts;

  const transforms: string[] = [];
  if (width || height) {
    const dims = [width ? `w_${width}` : "", height ? `h_${height}` : ""]
      .filter(Boolean)
      .join(",");
    transforms.push(`${dims},c_${crop},g_${gravity}`);
  }
  transforms.push(`q_${quality}`, `f_${format}`);
  if (watermark) {
    transforms.push("l_kofi_watermark,o_25,g_south_east,x_20,y_20");
  }

  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transforms.join("/")}/${publicId}`;
}

/** Tiny blurred placeholder for next/image blur prop */
export function getBlurDataUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_20,e_blur:800,f_auto,q_10/${publicId}`;
}

/** Upload an image server-side via Cloudinary REST API (edge-compatible) */
export async function uploadToCloudinary(
  file: File | Blob,
  folder = "portfolio"
): Promise<CloudinaryUploadResult> {
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);

  // Generate SHA-1 signature (edge-compatible)
  const str = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  return res.json();
}

/** Delete an image by public ID */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);

  const str = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`, {
    method: "POST",
    body: formData,
  });
}
