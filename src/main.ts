import { Plugin, WorkspaceLeaf } from 'obsidian';
import { AcademicDashboardSettings, DEFAULT_SETTINGS, AcademicDashboardSettingTab } from './settings';
import { AcademicDashboardView } from './view';

// Define the view type
export const VIEW_TYPE_ACADEMIC_DASHBOARD = "academic-dashboard-view";

export default class AcademicDashboardPlugin extends Plugin {
    settings: AcademicDashboardSettings;

    async onload() {
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE_ACADEMIC_DASHBOARD,
            (leaf) => new AcademicDashboardView(leaf, this)
        );

        this.addRibbonIcon('graduation-cap', 'Academic Dashboard', () => {
            this.activateView('center');
        });

        this.addSettingTab(new AcademicDashboardSettingTab(this.app, this));
    }

    async onunload() {

    }

    async activateView(direction: 'sidebar' | 'center' = 'sidebar') {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_ACADEMIC_DASHBOARD);

        if (leaves.length > 0) {
            // A leaf with our view already exists, use that
            leaf = leaves[0];
        } else {
            if (direction === 'sidebar') {
                leaf = workspace.getRightLeaf(false);
            } else {
                leaf = workspace.getLeaf(true); // Open in main area
            }

            if (leaf) {
                await leaf.setViewState({ type: VIEW_TYPE_ACADEMIC_DASHBOARD, active: true });
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        // Update view if it's open
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_ACADEMIC_DASHBOARD);
        leaves.forEach(leaf => {
            if (leaf.view instanceof AcademicDashboardView) {
                // Calling refresh on the view instance
                leaf.view.refresh();
            }
        });
    }
}
