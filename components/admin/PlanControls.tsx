"use client";
// components/admin/PlanControls.tsx — admin tools for one shop's plan
import { useState, useTransition } from "react";
import {
  addFreeDays,
  setPlanAndEndDate,
  recordManualPayment,
} from "@/app/admin/actions";

const PRICE = { basic: 1000, pro: 2000 } as const;

export default function PlanControls({
  shopId,
  plan,
  endIso,
}: {
  shopId: string;
  plan: string;
  endIso: string | null;
}) {
  const [busy, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // free days
  const [days, setDays] = useState(30);
  // set plan/date
  const [newPlan, setNewPlan] = useState(plan);
  const [date, setDate] = useState(
    (endIso ? new Date(endIso) : new Date()).toISOString().slice(0, 10)
  );
  // manual payment
  const [payPlan, setPayPlan] = useState<"basic" | "pro">(
    plan === "pro" ? "pro" : "basic"
  );
  const [months, setMonths] = useState(1);
  const [amount, setAmount] = useState<number>(PRICE.basic);
  const [note, setNote] = useState("");

  function run(fn: () => Promise<void>, ok: string) {
    setMsg(null);
    start(async () => {
      try {
        await fn();
        setMsg({ ok: true, text: ok });
      } catch (e: unknown) {
        setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" });
      }
    });
  }

  const input =
    "rounded-lg border border-line bg-white px-3 py-2 text-sm w-full focus:outline-none focus:border-berry";
  const btn =
    "rounded-lg bg-berry text-white text-sm font-semibold px-4 py-2 disabled:opacity-60 whitespace-nowrap";

  return (
    <div className="space-y-4">
      {msg && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            msg.ok ? "bg-leaf/10 text-leaf" : "bg-berry/10 text-berry"
          }`}
        >
          {msg.ok ? "✅ " : "⚠️ "}
          {msg.text}
        </p>
      )}

      {/* 1. Free days */}
      <Card
        title="🎁 Give free days"
        hint={`Adds days to the current ${plan === "trial" ? "trial" : "plan"}. If it already expired, counts from today.`}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {[7, 14, 30, 60].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-full border px-3 py-1 text-sm ${
                days === d
                  ? "bg-berry text-white border-berry"
                  : "border-line bg-white"
              }`}
            >
              +{d} days
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={input}
          />
          <button
            disabled={busy}
            className={btn}
            onClick={() =>
              run(() => addFreeDays(shopId, days), `Added ${days} free days`)
            }
          >
            Add days
          </button>
        </div>
      </Card>

      {/* 2. Record cash payment */}
      <Card
        title="💵 Record a payment (cash / in person)"
        hint="Use this when the owner paid you directly. Extends their plan by the months paid."
      >
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-soft">
            Plan
            <select
              value={payPlan}
              onChange={(e) => {
                const p = e.target.value as "basic" | "pro";
                setPayPlan(p);
                setAmount(PRICE[p] * months);
              }}
              className={input}
            >
              <option value="basic">Basic (LKR 1,000)</option>
              <option value="pro">Pro (LKR 2,000)</option>
            </select>
          </label>
          <label className="text-xs text-soft">
            Months
            <input
              type="number"
              min={1}
              max={24}
              value={months}
              onChange={(e) => {
                const m = Number(e.target.value);
                setMonths(m);
                setAmount(PRICE[payPlan] * (m || 0));
              }}
              className={input}
            />
          </label>
          <label className="text-xs text-soft">
            Amount (LKR)
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={input}
            />
          </label>
          <label className="text-xs text-soft">
            Note (optional)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. paid cash at shop"
              className={input}
            />
          </label>
        </div>
        <button
          disabled={busy}
          className={`${btn} mt-3 w-full`}
          onClick={() => {
            if (
              confirm(
                `Record LKR ${amount.toLocaleString()} for ${months} month(s) of ${payPlan.toUpperCase()}?`
              )
            )
              run(
                () => recordManualPayment(shopId, payPlan, months, amount, note),
                "Payment recorded and plan extended"
              );
          }}
        >
          Record payment
        </button>
      </Card>

      {/* 3. Exact plan + date */}
      <Card
        title="🛠️ Set plan & end date exactly"
        hint="For corrections. Sets the plan and the exact last day."
      >
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
            className={input}
          >
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={input}
          />
        </div>
        <button
          disabled={busy || !date}
          className={`${btn} mt-3 w-full !bg-ink`}
          onClick={() => {
            if (confirm(`Set plan to ${newPlan.toUpperCase()} ending ${date}?`))
              run(
                () =>
                  setPlanAndEndDate(
                    shopId,
                    newPlan as "trial" | "basic" | "pro",
                    date
                  ),
                "Plan updated"
              );
          }}
        >
          Save
        </button>
      </Card>
    </div>
  );
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-soft mb-3">{hint}</p>
      {children}
    </div>
  );
}
