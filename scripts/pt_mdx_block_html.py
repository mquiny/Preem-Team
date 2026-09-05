"""
Registered directly in mkdocs.yml's top-level `hooks:` list (not via
`markdown_extensions:`) so it loads by file path — no dependency on the
current working directory being on sys.path, which differs between
`python -m mkdocs build` (adds cwd) and a plain `mkdocs build` console-script
invocation (doesn't). CI runs the latter.

python-markdown's md_in_html support only leaves a raw HTML tag alone
(instead of wrapping it in a stray <p>, even when it's given markdown="1")
if the tag is in its hardcoded allowlist — markdown.util.BLOCK_LEVEL_ELEMENTS.
That list predates HTML5 and doesn't include <button> or <dialog>, both of
which the changelog cards/popups use (see docs/stylesheets/changelog.css +
scripts/apply-changelog.js). Without this fix, every card's <button> (and
its <dialog> popup) gets wrapped in a spurious <p>, which breaks the CSS
grid layout on the Archive/Changelog pages once more than one card is
present.

This just adds those two tag names to that allowlist for this site's
build, matching how the well-known block tags already behave.
"""

from markdown.extensions import Extension

EXTRA_BLOCK_TAGS = ("button", "dialog")


class PTBlockHtmlExtension(Extension):
    def extendMarkdown(self, md):
        for tag in EXTRA_BLOCK_TAGS:
            if tag not in md.block_level_elements:
                md.block_level_elements.append(tag)


def on_config(config, **kwargs):
    config["markdown_extensions"].append(PTBlockHtmlExtension())
    return config
