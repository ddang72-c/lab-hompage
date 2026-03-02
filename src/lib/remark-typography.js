import { visit } from "unist-util-visit";

/**
 * 지원 문법:
 *  - :size[텍스트]{value=18}
 *  - :color[텍스트]{value=#ff0000}
 *  - :t[텍스트]{size=18 color=#ff0000}   // size+color 동시
 *
 * 출력:
 *  - <span style="font-size:18px;">...</span>
 *  - <span style="color:#ff0000;">...</span>
 *  - <span style="font-size:18px; color:#ff0000;">...</span>
 */
export default function remarkTypography() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "textDirective") return;
      if (node.name !== "size" && node.name !== "color" && node.name !== "t") return;

      const attrs = node.attributes || {};
      let style = "";

      // :size[...]{value=18}
      if (node.name === "size") {
        const n = Number(String(attrs.value || "").trim());
        if (!Number.isFinite(n)) return;

        const clamped = Math.max(9, Math.min(60, Math.round(n)));
        style = `font-size:${clamped}px;`;
      }

      // :color[...]{value=#ff0000}
      if (node.name === "color") {
        const color = String(attrs.value || "").trim();
        const ok = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color);
        if (!ok) return;

        style = `color:${color};`;
      }

      // :t[...]{size=18 color=#ff0000}
      if (node.name === "t") {
        const sizeRaw = attrs.size;
        const colorRaw = String(attrs.color || "").trim();

        if (sizeRaw !== undefined && sizeRaw !== null && String(sizeRaw).trim() !== "") {
          const n = Number(String(sizeRaw).trim());
          if (Number.isFinite(n)) {
            const clamped = Math.max(9, Math.min(60, Math.round(n)));
            style += `font-size:${clamped}px;`;
          }
        }

        if (colorRaw) {
          const ok = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorRaw);
          if (ok) style += `color:${colorRaw};`;
        }

        // 둘 다 없으면 변환하지 않음
        if (!style) return;
      }

      node.data = node.data || {};
      node.data.hName = "span";
      node.data.hProperties = node.data.hProperties || {};

      const prev = node.data.hProperties.style ? String(node.data.hProperties.style) : "";
      node.data.hProperties.style = (prev ? prev + " " : "") + style;
    });
  };
}