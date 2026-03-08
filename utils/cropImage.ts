export const getCroppedImg = async (
  imageSrc: string,
  crop: any,
  fileName: string
) => {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx?.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], fileName, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg");
  });
};