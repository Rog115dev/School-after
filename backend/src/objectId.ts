const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

/** Mongo ObjectIds are 24 hex characters. Older sessions stored SQLite ids. */
export function asObjectId(value?: string | null) {
  if (!value || !OBJECT_ID.test(value)) return null;
  return value;
}
