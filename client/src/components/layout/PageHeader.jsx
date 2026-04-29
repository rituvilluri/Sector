export default function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="label-cap" style={{ marginBottom: 12 }}>{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <div className="page-header-sub">{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
