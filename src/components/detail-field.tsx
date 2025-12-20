
export function DetailField({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon?: React.ReactNode
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <p className={`text-sm leading-relaxed ${highlight ? "font-medium text-foreground" : ""}`}>{value}</p>
    </div>
  )
}
