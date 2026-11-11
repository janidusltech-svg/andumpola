"use client";
// components/InstallApp.tsx — "Install AndumPola on your phone" card
import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallApp() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    try {
      if (localStorage.getItem("ap-install-hide") === "1") setHidden(true);
    } catch {}
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || hidden || (!evt && !ios)) return null;

  function hide() {
    setHidden(true);
    try {
      localStorage.setItem("ap-install-hide", "1");
    } catch {}
  }

  return (
    <div className="mb-5 rounded-xl border border-line bg-white p-4 flex items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-lg" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">Put AndumPola on your phone</p>
        {ios && !evt ? (
          <p className="text-soft">
            Tap <strong>Share</strong> ⬆️ then <strong>Add to Home Screen</strong>{" "}
            — open your shop like an app.
          </p>
        ) : (
          <p className="text-soft">Open your shop and orders in one tap, like an app.</p>
        )}
        <div className="flex gap-2 mt-2">
          {evt && (
            <button
              type="button"
              onClick={async () => {
                await evt.prompt();
                const r = await evt.userChoice;
                if (r.outcome === "accepted") setInstalled(true);
                setEvt(null);
              }}
              className="rounded-lg bg-berry text-white font-semibold px-4 py-1.5"
            >
              Install app
            </button>
          )}
          <button type="button" onClick={hide} className="text-soft underline">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
