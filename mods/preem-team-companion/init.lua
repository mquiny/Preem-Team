--[[
Preem Team Companion
A Cyber Engine Tweaks (CET) overlay for the Preem Team Cyberpunk 2077
mod collection (https://preem.team).

v1 is intentionally static: it ships its own snapshot of the collection's
changelog/known-issues instead of calling out to the site. See README.md
for how to refresh that snapshot before each release, and for the plan to
wire this up to the site's live data later.
]]

local PreemTeamCompanion = {
    version = "0.1.0",
    showWindow = false,
}

-- Static snapshot shipped with the mod. Update this before packaging a new
-- release (see README.md "Updating the snapshot").
local SNAPSHOT = {
    collectionName = "Preem Team",
    siteUrl = "https://preem.team",
    changelog = {
        -- { version = "CPE-14", date = "2026-08-01", summary = "..." },
    },
    knownIssues = {
        -- { title = "...", url = "https://github.com/mquiny/Preem-Team/issues/1" },
    },
}

registerForEvent("onInit", function()
    print(("[PreemTeamCompanion] loaded v%s"):format(PreemTeamCompanion.version))
end)

registerHotkey(
    "PreemTeamCompanion_Toggle",
    "Toggle Preem Team Companion window",
    function()
        PreemTeamCompanion.showWindow = not PreemTeamCompanion.showWindow
    end
)

local function openUrl(url)
    -- Best-effort; silently no-ops if the host can't shell out.
    pcall(function()
        os.execute(('start "" "%s"'):format(url))
    end)
end

local function drawList(items, emptyText, renderItem)
    if #items == 0 then
        ImGui.TextDisabled(emptyText)
        return
    end
    for _, item in ipairs(items) do
        renderItem(item)
    end
end

registerForEvent("onDraw", function()
    if not PreemTeamCompanion.showWindow then
        return
    end

    ImGui.SetNextWindowSize(420, 420, ImGuiCond.FirstUseEver)
    local shouldShow
    shouldShow, PreemTeamCompanion.showWindow = ImGui.Begin(
        "Preem Team Companion",
        PreemTeamCompanion.showWindow,
        ImGuiWindowFlags.NoCollapse
    )

    if shouldShow then
        ImGui.Text(SNAPSHOT.collectionName .. " - Cyberpunk 2077 Mod Collection")
        ImGui.TextDisabled("Companion v" .. PreemTeamCompanion.version)
        ImGui.Separator()

        if ImGui.Button("Open preem.team") then
            openUrl(SNAPSHOT.siteUrl)
        end

        ImGui.Spacing()
        ImGui.Text("Changelog")
        ImGui.Separator()
        drawList(SNAPSHOT.changelog, "No cached changelog entries yet.", function(entry)
            ImGui.BulletText(("%s (%s) - %s"):format(entry.version, entry.date, entry.summary))
        end)

        ImGui.Spacing()
        ImGui.Text("Known Issues")
        ImGui.Separator()
        drawList(SNAPSHOT.knownIssues, "No open issues right now - nice.", function(issue)
            ImGui.BulletText(issue.title)
        end)
    end

    ImGui.End()
end)

return PreemTeamCompanion
