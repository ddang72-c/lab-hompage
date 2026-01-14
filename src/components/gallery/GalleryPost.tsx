import React, { useEffect, useMemo, useState } from "react";
import { RowsPhotoAlbum } from "react-photo-album";
import type { Photo } from "react-photo-album";
import "react-photo-album/rows.css";

type FitMode = "auto" | "cover" | "contain";

export type GalleryPostProps = {
  title: string;
  date?: string;
  images: string[];
  featuredIndex?: number | null; // (지금은 미사용, 최소 수정)
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

export default function GalleryPost({
  title,
  date,
  images,
  fit = "auto",
}: GalleryPostProps) {
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

  // ✅ 5장이 “한 줄로 쭉” 가는 식상함 방지: 한 줄 최대 사진 수 제한
  // - maxPhotos를 4로 두면, 5장은 자동으로 2줄 이상으로 나뉘는 경향이 강해짐
  // - singleRowMaxHeight로 “사진 2~3장인데 한 줄만 나와서 과하게 커짐” 방지
  const rowConstraints = useMemo(
    () => ({
      minPhotos: 2,
      maxPhotos: 4,
      singleRowMaxHeight: 260,
    }),
    []
  );

  const targetRowHeight = useMemo(
    () => (containerWidth: number) => {
      if (containerWidth < 520) return 170;
      if (containerWidth < 900) return 220;
      return 260;
    },
    []
  );

  const spacing = useMemo(
    () => (containerWidth: number) => {
      if (containerWidth < 520) return 8;
      if (containerWidth < 900) return 10;
      return 14;
    },
    []
  );

  return (
    <section>
      <header style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.25 }}>{title}</h2>
        {date ? (
          <div style={{ marginTop: 6, color: "var(--muted, #6b7280)", fontSize: 14 }}>{date}</div>
        ) : null}
      </header>

      {!ready ? (
        <div style={{ color: "var(--muted, #6b7280)", fontSize: 14 }}>Loading images…</div>
      ) : (
        <RowsPhotoAlbum
          photos={photos}
          spacing={spacing}
          targetRowHeight={targetRowHeight}
          rowConstraints={rowConstraints}
          // ✅ 클릭해도 아무 변화 없게: onClick/href를 안 주면 wrapper가 div로 렌더됨
          render={{
            wrapper: (props, ctx) => {
              const ar = (ctx.photo.width || 1) / (ctx.photo.height || 1);
              const contain = fit === "contain" || (fit === "auto" && isExtremeGraphicAR(ar));
              return (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: contain ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.04)",
                  }}
                />
              );
            },
            image: (props, ctx) => {
              const ar = (ctx.photo.width || 1) / (ctx.photo.height || 1);
              const objectFit =
                fit === "contain" ? "contain" : fit === "cover" ? "cover" : isExtremeGraphicAR(ar) ? "contain" : "cover";

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
                    pointerEvents: "none", // ✅ 완전 무반응
                  }}
                />
              );
            },
          }}
        />
      )}
    </section>
  );
}
