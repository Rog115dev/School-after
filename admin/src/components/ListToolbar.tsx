import type { StatusFilter } from "../hooks/useListControls";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  status: StatusFilter;
  onStatus: (value: StatusFilter) => void;
  statusOptions?: Array<{ value: StatusFilter; label: string }>;
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  pageSize: number;
  onPageSize: (size: number) => void;
  start: number;
  end: number;
  filteredCount: number;
  totalCount: number;
  hideStatus?: boolean;
};

const defaultStatus = [
  { value: "all" as const, label: "All" },
  { value: "published" as const, label: "Published" },
  { value: "draft" as const, label: "Draft" },
];

export function ListToolbar({
  search,
  onSearch,
  searchPlaceholder = "Search…",
  status,
  onStatus,
  statusOptions = defaultStatus,
  page,
  pageCount,
  onPage,
  pageSize,
  onPageSize,
  start,
  end,
  filteredCount,
  totalCount,
  hideStatus = false,
}: Props) {
  return (
    <div className="list-toolbar">
      <input
        className="list-search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={searchPlaceholder}
      />
      {!hideStatus ? (
        <select
          className="list-filter"
          value={status}
          onChange={(e) => onStatus(e.target.value as StatusFilter)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : null}
      <label className="list-size">
        Show
        <input
          type="number"
          min={1}
          max={100}
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
        />
      </label>
      <div className="list-pager">
        <span className="muted">
          {filteredCount
            ? `${start}–${end} of ${filteredCount}`
            : `0 of ${totalCount}`}
        </span>
        <button
          type="button"
          className="btn secondary small"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>
        <span className="muted">
          {page}/{pageCount}
        </span>
        <button
          type="button"
          className="btn secondary small"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
