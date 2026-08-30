export function normalizeNavigationPathname(pathname: string, basePath = "") {
  let normalized = pathname || "/";
  const normalizedBasePath = basePath.replace(/\/$/, "");

  if (normalizedBasePath) {
    if (normalized === normalizedBasePath) normalized = "/";
    else if (normalized.startsWith(`${normalizedBasePath}/`)) {
      normalized = normalized.slice(normalizedBasePath.length);
    }
  }

  if (!normalized.startsWith("/")) normalized = `/${normalized}`;
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, "");
  return normalized || "/";
}

export function isPrimaryNavigationActive(pathname: string, href: string, basePath = "") {
  const current = normalizeNavigationPathname(pathname, basePath);
  const target = normalizeNavigationPathname(href);

  if (target === "/") {
    return current === "/" || current.startsWith("/pokemon/");
  }
  return current === target || current.startsWith(`${target}/`);
}
