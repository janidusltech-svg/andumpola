"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartIcon() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative p-2 hover:text-berry"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="20" r="1.3" />
        <circle cx="17" cy="20" r="1.3" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 rounded-full bg-berry text-white text-[10px] font-bold min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
