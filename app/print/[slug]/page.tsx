// app/print/[slug]/page.tsx — A4 counter poster with the shop's QR code.
// Sizes use "cqw" (percent of the poster width), so the same poster fits a
// phone screen AND prints exactly on A4. The QR code is made on our server
// (no outside service), so it always loads.
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { supabasePublic } from "@/lib/supabase/public";
import PrintButton from "@/components/PrintButton";
import { T } from "@/lib/i18n";

export const metadata = {
  title: "Shop poster — AndumPola",
  robots: { index: false, follow: false },
};

export default async function PrintPoster({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: shop } = await supabasePublic()
    .from("shops")
    .select("name, slug, logo_url, city")
    .eq("slug", slug)
    .maybeSingle();
  if (!shop) notFound();

  const url = `https://www.andumpola.lk/${shop.slug}`;
  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#1b1720", light: "#ffffff" },
  });
  const longName = shop.name.length > 18;

  return (
    <div className="poster-page bg-sand min-h-screen py-4 sm:py-6">
      <style>{`
        @page { size: A4; margin: 0; }
        .poster-qr svg { width: 100%; height: 100%; display: block; }
        @media print {
          header, footer, .no-print { display: none !important; }
          html, body { background: #fff !important; }
          .poster-page { padding: 0 !important; background: #fff !important; min-height: 0 !important; }
          .poster { width: 210mm !important; max-width: none !important; height: 297mm !important;
                    box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print mx-auto max-w-[210mm] px-4 mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-soft">
          <T k="posterHint" />
        </p>
        <PrintButton />
      </div>

      <div className="px-3 sm:px-4">
        <div
          className="poster mx-auto bg-white w-full max-w-[210mm] aspect-[210/297] shadow rounded-sm overflow-hidden"
          style={{ containerType: "inline-size" }}
        >
          <div className="h-full flex flex-col items-center justify-between text-center px-[6cqw] py-[6.5cqw]">
            {/* Shop */}
            <div className="flex flex-col items-center w-full">
              {shop.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.logo_url}
                  alt=""
                  className="h-[13cqw] w-[13cqw] object-contain rounded-[2cqw] mb-[2cqw]"
                />
              )}
              <h1
                className={`display font-extrabold leading-[1.05] break-words w-full ${
                  longName ? "text-[7.5cqw]" : "text-[9.5cqw]"
                }`}
              >
                {shop.name}
              </h1>
              {shop.city && (
                <p className="text-soft text-[3cqw] mt-[1cqw]">{shop.city}</p>
              )}
            </div>

            {/* Call to action + QR */}
            <div className="flex flex-col items-center">
              <p className="display font-bold text-[5.2cqw] text-berry leading-tight">
                <T k="posterScan" />
              </p>
              <p className="text-[3.6cqw] mt-[0.6cqw] font-medium">
                <T k="posterOrder" /> 📲
              </p>
              <div className="mt-[3.5cqw] p-[2cqw] rounded-[2.5cqw] border-[0.7cqw] border-berry bg-white">
                <div
                  className="poster-qr w-[44cqw] h-[44cqw]"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              </div>
              <p className="mt-[2.5cqw] text-[3.6cqw] font-bold tracking-tight break-all">
                andumpola.lk/{shop.slug}
              </p>
            </div>

            {/* Footer */}
            <p className="text-[2.8cqw] text-soft">
              <T k="posterFooter" />{" "}
              <strong className="text-ink">
                Andum<span className="text-berry">Pola</span>
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
