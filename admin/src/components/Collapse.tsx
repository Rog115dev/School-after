import { useState, type ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  actions?: ReactNode;
  children: ReactNode;
};

export function Collapse({
  title,
  subtitle,
  defaultOpen = false,
  actions,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`collapse ${open ? "open" : ""}`}>
      <div className="collapse-head">
        <button
          type="button"
          className="collapse-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="collapse-chevron">{open ? "▾" : "▸"}</span>
          <span>
            <strong>{title}</strong>
            {subtitle ? <span className="muted collapse-sub">{subtitle}</span> : null}
          </span>
        </button>
        {actions ? <div className="row-actions">{actions}</div> : null}
      </div>
      {open ? <div className="collapse-body">{children}</div> : null}
    </div>
  );
}
