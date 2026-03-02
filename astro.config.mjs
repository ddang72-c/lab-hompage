// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import remarkDirective from "remark-directive";
import remarkTypography from "./src/lib/remark-typography.js";

export default defineConfig({
  integrations: [react()],
  markdown: {
    remarkPlugins: [remarkDirective, remarkTypography],
  },
});