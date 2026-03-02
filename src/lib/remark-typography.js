import { visit } from "unist-util-visit";

/**
 * 지원 문법:
 *  - :size[텍스트]{value=18}
 *  - :color[텍스트]{value=#ff0000}
 *
 * 결과:
 *  - <span style="font-size:18px">텍스트</span>
 *  - <span style="color:#ff0000">텍스트</span>
 */
export default function remarkTypography() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "textDirective") return;
      if (node.name !== "size" && node.name !== "color") return;

      const attrs = node.attributes || {};
      const rawValue = String(attrs.value || "").trim();

      let style = "";

      if (node.name === "size") {
        // 9~60 사이 숫자만 허용
        const n = Number(rawValue);
        if (!Number.isFinite(n)) return;

        const clamped = Math.max(9, Math.min(60, Math.round(n)));
        style = `font-size:${clamped}px;`;
      }

      if (node.name === "color") {
        // #RGB / #RRGGBB만 허용
        const ok = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawValue);
        if (!ok) return;

        style = `color:${rawValue};`;
      }

      node.data = node.data || {};
      node.data.hName = "span";
      node.data.hProperties = node.data.hProperties || {};

      const prev = node.data.hProperties.style ? String(node.data.hProperties.style) : "";
      node.data.hProperties.style = (prev ? prev + " " : "") + style;
    });
  };
}