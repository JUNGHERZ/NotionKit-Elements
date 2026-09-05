// NotionKit Elements — Web Components for the NotionKit CSS foundation
// https://github.com/JUNGHERZ/NotionKit-Elements
//
// Importing a component file registers its tag as a side effect; this barrel
// therefore both registers every element and exposes its class.

export { NkElement, NkFormElement } from './base.js';

// Wave 1 – forms
export { NkBtn } from './components/forms/nk-btn.js';
export { NkInput } from './components/forms/nk-input.js';
export { NkTextarea } from './components/forms/nk-textarea.js';
export { NkSelect } from './components/forms/nk-select.js';
export { NkSwitch } from './components/forms/nk-switch.js';
export { NkCheck } from './components/forms/nk-check.js';
export { NkRadio } from './components/forms/nk-radio.js';
export { NkSlider } from './components/forms/nk-slider.js';
export { NkField } from './components/forms/nk-field.js';

// Wave 1 – content
export { NkTag } from './components/content/nk-tag.js';
export { NkProgress } from './components/content/nk-progress.js';
export { NkCallout } from './components/content/nk-callout.js';
export { NkDivider } from './components/content/nk-divider.js';
export { NkHeading } from './components/content/nk-heading.js';
export { NkToggle } from './components/content/nk-toggle.js';
export { NkTodo } from './components/content/nk-todo.js';
export { NkKbd } from './components/content/nk-kbd.js';
export { NkCode } from './components/content/nk-code.js';
export { NkQuote } from './components/content/nk-quote.js';

// Wave 2 – app shell & navigation
export { NkApp } from './components/shell/nk-app.js';
export { NkSidebar } from './components/shell/nk-sidebar.js';
export { NkWorkspaceSwitcher } from './components/shell/nk-workspace-switcher.js';
export { NkSectionLabel } from './components/shell/nk-section-label.js';
export { NkTree } from './components/shell/nk-tree.js';
export { NkTreeItem } from './components/shell/nk-tree-item.js';
export { NkTopbar } from './components/shell/nk-topbar.js';
export { NkBreadcrumb } from './components/shell/nk-breadcrumb.js';
export { NkThemeToggle } from './components/shell/nk-theme-toggle.js';

// Wave 3 – page shell & blocks
export { NkPage } from './components/page/nk-page.js';
export { NkPageCover } from './components/page/nk-page-cover.js';
export { NkPageTitle } from './components/page/nk-page-title.js';
export { NkPageActions } from './components/page/nk-page-actions.js';
export { NkBlockHost } from './components/page/nk-block-host.js';
export { NkBanner } from './components/page/nk-banner.js';
export { NkEmpty } from './components/page/nk-empty.js';
export { NkSkeleton } from './components/page/nk-skeleton.js';
export { NkSynced } from './components/page/nk-synced.js';
export { NkTabs } from './components/page/nk-tabs.js';
export { NkTab } from './components/page/nk-tab.js';
export { NkSegmented } from './components/page/nk-segmented.js';
export { NkStats } from './components/page/nk-stats.js';
export { NkStat } from './components/page/nk-stat.js';
export { NkAvatarGroup } from './components/page/nk-avatar-group.js';
export { NkMention } from './components/page/nk-mention.js';
export { NkTemplateBtn } from './components/page/nk-template-btn.js';
export { NkModelCard } from './components/page/nk-model-card.js';
export { NkProfileRow } from './components/page/nk-profile-row.js';
export { NkDangerZone } from './components/page/nk-danger-zone.js';
export { NkMemberList } from './components/page/nk-member-list.js';
export { NkMemberRow } from './components/page/nk-member-row.js';

// Wave 4 – overlays
export { NkModal } from './components/overlays/nk-modal.js';
export { NkSettingsPane } from './components/overlays/nk-settings-pane.js';
export { NkSettingsUser } from './components/overlays/nk-settings-user.js';
export { NkCmdk } from './components/overlays/nk-cmdk.js';
export { NkMenu } from './components/overlays/nk-menu.js';
export { NkMenuItem } from './components/overlays/nk-menu-item.js';
export { NkPop } from './components/overlays/nk-pop.js';
export { NkEmojiPicker } from './components/overlays/nk-emoji-picker.js';
export { NkToast } from './components/overlays/nk-toast.js';

// Wave 5 – data & collaboration
export { NkDatabase } from './components/data/nk-database.js';
export { NkTableView } from './components/data/nk-table-view.js';
export { NkBoardView } from './components/data/nk-board-view.js';
export { NkFilterBar } from './components/data/nk-filter-bar.js';
export { NkComments } from './components/data/nk-comments.js';
export { NkComment } from './components/data/nk-comment.js';
export { NkAiThread } from './components/data/nk-ai-thread.js';
export { NkAiMsg } from './components/data/nk-ai-msg.js';
export { NkAiInputRow } from './components/data/nk-ai-input-row.js';
export { renderPropertyCell, tagFor, compareBy } from './util/property-cell.js';
