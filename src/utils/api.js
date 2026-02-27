const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || "https://eutrbackendapi.onrender.com";

export const getApiUrl = (path) => {

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!rawBaseUrl) return normalizedPath;
  return `${rawBaseUrl.replace(/\/$/, "")}${normalizedPath}`;
};
