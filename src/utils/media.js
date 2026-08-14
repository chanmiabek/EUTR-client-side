import { getApiUrl } from "./api";

export const resolveMediaUrl = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return (
      resolveMediaUrl(value.secure_url) ||
      resolveMediaUrl(value.url) ||
      resolveMediaUrl(value.image) ||
      resolveMediaUrl(value.logo_url) ||
      resolveMediaUrl(value.logo) ||
      resolveMediaUrl(value.cloudinary?.secure_url) ||
      resolveMediaUrl(value.cloudinary?.url) ||
      ""
    );
  }

  const text = String(value).trim();
  if (!text) return "";
  if (/^(https?:|data:|blob:)/i.test(text)) return text;
  if (text.startsWith("/")) return getApiUrl(text);
  return getApiUrl(`/${text}`);
};

export const resolveItemImage = (item, fields = ["image", "photo", "avatar", "cover_image"]) => {
  for (const field of fields) {
    const value = resolveMediaUrl(item?.[field]);
    if (value) return value;
  }

  return (
    resolveMediaUrl(item?.image_cloudinary) ||
    resolveMediaUrl(item?.logo_cloudinary) ||
    resolveMediaUrl(item?.logo_url_cloudinary) ||
    ""
  );
};
