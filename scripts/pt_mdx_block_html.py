"""
A tiny local markdown extension used by mkdocs.yml.

python-markdown's md_in_html support decides whether a raw HTML tag is a
"block" (left alone) or "inline" (gets auto-wrapped in a stray <p>...</p>,
even when it's given markdown="1") based on a hardcoded allowlist —
markdown.util.BLOCK_LEVEL_ELEMENTS. That list predates HTML5 and doesn't
include <button> or <dialog>, both of which the changelog cards/popups use
(see docs/stylesheets/changelog.css + scripts/apply-changelog.js). Without
this fix, every card's <button> (and its <dialog> popup) gets wrapped in a
spurious <p>, which breaks the CSS grid layout on the Archive/Changelog
pages once more than one card is present (see git history around the
"per-collection collapsible sections" changelog rework for what that looked
like).

This extension just adds those two tag names to that allowlist for this
site's build, matching how the well-known block tags already behave.
"""

from markdown.extensions import Extension

EXTRA_BLOCK_TAGS = ("button", "dialog")


class PTBlockHtmlExtension(Extension):
    def extendMarkdown(self, md):
        for tag in EXTRA_BLOCK_TAGS:
            if tag not in md.block_level_elements:
                md.block_level_elements.append(tag)


def makeExtension(**kwargs):
    return PTBlockHtmlExtension(**kwargs)
