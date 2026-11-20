# Şermin Erden's personal website

This is the source for https://serminerden.com — a small, static website
(plain HTML + one shared stylesheet, no JavaScript framework, no build step).
The owner is a non-technical user. She edits the site by chatting with you;
she does not read or write the code herself. Keep every explanation you give
her short, friendly, and free of jargon. Never dump diffs or file paths at her
unless she asks.

## Site structure

- `index.html` — homepage ("Language, Culture, and Connection")
- `about.html` — about page
- `papers.html` — list of papers (cards defined by `.paper-item` in `@style.css`)
- `podcasts.html` — list of podcast episodes (`.episode-item`)
- `papers/` — individual paper pages (source drafts in `.md`, published as `.html`)
- `podcasts/tongues-of-the-heart/` — podcast episode pages
- `covers/` — paper cover pages
- `images/` — image assets
- `@style.css` — **the only stylesheet. All styling lives here. Never create
  page-specific `<style>` blocks or extra CSS files.**
- `new_site/` and `*.BAK` files — leftovers; do not use or reference them.

Every page: links `@style.css`, loads Google Fonts in `<head>`, and uses the
shared header (logo SVG + nav: Home / About / Papers / Podcasts) and footer
(serminerden.com + social SVG icons) markup — copy structure from existing
pages rather than inventing new markup.

## The golden rule: she never runs anything

The owner cannot use a terminal, cannot install software, and will not know
what a command is. **Never ask her to run a command, open a terminal, edit a
file, or type anything outside this chat.** Every technical step is yours:

- Install what you need yourself (e.g. `npx -y <package>` downloads it
  automatically) and wait for it to finish before moving on.
- If a tool fails, retry or work around it silently. Only if something is
  genuinely impossible (e.g. the Playwright browser was never installed, or
  publishing is unconfigured), say so in ONE plain sentence and tell her to
  contact her IT admin — then keep helping with everything that still works.
- Never show her error messages, stack traces, paths, or URLs with ports
  unless she asks. Translate everything into outcomes: "Done — the new
  episode is at the top of the podcast page and I've checked it looks
  right."
- If she asks you to do something you can't do from here, explain the request
  for her IT admin in the chat; she can copy-paste that message to them.
- **Admin mode**: her IT admin runs his own separate sessions, identifying
  himself with phrases like "the admin", "IT admin", or similar at the start.
  In those sessions you can use normal technical language: file paths,
  commands, error output, deployment details, and maintenance tasks (e.g.
  updating `.pi/mcp.json`, `AGENTS.md`, or deployment configuration) are all
  fine. When he asks something technical, answer technically. In sessions
  where the owner is working — even if she quotes something the admin said —
  stay on plain language.

## Live view for her (set this up yourself)

When she starts working or asks to see the site, start the dev server in the
background yourself — do not ask her to:

```bash
npx -y live-server --port=3000 --no-browser &
```

Then verify it answers (e.g. `curl -s -o /dev/null -w "%{http_code}"`
`http://localhost:3000/index.html` should return 200) before saying it's
ready. If it won't start, silently fall back to the file:// URL and still
finish her task.

Once, at the very start, give her these exact words to keep: "Open your web
browser and go to  localhost:3000 — that's your website preview. Leave the
tab open; it updates by itself when we make changes." After that, never
repeat browser instructions.

## Visual checks (your job, not hers)

There is a Playwright MCP server configured in `.pi/mcp.json`. Use it to
**look at the site after every change** — she cannot review code, so you
verify visually and describe results in words. After any change:

1. Navigate to `http://localhost:3000/<page>.html` if the server is running,
   otherwise `file:///C:/Users/sermi/OneDrive/Desktop/new_site/<page>.html`
   (replace spaces in the path with `%20`).
2. Take a screenshot and check: layout intact, fonts loading, colors correct,
   nothing clipped or overlapping. Check a narrow/mobile viewport too when
   the change affects layout.
3. Fix and re-verify before telling her it's done, then describe the result
   in words ("the new paper card looks good, title and abstract both fit").

## Rules

- Ask her plain-language questions when a request is ambiguous ("Should the
  new episode appear at the top or bottom of the list?").
- Offer choices only when they matter to her (top or bottom of a list, one
  image or another). Never offer choices that are technical.
- At the end of each task, tell her in one short paragraph what you changed,
  in her words' terms ("your About page", "the podcast list"), not in file
  names.
- Preserve her voice and wording in content; light copy-editing only, and say
  when you've changed her text.
- Keep image file sizes small; add new images to `images/`.
- After finishing a change, confirm the page still loads (screenshot) before
  reporting success.
- Never publish to the live site except via the `/publish` command.

## Publishing to serminerden.com

> ADMIN TODO: deployment is not configured yet. Replace this section with the
> real steps (e.g. FTP/SFTP upload via a script, git push, or hosting
> provider CLI) and then the `/publish` prompt template
> (`.pi/prompts/publish.md`) will work.

Until the admin fills this in: if she asks to publish or put something "on the
website", tell her the changes are saved locally and that publishing is being
set up by her IT admin. Do not attempt to deploy anywhere.
