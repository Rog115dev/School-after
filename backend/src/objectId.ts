/** Accept non-empty string ids (cuid / uuid). Legacy Mongo ObjectIds also pass. */
export function asObjectId(value?: string | null) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
