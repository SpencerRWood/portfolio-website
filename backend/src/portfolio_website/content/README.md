# Site content

`areas/`, `blog/`, and `projects/` contain individual public content pages.
`site/` contains stable page documents: homepage, areas, blog, projects, and about.
`_partials/` contains reusable Markdown/Jinja primitives and the authored header
and footer navigation. Edit their front matter to add, remove, relabel, or reorder
site links; React renders the resulting navigation responsively.

Every document is a `.md.j2` file with front matter. At render time, content
templates receive only these explicit values:

- `page`: the current page's validated metadata.
- `related_content`: derived references with title, slug, section, and summary.
  Area pages link to Writing and Projects that declare their slug in `areas`;
  Writing and Project pages link back to their declared Areas. References follow
  the same deterministic ordering as section indexes. The API exposes these same
  references for the shared React related-content component; do not author them
  in front matter. Unknown or duplicate Area references fail content validation.
  Area pages cannot declare Area associations themselves.

Area documents require `group: Analytics` or `group: Engineering` and an integer
`order`. Analytics renders before Engineering; pages within each group sort by
order, then title. Analytics retains the sequence Data Generation, Data Collection,
Data Modeling, Analytics, Machine Learning, Communication. Engineering initially
contains Systems & Infrastructure. The homepage and `/topics` index use these groups.

Public Area routes use `/topics` and `/topics/{slug}`. Content API routes use
`/content/topics`, `/content/topics/{slug}`, `/content/topics/navigation`, and
`/content/site/topics`. Writing remains under `/blog`.
Public navigation and headings call these entries Topics; backend types, metadata
keys, and relationship fields use Areas. API payload sections and authored site
slugs retain `areas`; route mapping does not rename editorial metadata.
The repository terminology check runs with the backend tests; historical changelog
entries are exempt because they describe earlier releases.

Keep layout, responsive behavior, and application interaction in React. Add a
new content page by creating a file in its section; do not add a TypeScript
content array.
