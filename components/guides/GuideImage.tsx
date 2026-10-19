import { existsSync } from "node:fs";
import path from "node:path";

type GuideImageProps = {
  /** Path under public/, e.g. "/guides/building-apps/design-canvas.png". */
  src: string;
  alt: string;
  caption?: string;
};

/* Shows the screenshot once its file exists in public/; until then, a dashed slot naming the file to add. */
export function GuideImage({ src, alt, caption }: GuideImageProps) {
  const exists = existsSync(path.join(process.cwd(), "public", src));

  return (
    <figure className="my-8">
      {exists ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full rounded-2xl border border-border-subtle"
          loading="lazy"
        />
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-subtle bg-background-elevated p-6 text-center">
          <span className="text-lg font-semibold text-foreground">Screenshot coming soon</span>
          {process.env.NODE_ENV === "development" ? (
            <span className="font-mono text-base text-muted-foreground">Add public{src}</span>
          ) : null}
        </div>
      )}
      {caption ? (
        <figcaption className="mt-3 text-center text-base text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
