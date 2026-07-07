"use client";
// components/OrderButton.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadReceipt } from "@/lib/upload";
import { formatLKR } from "@/lib/types";

type Bank = {
  bank_name: string | null;
  bank_branch: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
};

export default function OrderButton({
  productId,
  price,
  sizes,
  shopName,
  bank,
}: {
  productId: string;
  price: number;
  sizes: string[];
  shopName: string;
  bank: Bank;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    size: sizes[0] ?? "",
    quantity: 1,
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total = price * f.quantity;

  function next() {
    setError("");
    if (
      !f.customer_name.trim() ||
      !f.customer_phone.trim() ||
      !f.customer_address.trim() ||
      !f.size
    ) {
      setError("Please fill in all fields.");
      return;
    }
    setStep(2);
  }

  async function submit() {
    setError("");
    if (!receipt) {
      setError("Please upload your bank deposit receipt.");
      return;
    }
    setLoading(true);
    try {
      const receipt_path = await uploadReceipt(receipt, `order/${productId}`);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, product_id: productId, receipt_path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order.");
      router.push(`/order/success?ref=${data.order_ref}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const hasBank = bank.bank_account_number;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-turmeric text-ink font-bold py-3 hover:opacity-90 mt-3"
      >
        Order online
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-sand w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-sand border-b border-line px-5 py-4 flex items-center justify-between">
              <h3 className="display font-bold text-lg">
                {step === 1 ? "Your details" : "Pay & upload receipt"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-soft hover:text-berry text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3">
              {step === 1 ? (
                <>
                  <Field
                    label="Full name *"
                    value={f.customer_name}
                    onChange={(v) => setF({ ...f, customer_name: v })}
                  />
                  <Field
                    label="Phone *"
                    value={f.customer_phone}
                    onChange={(v) => setF({ ...f, customer_phone: v })}
                    placeholder="0771234567"
                  />
                  <label className="block">
                    <span className="text-sm font-medium">
                      Delivery address *
                    </span>
                    <textarea
                      value={f.customer_address}
                      onChange={(e) =>
                        setF({ ...f, customer_address: e.target.value })
                      }
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40 resize-none"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-medium">Size *</span>
                      <select
                        value={f.size}
                        onChange={(e) => setF({ ...f, size: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 bg-white"
                      >
                        {sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Quantity *</span>
                      <input
                        type="number"
                        min={1}
                        value={f.quantity}
                        onChange={(e) =>
                          setF({
                            ...f,
                            quantity: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5"
                      />
                    </label>
                  </div>

                  <div className="rounded-lg bg-white border border-line p-3 flex justify-between">
                    <span className="text-sm text-soft">Total</span>
                    <span className="display font-bold">
                      {formatLKR(total)}
                    </span>
                  </div>

                  {error && <p className="text-sm text-berry">{error}</p>}
                  <button
                    onClick={next}
                    className="w-full rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  {hasBank ? (
                    <div className="rounded-lg bg-white border border-line p-4 text-sm">
                      <p className="font-semibold mb-2">
                        Deposit {formatLKR(total)} to {shopName}:
                      </p>
                      <dl className="space-y-1 text-soft">
                        <Row k="Bank" v={bank.bank_name} />
                        <Row k="Branch" v={bank.bank_branch} />
                        <Row k="Account name" v={bank.bank_account_name} />
                        <Row k="Account number" v={bank.bank_account_number} />
                      </dl>
                    </div>
                  ) : (
                    <p className="text-sm text-berry">
                      This shop hasn&apos;t added bank details yet. Please
                      contact them on WhatsApp instead.
                    </p>
                  )}

                  <label className="block">
                    <span className="text-sm font-medium">
                      Upload deposit receipt *
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                      className="mt-1 w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-berry file:px-3 file:py-2 file:text-white file:font-medium"
                    />
                    {receipt && (
                      <span className="text-xs text-leaf mt-1 block">
                        {receipt.name}
                      </span>
                    )}
                  </label>

                  <p className="text-[11px] text-soft">
                    Payment goes directly to {shopName}. AndumPola does not
                    process or hold payments. The shop confirms your order after
                    checking their account.
                  </p>

                  {error && <p className="text-sm text-berry">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-line font-semibold px-4 py-3"
                    >
                      Back
                    </button>
                    <button
                      onClick={submit}
                      disabled={loading || !hasBank}
                      className="flex-1 rounded-lg bg-berry text-white font-semibold py-3 hover:bg-berry-dark disabled:opacity-60"
                    >
                      {loading ? "Placing order…" : "Place order"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
      />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{k}</dt>
      <dd className="font-medium text-ink text-right">{v || "—"}</dd>
    </div>
  );
}
