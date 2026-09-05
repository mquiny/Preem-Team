# Preem Team — Cyberpunk 2077 Mod Collection Docs

MkDocs Material site for the Preem Team collection.

## Run locally

```bash
pip install -r requirements.txt
mkdocs serve
```

Then open http://127.0.0.1:8000/

## Build for deployment

```bash
mkdocs build
```

Static output is written to `site/`.

## Project structure

```text
mkdocs.yml
requirements.txt
docs/
  index.md
  stylesheets/
    extra.css
  installation/
    index.md
  guides/
    index.md
    example_guide.md
  changelog/
    index.md
    archive.md
    template.md
  faq/
    index.md
  showcase/
    index.md
  troubleshooting/
    index.md
    common_problems.md
    issue_viewer.md
  team/
    index.md
  systems/
    discord_auth.md
```

See [`docs/systems/discord_auth.md`](docs/systems/discord_auth.md) for the
planned Discord OAuth2 + role-based permission concept, and
[`docs/changelog/template.md`](docs/changelog/template.md) for the bot
POST format used by changelog automation.
