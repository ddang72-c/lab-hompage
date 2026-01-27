(function () {
  const CMS = window.CMS;
  if (!CMS) return;

  const escapeHtml = (s = "") =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalizeWidth = (w = "") => String(w).trim();

  CMS.registerEditorComponent({
    id: "rc-figure",
    label: "Figure (Image + Caption)",
    fields: [
      { name: "src", label: "Image", widget: "image" },
      {
        name: "align",
        label: "Align",
        widget: "select",
        default: "center",
        options: [
          { label: "Center", value: "center" },
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
          { label: "Full width", value: "full" },
        ],
      },
      {
        name: "width",
        label: "Max width (optional)",
        widget: "string",
        required: false,
        hint: '예: 520px, 70%, 40rem (비우면 자동)',
      },
      { name: "caption", label: "Caption (optional)", widget: "string", required: false },
    ],

    pattern:
      /^<figure class="rc-figure rc-figure--(center|left|right|full)"(?: style="--rc-w:\s*([^;"]+)\s*;")?>\s*<img src="([^"]+)" alt=""\s*\/>\s*(?:<figcaption>([\s\S]*?)<\/figcaption>\s*)?<\/figure>\s*$/m,

    fromBlock(match) {
      const align = match[1] || "center";
      const width = match[2] ? match[2].trim() : "";
      const src = match[3] || "";
      const caption = match[4] ? match[4].replace(/\s+/g, " ").trim() : "";
      return { src, align, width, caption };
    },

    toBlock(data) {
      const src = (data.src || "").trim();
      const align = (data.align || "center").trim();
      const width = normalizeWidth(data.width || "");
      const caption = (data.caption || "").trim();

      const style = width ? ` style="--rc-w: ${escapeHtml(width)};"` : "";
      const figcaption = caption
        ? `\n  <figcaption>${escapeHtml(caption)}</figcaption>`
        : "";

      return `<figure class="rc-figure rc-figure--${escapeHtml(align)}"${style}>
  <img src="${escapeHtml(src)}" alt="" />${figcaption}
</figure>`;
    },

    toPreview(data) {
      const src = (data.src || "").trim();
      const caption = (data.caption || "").trim();
      const width = normalizeWidth(data.width || "");
      const align = (data.align || "center").trim();

      const style = width ? ` style="max-width:${escapeHtml(width)}"` : "";
      const cap = caption ? `<div style="opacity:.75;margin-top:8px;font-size:12px">${escapeHtml(caption)}</div>` : "";

      return `<div style="margin:16px 0; text-align:${align === "left" ? "left" : align === "right" ? "right" : "center"}">
  <img src="${escapeHtml(src)}"${style} />
  ${cap}
</div>`;
    },
  });

  CMS.registerEditorComponent({
    id: "rc-float",
    label: "Float Image (Wrap text)",
    fields: [
      { name: "src", label: "Image", widget: "image" },
      {
        name: "side",
        label: "Side",
        widget: "select",
        default: "right",
        options: [
          { label: "Right (text wraps left)", value: "right" },
          { label: "Left (text wraps right)", value: "left" },
        ],
      },
      {
        name: "width",
        label: "Width",
        widget: "string",
        default: "320px",
        hint: "예: 280px, 360px, 40%",
      },
      { name: "caption", label: "Caption (optional)", widget: "string", required: false },
    ],

    pattern:
      /^<figure class="rc-float rc-float--(left|right)" style="--rc-w:\s*([^;"]+)\s*;">\s*<img src="([^"]+)" alt=""\s*\/>\s*(?:<figcaption>([\s\S]*?)<\/figcaption>\s*)?<\/figure>\s*$/m,

    fromBlock(match) {
      const side = match[1] || "right";
      const width = match[2] ? match[2].trim() : "320px";
      const src = match[3] || "";
      const caption = match[4] ? match[4].replace(/\s+/g, " ").trim() : "";
      return { src, side, width, caption };
    },

    toBlock(data) {
      const src = (data.src || "").trim();
      const side = (data.side || "right").trim();
      const width = normalizeWidth(data.width || "320px");
      const caption = (data.caption || "").trim();

      const figcaption = caption
        ? `\n  <figcaption>${escapeHtml(caption)}</figcaption>`
        : "";

      return `<figure class="rc-float rc-float--${escapeHtml(side)}" style="--rc-w: ${escapeHtml(
        width
      )};">
  <img src="${escapeHtml(src)}" alt="" />${figcaption}
</figure>`;
    },

    toPreview(data) {
      const src = (data.src || "").trim();
      const caption = (data.caption || "").trim();
      const width = normalizeWidth(data.width || "320px");
      const side = (data.side || "right").trim();

      const floatStyle =
        side === "left"
          ? `float:left;margin:0 16px 12px 0;width:${escapeHtml(width)};`
          : `float:right;margin:0 0 12px 16px;width:${escapeHtml(width)};`;

      const cap = caption
        ? `<div style="opacity:.75;margin-top:8px;font-size:12px">${escapeHtml(caption)}</div>`
        : "";

      return `<div style="margin:12px 0; overflow:auto;">
  <div style="${floatStyle}">
    <img src="${escapeHtml(src)}" style="width:100%;height:auto;display:block;" />
    ${cap}
  </div>
  <div style="font-size:13px;line-height:1.6;opacity:.75">
    (preview) 이 블록 다음의 문단 텍스트가 이미지를 감싸며 흐릅니다.
  </div>
</div>`;
    },
  });

  CMS.registerEditorComponent({
    id: "rc-two-up",
    label: "Two Images (Side-by-side)",
    fields: [
      { name: "src1", label: "Image 1", widget: "image" },
      { name: "caption1", label: "Caption 1 (optional)", widget: "string", required: false },
      { name: "src2", label: "Image 2", widget: "image" },
      { name: "caption2", label: "Caption 2 (optional)", widget: "string", required: false },
    ],

    pattern:
      /^<div class="rc-two-up">\s*<figure class="rc-figure">\s*<img src="([^"]+)" alt=""\s*\/>\s*(?:<figcaption>([\s\S]*?)<\/figcaption>\s*)?<\/figure>\s*<figure class="rc-figure">\s*<img src="([^"]+)" alt=""\s*\/>\s*(?:<figcaption>([\s\S]*?)<\/figcaption>\s*)?<\/figure>\s*<\/div>\s*$/m,

    fromBlock(match) {
      const src1 = match[1] || "";
      const caption1 = match[2] ? match[2].replace(/\s+/g, " ").trim() : "";
      const src2 = match[3] || "";
      const caption2 = match[4] ? match[4].replace(/\s+/g, " ").trim() : "";
      return { src1, caption1, src2, caption2 };
    },

    toBlock(data) {
      const src1 = (data.src1 || "").trim();
      const src2 = (data.src2 || "").trim();
      const caption1 = (data.caption1 || "").trim();
      const caption2 = (data.caption2 || "").trim();

      const cap1 = caption1 ? `\n    <figcaption>${escapeHtml(caption1)}</figcaption>` : "";
      const cap2 = caption2 ? `\n    <figcaption>${escapeHtml(caption2)}</figcaption>` : "";

      return `<div class="rc-two-up">
  <figure class="rc-figure">
    <img src="${escapeHtml(src1)}" alt="" />${cap1}
  </figure>
  <figure class="rc-figure">
    <img src="${escapeHtml(src2)}" alt="" />${cap2}
  </figure>
</div>`;
    },

    toPreview(data) {
      const src1 = (data.src1 || "").trim();
      const src2 = (data.src2 || "").trim();
      const caption1 = (data.caption1 || "").trim();
      const caption2 = (data.caption2 || "").trim();

      const fig = (src, cap) => `
        <div style="flex:1; min-width:0;">
          <img src="${escapeHtml(src)}" style="width:100%; height:auto; display:block;" />
          ${cap ? `<div style="opacity:.75;margin-top:8px;font-size:12px">${escapeHtml(cap)}</div>` : ""}
        </div>`;

      return `<div style="display:flex; gap:12px; margin:12px 0;">
        ${fig(src1, caption1)}
        ${fig(src2, caption2)}
      </div>`;
    },
  });

  CMS.registerEditorComponent({
    id: "rc-clear-float",
    label: "Clear Float (Stop wrapping)",
    fields: [],
    pattern: /^<div class="rc-clear"><\/div>\s*$/m,
    fromBlock() {
      return {};
    },
    toBlock() {
      return `<div class="rc-clear"></div>`;
    },
    toPreview() {
      return `<div style="padding:8px 10px;border:1px dashed #bbb;opacity:.75;margin:8px 0;">Clear Float</div>`;
    },
  });
})();
