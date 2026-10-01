# Site content

`areas/`, `blog/`, and `projects/` contain individual public content pages.
`site/` contains stable page documents: homepage, areas, blog, projects, and about.
`_partials/` contains reusable Markdown/Jinja primitives and the authored header
and footer navigation. Edit their front matter to add, remove, relabel, or reorder
site links; React renders the resulting navigation responsively.

Every document is a `.md.j2` file with front matter. At render time, content
templates receive only these explicit values:

- `page`: the current page's validated metadata.
- `related_areas`: Areas named by the page's `areas` front-matter field.
- `related_blog`: Blog entries related to an Area page.
- `related_projects`: Projects related to an Area page.

Area documents require `group: Analytics` or `group: Engineering` and an integer
`order`. Analytics renders before Engineering; pages within each group sort by
order, then title. Analytics retains the sequence Data Generation, Data Collection,
Data Modeling, Analytics, Machine Learning, Communication. Engineering initially
contains Systems & Infrastructure. The homepage and `/areas` index use these groups.

Area routes use `/areas` and `/areas/{slug}`. Writing remains under `/blog`.
Public navigation and headings call these entries Topics; backend types, metadata
keys, relationship fields, and routes use Areas.
The repository terminology check runs with the backend tests; historical changelog
entries are exempt because they describe earlier releases.

Keep layout, responsive behavior, and application interaction in React. Add a
new content page by creating a file in its section; do not add a TypeScript
content array.
