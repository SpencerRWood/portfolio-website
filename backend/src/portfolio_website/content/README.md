# Site content

`topics/`, `blog/`, and `projects/` contain individual public content pages.
`site/` contains stable page documents: homepage, topics, blog, projects, and about.
`_partials/` contains reusable Markdown/Jinja primitives and the authored header
and footer navigation. Edit their front matter to add, remove, relabel, or reorder
site links; React renders the resulting navigation responsively.

Every document is a `.md.j2` file with front matter. At render time, content
templates receive only these explicit values:

- `page`: the current page's validated metadata.
- `related_topics`: Topics named by the page's `topics` front-matter field.
- `related_blog`: Blog entries related to a Topic page.
- `related_projects`: Projects related to a Topic page.

Keep layout, responsive behavior, and application interaction in React. Add a
new content page by creating a file in its section; do not add a TypeScript
content array.
