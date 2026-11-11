// components/DeliveryInfo.tsx — delivery / COD / hours chips for shop & product pages
import { T } from "@/lib/i18n";
export default function DeliveryInfo({
  areas,
  fee,
  cod,
  hours,
  compact,
}: {
  areas?: string | null;
  fee?: string | null;
  cod?: boolean | null;
  hours?: string | null;
  compact?: boolean;
}) {
  if (!areas && !fee && !cod && !hours) return null;
  const chip =
    "inline-flex items-center gap-1.5 rounded-full bg-white border border-line px-3 py-1 text-xs sm:text-sm";
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mb-6"}`}>
      {areas && <span className={chip}>🚚 <T k="delivers" />: {areas}</span>}
      {fee && <span className={chip}>💸 <T k="delivery" />: {fee}</span>}
      {cod && (
        <span className={`${chip} border-leaf/40 text-leaf font-medium`}>
          ✅ <T k="cod" />
        </span>
      )}
      {hours && !compact && <span className={chip}>🕒 {hours}</span>}
    </div>
  );
}
