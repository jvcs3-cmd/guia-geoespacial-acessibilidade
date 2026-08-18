import { ACCESS_MAP, type AccessKey } from "@/lib/places"
import { cn } from "@/lib/utils"

export function AccessBadge({
  type,
  size = "sm",
  showLabel = true,
}: {
  type: AccessKey
  size?: "sm" | "md"
  showLabel?: boolean
}) {
  const t = ACCESS_MAP[type]
  const Icon = t.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        t.badge,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
      )}
      title={t.description}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} aria-hidden />
      {showLabel && t.short}
    </span>
  )
}
