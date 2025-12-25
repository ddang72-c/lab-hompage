---
import BaseLayout from "../../layouts/BaseLayout.astro";

// 단일 문서: src/content/people/professor.md 하나만 사용
const files = await Astro.glob("/src/content/people/professor.md");
const page = files?.[0];

if (!page) {
  throw new Error("Professor markdown not found: src/content/people/professor.md");
}

const { Content, frontmatter } = page;

const title = frontmatter.title ?? "Professor";
const name = frontmatter.name ?? "";
const position = frontmatter.position ?? "";
const email = frontmatter.email ?? "";
const office = frontmatter.office ?? "";
const photo = frontmatter.photo ?? "";
---

<BaseLayout title={title}>
  <h1>{title}</h1>

{(photo || name || position || email || office) && (
<div class="card" style="margin: 24px 0; padding: 16px;">
{photo && (
<div style="margin-bottom: 12px;">
<img
src={photo}
alt={name ? `${name} photo` : "professor photo"}
style="max-width: 220px; height: auto; border-radius: 8px;"
loading="lazy"
/>
</div>
)}

      <div style="display: grid; gap: 6px;">
        {name && <div><strong>Name:</strong> {name}</div>}
        {position && <div><strong>Position:</strong> {position}</div>}
        {email && (
          <div>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </div>
        )}
        {office && <div><strong>Office:</strong> {office}</div>}
      </div>
    </div>

)}

  <Content />
</BaseLayout>
