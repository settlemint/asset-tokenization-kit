export function slugify(text: string, unique = false): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!unique) {
    return base;
  }

  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  return `${base}-${suffix}`;
}
