"use client";
// components/ReviewForm.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({ shopId }: { shopId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [state, setState] = useState<
    "loading" | "guest" | "not_customer" | "ready"
  >("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [existing, setExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState("guest");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "customer") {
        setState("not_customer");
        return;
      }
      setUserId(user.id);
      // load their existing review if any
      const { data: mine } = await supabase
        .from("reviews")
        .select("rating, comment")
        .eq("shop_id", shopId)
        .eq("customer_id", user.id)
        .maybeSingle();
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment ?? "");
        setExisting(true);
      }
      setState("ready");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  async function submit() {
    setError("");
    setMsg("");
    if (!userId) return;
    if (rating < 1) {
      setError("Please pick a star rating.");
      return;
    }
    if (comment.trim().length > 500) {
      setError("Review is too long (max 500 characters).");
      return;
    }
    setSaving(true);
    const { error: e } = await supabase.from("reviews").upsert(
      {
        shop_id: shopId,
        customer_id: userId,
        rating,
        comment: comment.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "shop_id,customer_id" }
    );
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    setMsg(existing ? "Review updated!" : "Thanks for your review!");
    setExisting(true);
    router.refresh(); // refresh server-rendered reviews list
  }

  if (state === "loading") {
    return <div className="h-10" />;
  }

  if (state === "guest") {
    return (
      <div className="rounded-xl bg-sand border border-line p-4 text-sm">
        <span className="text-soft">Want to review this shop? </span>
        <Link href="/account/login" className="text-berry font-semibold">
          Log in
        </Link>
        <span className="text-soft"> or </span>
        <Link href="/account/signup" className="text-berry font-semibold">
          create a free account
        </Link>
        <span className="text-soft"> — it takes a minute.</span>
      </div>
    );
  }

  if (state === "not_customer") {
    return (
      <p className="text-xs text-soft">
        Shop accounts can&apos;t leave reviews — only customers.
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-line p-4 sm:p-5">
      <p className="font-semibold text-sm mb-2">
        {existing ? "Your review" : "Rate this shop"}
      </p>

      {/* Star picker */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl leading-none transition-transform active:scale-90 ${
              n <= (hover || rating) ? "text-turmeric" : "text-line"
            }`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="How was your experience with this shop? (optional)"
        className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-berry/40"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-soft">{comment.length}/500</span>
        <button
          onClick={submit}
          disabled={saving}
          className="rounded-lg bg-berry text-white font-semibold px-5 py-2.5 text-sm hover:bg-berry-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : existing ? "Update review" : "Post review"}
        </button>
      </div>
      {error && <p className="text-sm text-berry mt-2">{error}</p>}
      {msg && <p className="text-sm text-leaf mt-2">{msg}</p>}
    </div>
  );
}
