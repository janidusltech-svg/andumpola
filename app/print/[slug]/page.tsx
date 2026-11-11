// app/print/[slug]/page.tsx — A4 counter poster with the shop's QR code
import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import PrintButton from "@/components/PrintButton";

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
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=0&data=${encodeURIComponent(url)}`;

  return (
    <div className="bg-sand min-h-screen py-6 print:p-0 print:bg-white">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="no-print mx-auto max-w-[210mm] px-4 mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-soft">
          Print on A4 (or save as PDF) and stick it at the counter.
        </p>
        <PrintButton />
      </div>

      <div className="mx-auto bg-white w-full max-w-[210mm] aspect-[210/297] shadow print:shadow-none flex flex-col items-center justify-between text-center px-[12mm] py-[14mm] overflow-hidden">
        <div className="flex flex-col items-center">
          {shop.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.logo_url}
              alt=""
              className="h-[22mm] w-[22mm] object-contain rounded-xl mb-3"
            />
          )}
          <h1 className="display font-extrabold leading-tight text-[13mm]">
            {shop.name}
          </h1>
          {shop.city && <p className="text-soft text-[5mm] mt-1">{shop.city}</p>}
        </div>

        <div className="flex flex-col items-center">
          <p className="display font-bold text-[8mm] text-berry leading-tight">
            Scan to see our products
          </p>
          <p className="text-[5.5mm] mt-1">
            &amp; order on <strong>WhatsApp</strong> 📲
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt="QR code"
            className="mt-5 w-[95mm] h-[95mm] border-[3mm] border-white outline outline-[1mm] outline-berry rounded-lg"
          />
          <p className="mt-4 text-[5mm] font-semibold break-all">
            andumpola.lk/{shop.slug}
          </p>
          <p className="mt-3 text-[5mm] text-soft">
            ස්කෑන් කර අපේ භාණ්ඩ බලන්න · WhatsApp හරහා ඇණවුම් කරන්න
          </p>
          <p className="text-[4.5mm] text-soft">
            ஸ்கேன் செய்து எங்கள் பொருட்களைப் பாருங்கள்
          </p>
        </div>

        <p className="text-[4mm] text-soft">
          Our online shop on <strong className="text-ink">Andum<span className="text-berry">Pola</span></strong>
        </p>
      </div>
    </div>
  );
}
