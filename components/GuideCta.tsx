import { DOWNLOAD_PATH } from "@/lib/seo";

/** Download call-to-action card used at the end of public guide pages. */
export function GuideCta({ text }: { text: string }) {
  return (
    <div className="card mt-10 p-5 text-center">
      <p className="font-semibold text-grain-900">{text}</p>
      <a href={DOWNLOAD_PATH} className="btn-primary mt-3 inline-flex">
        Get Sift free for iPhone
      </a>
    </div>
  );
}

/** Small JSON-LD script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
