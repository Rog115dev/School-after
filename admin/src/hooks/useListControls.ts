import { useMemo, useState } from "react";

export type StatusFilter = "all" | "published" | "draft" | "active" | "disabled";

export function useListControls<T>(
  items: T[],
  getSearchText: (item: T) => string,
  getStatus?: (item: T) => "published" | "draft" | "active" | "disabled",
  initialPageSize = 8
) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (q && !getSearchText(item).toLowerCase().includes(q)) return false;
      if (status !== "all" && getStatus) return getStatus(item) === status;
      return true;
    });
  }, [items, search, status, getSearchText, getStatus]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  function setPageSize(value: number) {
    const next = Math.min(100, Math.max(1, Math.round(value) || 1));
    setPageSizeState(next);
    setPage(1);
  }

  return {
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    status,
    setStatus: (value: StatusFilter) => {
      setStatus(value);
      setPage(1);
    },
    page: safePage,
    setPage,
    pageCount,
    pageSize,
    setPageSize,
    filteredCount: filtered.length,
    totalCount: items.length,
    pageItems,
    start: filtered.length ? start + 1 : 0,
    end: Math.min(start + pageSize, filtered.length),
  };
}
