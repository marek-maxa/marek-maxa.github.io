(() => {
    const projectCache = new Map();

    const getProjects = () => (Array.isArray(window.PROJECTS) ? window.PROJECTS : []);

    const escapeHtml = (value) =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;");

    const resolveContentUrl = (path) => new URL(path, window.location.origin).toString();

    const resolveAssetUrl = (path, baseUrl) => {
        if (!path) {
            return "";
        }

        try {
            return new URL(path, baseUrl).toString();
        } catch {
            return path;
        }
    };

    const parseFrontMatter = (source) => {
        const normalized = String(source ?? "").replace(/\r\n/g, "\n");
        const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

        if (!match) {
            return { meta: {}, body: normalized };
        }

        const [, frontMatter, body] = match;
        const meta = {};

        frontMatter.split("\n").forEach((line) => {
            const separatorIndex = line.indexOf(":");
            if (separatorIndex === -1) {
                return;
            }

            const key = line.slice(0, separatorIndex).trim();
            const value = line.slice(separatorIndex + 1).trim();
            if (key) {
                meta[key] = value;
            }
        });

        return { meta, body };
    };

    const splitMarkdownSections = (markdown) => {
        const normalized = String(markdown ?? "").trim();
        if (!normalized) {
            return [];
        }

        const lines = normalized.split("\n");
        const sections = [];
        let currentSection = { title: "", content: [] };

        lines.forEach((line) => {
            const headingMatch = line.match(/^##\s+(.+)$/);
            if (headingMatch) {
                if (currentSection.title || currentSection.content.length > 0) {
                    sections.push({
                        title: currentSection.title,
                        content: currentSection.content.join("\n").trim()
                    });
                }

                currentSection = {
                    title: headingMatch[1].trim(),
                    content: []
                };
                return;
            }

            currentSection.content.push(line);
        });

        if (currentSection.title || currentSection.content.length > 0) {
            sections.push({
                title: currentSection.title,
                content: currentSection.content.join("\n").trim()
            });
        }

        return sections.filter((section) => section.title || section.content);
    };

    const renderInlineMarkdown = (text, baseUrl) => {
        if (!text) {
            return "";
        }

        let html = escapeHtml(text);

        html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
        html = html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, label, url) => {
            const resolvedUrl = escapeHtml(resolveAssetUrl(url, baseUrl));
            return `<a href="${resolvedUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
        });
        html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        html = html.replace(/\$([^$\n]+)\$/g, (_, equation) => `<span class="math-inline">\\(${escapeHtml(equation)}\\)</span>`);

        return html;
    };

    const renderCallout = (type, title, body, baseUrl) => {
        const normalizedType = type.toLowerCase();
        const labels = {
            note: "Note",
            tip: "Tip",
            warning: "Warning",
            result: "Result",
            idea: "Idea"
        };
        const calloutTitle = title || labels[normalizedType] || "Note";

        return `
            <aside class="callout callout-${escapeHtml(normalizedType)}">
                <p class="callout-title">${escapeHtml(calloutTitle)}</p>
                ${renderMarkdownBody(body, baseUrl)}
            </aside>
        `;
    };

    const renderFigure = (line, baseUrl) => {
        const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/);
        if (!imageMatch) {
            return "";
        }

        const [, alt, src, caption] = imageMatch;
        return `
            <figure class="article-figure">
                <img src="${escapeHtml(resolveAssetUrl(src, baseUrl))}" alt="${escapeHtml(alt)}">
                ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}
            </figure>
        `;
    };

    const renderCodeBlock = (code, info) => `
        <pre class="code-block"${info ? ` data-language="${escapeHtml(info)}"` : ""}><code>${escapeHtml(code)}</code></pre>
    `;

    const renderMarkdownBody = (markdown, baseUrl) => {
        const lines = String(markdown ?? "").replace(/\r\n/g, "\n").split("\n");
        const htmlParts = [];
        let index = 0;

        const isSpecialLine = (line) =>
            /^>\s*\[!([A-Z]+)\]/i.test(line) ||
            /^```/.test(line) ||
            /^\$\$$/.test(line.trim()) ||
            /^!\[[^\]]*\]\([^)]+\)$/.test(line.trim()) ||
            /^[-*+]\s+/.test(line) ||
            /^\d+\.\s+/.test(line) ||
            /^#{3,6}\s+/.test(line);

        while (index < lines.length) {
            const line = lines[index];
            const trimmed = line.trim();

            if (!trimmed) {
                index += 1;
                continue;
            }

            const calloutMatch = line.match(/^>\s*\[!([A-Z]+)\](?:\s+(.*))?$/i);
            if (calloutMatch) {
                const [, type, title = ""] = calloutMatch;
                const innerLines = [];
                index += 1;

                while (index < lines.length) {
                    const currentLine = lines[index];
                    if (currentLine.startsWith(">")) {
                        innerLines.push(currentLine.replace(/^>\s?/, ""));
                        index += 1;
                        continue;
                    }

                    if (!currentLine.trim()) {
                        innerLines.push("");
                        index += 1;
                        continue;
                    }

                    break;
                }

                htmlParts.push(renderCallout(type, title.trim(), innerLines.join("\n").trim(), baseUrl));
                continue;
            }

            const headingMatch = line.match(/^(#{3,6})\s+(.+)$/);
            if (headingMatch) {
                const [, hashes, text] = headingMatch;
                const level = Math.min(hashes.length, 6);
                htmlParts.push(`<h${level}>${renderInlineMarkdown(text.trim(), baseUrl)}</h${level}>`);
                index += 1;
                continue;
            }

            if (/^```/.test(line)) {
                const info = line.replace(/^```/, "").trim();
                const codeLines = [];
                index += 1;

                while (index < lines.length && !/^```/.test(lines[index])) {
                    codeLines.push(lines[index]);
                    index += 1;
                }

                if (index < lines.length) {
                    index += 1;
                }

                htmlParts.push(renderCodeBlock(codeLines.join("\n"), info));
                continue;
            }

            if (/^\$\$$/.test(trimmed)) {
                const equationLines = [];
                index += 1;

                while (index < lines.length && !/^\$\$$/.test(lines[index].trim())) {
                    equationLines.push(lines[index]);
                    index += 1;
                }

                if (index < lines.length) {
                    index += 1;
                }

                htmlParts.push(`<div class="equation-block">\\[${escapeHtml(equationLines.join("\n").trim())}\\]</div>`);
                continue;
            }

            if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)) {
                htmlParts.push(renderFigure(trimmed, baseUrl));
                index += 1;
                continue;
            }

            if (/^[-*+]\s+/.test(line)) {
                const items = [];
                while (index < lines.length && /^[-*+]\s+/.test(lines[index])) {
                    items.push(lines[index].replace(/^[-*+]\s+/, ""));
                    index += 1;
                }

                htmlParts.push(
                    `<ul class="article-list">${items
                        .map((item) => `<li>${renderInlineMarkdown(item.trim(), baseUrl)}</li>`)
                        .join("")}</ul>`
                );
                continue;
            }

            if (/^\d+\.\s+/.test(line)) {
                const items = [];
                while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
                    items.push(lines[index].replace(/^\d+\.\s+/, ""));
                    index += 1;
                }

                htmlParts.push(
                    `<ol class="article-list">${items
                        .map((item) => `<li>${renderInlineMarkdown(item.trim(), baseUrl)}</li>`)
                        .join("")}</ol>`
                );
                continue;
            }

            const paragraphLines = [line.trim()];
            index += 1;

            while (index < lines.length) {
                const nextLine = lines[index];
                if (!nextLine.trim() || isSpecialLine(nextLine)) {
                    break;
                }

                paragraphLines.push(nextLine.trim());
                index += 1;
            }

            htmlParts.push(`<p>${renderInlineMarkdown(paragraphLines.join(" "), baseUrl)}</p>`);
        }

        return htmlParts.join("");
    };

    const loadProjectDocument = async (projectEntry) => {
        const cacheKey = projectEntry.slug;
        if (projectCache.has(cacheKey)) {
            return projectCache.get(cacheKey);
        }

        const fileUrl = resolveContentUrl(projectEntry.file);
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to load ${projectEntry.file}: ${response.status}`);
        }

        const source = await response.text();
        const { meta, body } = parseFrontMatter(source);
        const document = {
            ...projectEntry,
            ...meta,
            body,
            fileUrl
        };

        projectCache.set(cacheKey, document);
        return document;
    };

    const renderProjectList = async (container) => {
        const projectDocuments = await Promise.all(getProjects().map((project) => loadProjectDocument(project)));

        container.innerHTML = projectDocuments
            .map(
                (project) => `
                    <article class="project-index-item" data-reveal>
                        <h2>${escapeHtml(project.title || project.slug)}</h2>
                        <p class="project-index-summary">${escapeHtml(project.summary || "")}</p>
                        <a class="project-index-link" href="/pages/projects/${escapeHtml(project.slug)}.html">Read project note</a>
                    </article>
                `
            )
            .join("");
    };

    const renderProjectDetail = async (container, slug) => {
        const projectEntry = getProjects().find((item) => item.slug === slug);

        if (!projectEntry) {
            container.innerHTML = `
                <article class="stack" data-reveal>
                    <h1>Project not found</h1>
                    <p class="subtle">The requested project does not exist in <code>scripts/projects-data.js</code>.</p>
                    <a class="btn btn-primary" href="/pages/projects.html">Back to projects</a>
                </article>
            `;
            return;
        }

        const project = await loadProjectDocument(projectEntry);
        const sections = splitMarkdownSections(project.body);

        container.innerHTML = `
            <article class="article-body" data-reveal>
                <header class="article-header">
                    <a class="inline-link" href="/pages/projects.html">Back to projects</a>
                    <h1>${escapeHtml(project.title || project.slug)}</h1>
                    ${renderHeaderMeta(project)}
                </header>
                ${sections
                    .map(
                        (section) => `
                            <section class="article-section">
                                ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
                                ${renderMarkdownBody(section.content, project.fileUrl)}
                            </section>
                        `
                    )
                    .join("")}
            </article>
        `;

        if (window.MathJax?.typesetPromise) {
            window.MathJax.typesetPromise([container]).catch((error) => console.error(error));
        }
    };

    const renderHeaderMeta = (project) => {
        const items = [];

        if (project.updated) {
            items.push(`<li>${escapeHtml(project.updated)}</li>`);
        }

        if (project.link_url && project.link_label) {
            items.push(
                `<li><a href="${escapeHtml(project.link_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(project.link_label)}</a></li>`
            );
        }

        if (items.length === 0) {
            return "";
        }

        return `<ul class="article-header-meta">${items.join("")}</ul>`;
    };

    window.initProjects = async () => {
        const listNode = document.querySelector("[data-project-list]");
        if (listNode) {
            await renderProjectList(listNode);
        }

        const detailNode = document.querySelector("[data-project-slug]");
        if (detailNode) {
            await renderProjectDetail(detailNode, detailNode.dataset.projectSlug);
        }
    };
})();
