"use client";
// components/admin/CategoryManager.tsx
import { useState, useTransition } from "react";
import { addCategory, deleteCategory } from "@/app/admin/actions";
import { Category } from "@/lib/types";

export default function CategoryManager({
  categories,
}: {
  categories: Category[];
}) {
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    setErr("");
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await addCategory(name);
        setName("");
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : "Failed to add");
      }
    });
  }

  function remove(id: string, label: string) {
    if (!confirm(`Delete "${label}"? Products using it must be moved first.`))
      return;
    startTransition(async () => {
      try {
        await deleteCategory(id);
      } catch {
        setErr(
          "Could not delete — products are still using this category."
        );
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New category name"
          className="flex-1 rounded-lg border border-line px-3 py-2.5 outline-none focus:ring-2 focus:ring-berry/40"
        />
        <button
          onClick={add}
          disabled={pending}
          className="rounded-lg bg-berry text-white font-semibold px-5 disabled:opacity-60"
        >
          Add
        </button>
      </div>
      {err && <p className="text-sm text-berry mb-3">{err}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between bg-white border border-line rounded-lg px-3 py-2"
          >
            <span className="text-sm">{c.name}</span>
            <button
              onClick={() => remove(c.id, c.name)}
              className="text-xs text-soft hover:text-berry"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
