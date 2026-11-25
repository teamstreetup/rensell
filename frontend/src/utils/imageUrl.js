import { BACKEND_ORIGIN } from '../services/api';

export const PLACEHOLDER_IMAGE = '/photo/placeholder.svg';

export function resolveImageUrl(src) {
  if (!src || typeof src !== 'string') return PLACEHOLDER_IMAGE;
  const trimmed = src.trim();
  if (!trimmed) return PLACEHOLDER_IMAGE;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }
  return trimmed;
}
