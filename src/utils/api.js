const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

const sanitizeBaseUrl = (value) =>
  String(value || "")
    .trim()
    .replace(/^\{+|\}+$/g, "")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "");

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

  const base = sanitizeBaseUrl(rawBaseUrl).replace(/\/+$/, "");
  const cleanPath = String(path).replace(/^\/+/, "");
  const normalizedPath =
    base.endsWith("/api") && cleanPath.toLowerCase().startsWith("api/")
      ? cleanPath.slice(4)
      : cleanPath;

  if (!base) return `/${normalizedPath}`;
  if (!cleanPath) return base;

  return `${base}/${normalizedPath}`;
};

export const postJson = async (path, payload, options = {}) => {
  const csrfToken = getCookie("csrftoken");
  const { headers = {}, credentials = "omit", ...restOptions } = options;

  return fetch(getApiUrl(path), {
    method: "POST",
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...(credentials === "include" && csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...headers
    },
    body: JSON.stringify(payload),
    ...restOptions
  });
};

export const putJson = async (path, payload, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  return fetch(getApiUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(payload),
    ...restOptions
  });
};

const submitFormData = async (method, path, payload, options = {}) => {
  const csrfToken = getCookie("csrftoken");
  const { headers = {}, credentials = "omit", ...restOptions } = options;

  return fetch(getApiUrl(path), {
    method,
    credentials,
    headers: {
      ...(credentials === "include" && csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...headers
    },
    body: payload,
    ...restOptions
  });
};

export const postFormData = async (path, payload, options = {}) =>
  submitFormData("POST", path, payload, options);

export const putFormData = async (path, payload, options = {}) =>
  submitFormData("PUT", path, payload, options);

export const deleteJson = async (path, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  return fetch(getApiUrl(path), {
    method: "DELETE",
    headers: {
      ...headers
    },
    ...restOptions
  });
};

export const readApiError = async (response) => {
  try {
    const data = await response.json();
    if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;

    const flattened = Object.values(data || {})
      .flat()
      .filter(Boolean)
      .join(" ");
    if (flattened.trim()) return flattened;
  } catch {
    // Ignore JSON parsing errors and fallback to generic status text.
  }

  return `Request failed (${response.status})`;
};
