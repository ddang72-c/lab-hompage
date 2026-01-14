import React, { useEffect, useMemo, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import type { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

type FitMode = "auto" | "cover" | "contain";

export type GalleryAlbumProps = {
  images: string[];
  fit?: FitMode;
};

function isExtremeGraphicAR(ar: number) {
  // 로고/포스터류(cover에 취약)로 추정되는 극단 비율
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

export default function GalleryAlbum({ images, fit = "auto" }: GalleryAlbumProps) {
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

  // ✅ Google Sites 느낌: “한 줄 최대 3장”
  // ✅ 1장만 있어도 문제 없게 minPhotos=1
  const rowConstraints = useMemo(
    () => ({
      minPhotos: 1,
      maxPhotos: 3,
      singleRowMaxHeight: 520,
    }),
    []
  );

  // ✅ 사진 크기(행 높이)
  const targetRowHeight = useMemo(
    () => (containerWidth: number) => {
      if (containerWidth < 520) return 220;
      if (containerWidth < 900) return 280;
      return 340;
    },
    []
  );

  // ✅ 사진 사이 간격(더 넓게)
  const spacing = useMemo(
    () => (containerWidth: number) => {
      if (containerWidth < 520) return 14;
      if (containerWidth < 900) return 18;
      return 22;
    },
    []
  );

  if (!ready) {
    return <div className="gpost-loading">Loading images…</div>;
  }

  // ✅ 사진이 1장인 경우: rows 알고리즘 대신 “큰 단일 이미지”로 안정 렌더
  if (photos.length === 1) {
    const p = photos[0];
    const ar = (p.width || 1) / (p.height || 1);
    const contain = fit === "contain" || (fit === "auto" && isExtremeGraphicAR(ar));
    const objectFit =
      fit === "contain" ? "contain" : fit === "cover" ? "cover" : contain ? "contain" : "cover";

    return (
      <>
        <div
          style={{
            borderRadius: 0, // ✅ 직각
            overflow: "hidden",
            background: contain ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.04)",
          }}
        >
          <img
            src={p.src}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit,
              objectPosition: "center",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        <style>{`
          .gpost-loading{
            color: var(--muted, #6b7280);
            font-size: 14px;
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
                  borderRadius: 0, // ✅ 직각
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
