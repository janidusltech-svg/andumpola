// lib/crop.ts
// Turns a crop area from react-easy-crop into an actual cropped image File.

export type CropArea = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function getCroppedFile(
  imageSrc: string,
  area: CropArea,
  outWidth: number,
  outHeight: number,
  fileName = "image.jpg"
): Promise<File> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    outWidth,
    outHeight
  );

  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.88
    )
  );

  return new File([blob], fileName, { type: "image/jpeg" });
}
