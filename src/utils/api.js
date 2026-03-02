const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || "https://eutrbackendapi.onrender.com";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return "";
};

export const getApiUrl = (path = "") => {
  if (/^https?:\/\//i.test(path)) return path;

  const base = (rawBaseUrl || "").replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");

  if (!base) return `/${cleanPath}`;
  if (!cleanPath) return base;

  return `${base}/${cleanPath}`;
};

export const postJson = async (path, payload, options = {}) => {
  const csrfToken = getCookie("csrftoken");
  const { headers = {}, ...restOptions } = options;

  return fetch(getApiUrl(path), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...headers
    },
    body: JSON.stringify(payload),
    ...restOptions
  });
};
