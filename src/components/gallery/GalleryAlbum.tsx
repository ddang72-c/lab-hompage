import React, { useEffect, useMemo, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import type { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

type FitMode = "auto" | "cover" | "contain";
type AlignMode = "left" | "center";

export type GalleryAlbumProps = {
  images: string[];
  fit?: FitMode;

  singleMaxWidth?: number; 
  singleMaxHeight?: number; 

  rowHeightScale?: number; 
  gapScale?: number; 

  align?: AlignMode;
};

function isExtremeGraphicAR(ar: number) {
  return ar >= 2.2 || ar <= 0.45;
}

async function loadMeta(src: string): Promise<Photo | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      if (w > 0 && h > 0) resolve({ src, width: w, height: h });
      else resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function GalleryAlbum({
  images,
  fit = "auto",
  singleMaxWidth = 860,
  singleMaxHeight = 420,
  rowHeightScale = 1,
  gapScale = 1,
  align = "center",
}: GalleryAlbumProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);

    (async () => {
      const metas = await Promise.all(images.map(loadMeta));
      if (cancelled) return;
      setPhotos(metas.filter(Boolean) as Photo[]);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [images.join("|")]);

  const rowConstraints = useMemo(
    () => ({
      minPhotos: 1,
      maxPhotos: 3,
      singleRowMaxHeight: 520,
    }),
    []
  );

  const targetRowHeight = useMemo(
    () => (containerWidth: number) => {
      const base =
        containerWidth < 520 ? 220 : containerWidth < 900 ? 280 : 340;
      return Math.max(120, Math.round(base * rowHeightScale));
    },
    [rowHeightScale]
  );

  const spacing = useMemo(
    () => (containerWidth: number) => {
      const base = containerWidth < 520 ? 14 : containerWidth < 900 ? 18 : 22;
      return Math.max(6, Math.round(base * gapScale));
    },
    [gapScale]
  );

  if (!ready) return <div className="gpost-loading">Loading images…</div>;

  if (photos.length === 1) {
    const p = photos[0];
    const ar = (p.width || 1) / (p.height || 1);
    const contain = fit === "contain" || (fit === "auto" && isExtremeGraphicAR(ar));
    const objectFit = fit === "cover" ? "cover" : contain ? "contain" : "contain";

    const mdW = Math.round(singleMaxWidth * 0.84);
    const mdH = Math.round(singleMaxHeight * 0.86);
    const smH = Math.round(singleMaxHeight * 0.62);

    const outerDisplay = align === "left" ? "block" : "flex";
    const outerJustify = align === "left" ? "initial" : "center";
    const imgMargin = align === "left" ? "0" : "0 auto";

    return (
      <>
        <div className="single-outer">
          <img
            src={p.src}
            alt=""
            draggable={false}
            className="single-img"
            style={{ objectFit }}
          />
        </div>

        <style>{`
          .gpost-loading{
            color: var(--muted, #6b7280);
            font-size: 14px;
          }

          .single-outer{
            width: 100%;
            display: ${outerDisplay};
            justify-content: ${outerJustify};
            align-items: center;
            border-radius: 0;
            overflow: hidden;
            background: transparent;
          }

          .single-img{
            display: block;
            width: min(${singleMaxWidth}px, 100%);
            max-height: ${singleMaxHeight}px;
            height: auto;
            object-position: center;
            user-select: none;
            pointer-events: none;
            background: transparent;
            margin: ${imgMargin}; /*
          }

          @media (max-width: 900px){
            .single-img{
              width: min(${mdW}px, 100%);
              max-height: ${mdH}px;
            }
          }

          @media (max-width: 520px){
            .single-img{
              width: 100%;
              max-height: ${smH}px;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <RowsPhotoAlbum
        photos={photos}
        spacing={spacing}
        targetRowHeight={targetRowHeight}
        rowConstraints={rowConstraints}
        render={{
          wrapper: (props, ctx) => {
            const ar = (ctx.photo.width || 1) / (ctx.photo.height || 1);
            const contain = fit === "contain" || (fit === "auto" && isExtremeGraphicAR(ar));

            return (
              <div
                {...props}
                style={{
                  ...props.style,
                  borderRadius: 0,
                  overflow: "hidden",
                  background: contain ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.04)",
                }}
              />
            );
          },
          image: (props, ctx) => {
            const ar = (ctx.photo.width || 1) / (ctx.photo.height || 1);
            const objectFit =
              fit === "contain"
                ? "contain"
                : fit === "cover"
                ? "cover"
                : isExtremeGraphicAR(ar)
                ? "contain"
                : "cover";

            return (
              <img
                {...props}
                alt=""
                draggable={false}
                style={{
                  ...props.style,
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit,
                  objectPosition: "center",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            );
          },
        }}
      />

      <style>{`
        .gpost-loading{
          color: var(--muted, #6b7280);
          font-size: 14px;
        }
      `}</style>
    </>
  );
}
