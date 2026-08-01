---
title: Project title
updated: 2026-08
summary: A short project description shown on the Projects overview page.
link_label: Project repository
link_url: https://github.com/username/project
---

## Introduction

Write the project text in sections introduced by a level-two heading. Every `##` heading creates a separate section on the project page. Ordinary consecutive lines form one paragraph.

Text can contain **bold text**, *italic text*, and `inline code`. These styles can also be used in headings, lists, and callouts where appropriate.

### Lower-level headings

Headings from `###` through `######` are supported inside a section.

## Links and repository files

Use [an external hyperlink](https://example.com) for a web page.

Use [a link to a PDF stored in the repository](/assets/document.pdf) for a file uploaded under `assets`. Replace `document.pdf` with the real filename; an absolute path beginning with `/assets/` keeps the link valid from every project page. Links open in a new tab.

The `link_label` and `link_url` fields in the front matter create an optional prominent link next to the update date. Remove both lines when the project has no header link.

## Lists

- First unordered item with **emphasis**.
- Second unordered item with an [inline link](https://example.com).
- Third unordered item with `inline code`.

1. First ordered step.
2. Second ordered step.
3. Third ordered step.

Lists are currently single-level; do not indent items to create nested lists.

## Callouts

> [!NOTE]
> General supporting information.

> [!TIP] Optional custom title
> A practical recommendation. The text may contain **bold**, *italic*, `code`, links, lists, headings, formulas, or images.

> [!WARNING]
> An important limitation or risk.

> [!RESULT]
> The main outcome of the project.

> [!IDEA]
> A possible extension or future direction.

Supported callout types are `NOTE`, `TIP`, `WARNING`, `RESULT`, and `IDEA`. Text after the type replaces the default callout title. Prefix every line belonging to a callout with `>`.

## Images

![Descriptive alternative text](/assets/og-image.jpg "Optional caption shown below the image")

Store project images under `assets` and use an absolute `/assets/filename.ext` path. Alternative text is required for accessibility; the quoted caption is optional.

## Code

Use backticks for `short inline code` and fenced blocks for longer examples. The word after the opening fence is saved as the block's language metadata.

```python
values = [1, 2, 3]
total = sum(values)
```

Use `text` when a block is output or pseudocode rather than Python source code.

```text
input -> transformation -> result
```

## Mathematics

Inline mathematics uses single dollar signs, for example $E[X] = \sum_i x_i p_i$.

A display equation uses dollar signs on separate lines:

$$
\mathrm{Var}(X) = E[X^2] - E[X]^2
$$

Keep the opening and closing `$$` on their own lines. Project detail pages load MathJax automatically.

## Authoring checklist

1. Copy this file to `content/projects/project-slug.md`.
2. Replace all front-matter values and example content.
3. Add the same slug and Markdown path to `scripts/projects-data.js`.
4. Copy a project HTML wrapper under `pages/projects/project-slug.html` and set its `data-project-slug` to the same slug.
5. Put linked documents and images in `assets`, then verify their exact filenames and capitalization.
6. Open both the Projects overview and the project detail page through a local web server; direct `file://` viewing cannot fetch the Markdown file.
