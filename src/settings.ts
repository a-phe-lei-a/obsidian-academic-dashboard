import { PluginSettingTab, App, Setting } from 'obsidian';
import AcademicDashboardPlugin from './main';
import { t } from './lang';

export interface AcademicDashboardSettings {
    language: string;
    academicYear: string;
    propertyName: string;
    semesterPropertyName: string;
    uePropertyName: string;
    excludedFolders: string;
    s1StartDate: string;
    s1EndDate: string;
    s2StartDate: string;
    s2EndDate: string;
    volumePropertyName: string;
    pomodoroMinutes: number;
    evaluationTypePropertyName: string;
    dashboardTitle: string;
    evaluationColors: string;
    session1PropertyName: string;
    session2PropertyName: string;
    supervisionStartPropertyName: string;
    supervisionEndPropertyName: string;
}

export const DEFAULT_SETTINGS: AcademicDashboardSettings = {
    language: 'fr',
    academicYear: '2025-2026',
    propertyName: 'ied_ec_academic_year',
    semesterPropertyName: 'ied_ec_semestre',
    uePropertyName: 'ied_ue',
    excludedFolders: 'templates',
    s1StartDate: '2025-09-22',
    s1EndDate: '2025-12-19',
    s2StartDate: '2026-01-19',
    s2EndDate: '2026-04-11',
    volumePropertyName: 'ied_ec_volume',
    pomodoroMinutes: 40,
    evaluationTypePropertyName: 'ied_ec_evaluation_type',
    dashboardTitle: 'IED Dashboard',
    evaluationColors: 'Examen sur table: #ff5555\nDossier Moodle: #55aaff',
    session1PropertyName: 'ied_ec_session_1',
    session2PropertyName: 'ied_ec_session_2',
    supervisionStartPropertyName: 'ied_ec_supervision_start',
    supervisionEndPropertyName: 'ied_ec_supervision_end'
}

export class AcademicDashboardSettingTab extends PluginSettingTab {
    plugin: AcademicDashboardPlugin;

    constructor(app: App, plugin: AcademicDashboardPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        const l = this.plugin.settings.language;

        containerEl.empty();
        containerEl.addClass('academic-settings-flat');

        // Main Title
        containerEl.createEl('h2', { text: "Academic Dashboard", cls: 'academic-main-title' });

        // --- 1. General ---
        this.addHeader(containerEl, t(l, 'sectionGeneral'));

        new Setting(containerEl)
            .setName(t(l, 'settingLanguage'))
            .setDesc(t(l, 'settingLanguageDesc'))
            .addDropdown(d => d
                .addOption('fr', 'Français')
                .addOption('en', 'English')
                .setValue(this.plugin.settings.language)
                .onChange(async v => {
                    this.plugin.settings.language = v;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        new Setting(containerEl)
            .setName(t(l, 'dashboardTitle'))
            .setDesc(t(l, 'dashboardTitleDesc'))
            .addText(t => t
                .setPlaceholder('My Dashboard')
                .setValue(this.plugin.settings.dashboardTitle)
                .onChange(async v => {
                    this.plugin.settings.dashboardTitle = v;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(t(l, 'targetYear'))
            .setDesc(t(l, 'targetYearDesc'))
            .addText(t => t
                .setPlaceholder('2025-2026')
                .setValue(this.plugin.settings.academicYear)
                .onChange(async v => {
                    this.plugin.settings.academicYear = v;
                    await this.plugin.saveSettings();
                }));


        // --- 2. Schedule ---
        this.addHeader(containerEl, t(l, 'sectionSchedule'));

        new Setting(containerEl)
            .setName(t(l, 'semester1'))
            .setDesc("Start Date — End Date")
            .addText(text => {
                text.inputEl.type = 'date';
                text.setValue(this.plugin.settings.s1StartDate || '')
                    .onChange(async v => {
                        this.plugin.settings.s1StartDate = v;
                        await this.plugin.saveSettings();
                    });
            })
            .addText(text => {
                text.inputEl.type = 'date';
                text.setValue(this.plugin.settings.s1EndDate || '')
                    .onChange(async v => {
                        this.plugin.settings.s1EndDate = v;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName(t(l, 'semester2'))
            .setDesc("Start Date — End Date")
            .addText(text => {
                text.inputEl.type = 'date';
                text.setValue(this.plugin.settings.s2StartDate || '')
                    .onChange(async v => {
                        this.plugin.settings.s2StartDate = v;
                        await this.plugin.saveSettings();
                    });
            })
            .addText(text => {
                text.inputEl.type = 'date';
                text.setValue(this.plugin.settings.s2EndDate || '')
                    .onChange(async v => {
                        this.plugin.settings.s2EndDate = v;
                        await this.plugin.saveSettings();
                    });
            });


        // --- 3. Visuals ---
        this.addHeader(containerEl, t(l, 'sectionVisuals'));

        new Setting(containerEl)
            .setName(t(l, 'pomodoroTimer'))
            .setDesc(t(l, 'pomodoroDesc'))
            .addText(t => {
                t.inputEl.type = 'number';
                t.setValue(String(this.plugin.settings.pomodoroMinutes))
                    .onChange(async v => {
                        const val = parseInt(v);
                        if (!isNaN(val) && val > 0) {
                            this.plugin.settings.pomodoroMinutes = val;
                            await this.plugin.saveSettings();
                        }
                    });
            });

        containerEl.createDiv({ text: t(l, 'evalColors'), cls: 'academic-sub-label' });
        const colorContainer = containerEl.createDiv({ cls: 'academic-color-container' });
        this.renderColorEditor(colorContainer, l);


        // --- 4. Advanced ---
        this.addHeader(containerEl, t(l, 'sectionAdvanced'));

        const details = containerEl.createEl('details');
        details.createEl('summary', { text: "Show Property Names" });
        const advContent = details.createDiv({ cls: 'academic-advanced-inner' });

        const addProp = (n: string, v: string, s: (val: string) => Promise<void>) => {
            new Setting(advContent)
                .setName(n)
                .addText(t => t.setValue(v).onChange(async val => await s(val)));
        };

        addProp(t(l, 'propYear'), this.plugin.settings.propertyName, async v => { this.plugin.settings.propertyName = v; await this.plugin.saveSettings(); });
        addProp(t(l, 'propSemester'), this.plugin.settings.semesterPropertyName, async v => { this.plugin.settings.semesterPropertyName = v; await this.plugin.saveSettings(); });
        addProp(t(l, 'propUE'), this.plugin.settings.uePropertyName, async v => { this.plugin.settings.uePropertyName = v; await this.plugin.saveSettings(); });
        addProp(t(l, 'propVolume'), this.plugin.settings.volumePropertyName, async v => { this.plugin.settings.volumePropertyName = v; await this.plugin.saveSettings(); });
        addProp(t(l, 'propEvalType'), this.plugin.settings.evaluationTypePropertyName, async v => { this.plugin.settings.evaluationTypePropertyName = v; await this.plugin.saveSettings(); });

        addProp(`${t(l, 'propExamDates')} (S1)`, this.plugin.settings.session1PropertyName, async v => { this.plugin.settings.session1PropertyName = v; await this.plugin.saveSettings(); });
        addProp(`${t(l, 'propExamDates')} (S2)`, this.plugin.settings.session2PropertyName, async v => { this.plugin.settings.session2PropertyName = v; await this.plugin.saveSettings(); });

        addProp(`${t(l, 'propSupervision')} (Start)`, this.plugin.settings.supervisionStartPropertyName, async v => { this.plugin.settings.supervisionStartPropertyName = v; await this.plugin.saveSettings(); });
        addProp(`${t(l, 'propSupervision')} (End)`, this.plugin.settings.supervisionEndPropertyName, async v => { this.plugin.settings.supervisionEndPropertyName = v; await this.plugin.saveSettings(); });

        new Setting(advContent)
            .setName(t(l, 'propExcluded'))
            .addTextArea(t => t.setValue(this.plugin.settings.excludedFolders).onChange(async v => { this.plugin.settings.excludedFolders = v; await this.plugin.saveSettings(); }));
    }

    private addHeader(container: HTMLElement, text: string) {
        container.createEl('h3', { text, cls: 'academic-section-header' });
    }

    private createDateSetting(container: HTMLElement, name: string, value: string, cb: (v: string) => Promise<void>) {
        // Simple inline setting
        const div = container.createDiv({ cls: 'academic-inline-date' });
        div.createSpan({ text: name });
        const input = div.createEl('input', { type: 'date', value: value });
        input.onchange = async () => await cb(input.value);
    }

    private renderColorEditor(container: HTMLElement, l: string) {
        container.empty();

        let mappings: { type: string, color: string }[] = [];
        if (this.plugin.settings.evaluationColors) {
            mappings = this.plugin.settings.evaluationColors.split('\n')
                .map(line => {
                    const [type, ...rest] = line.split(':');
                    return (type && rest.length) ? { type: type.trim(), color: rest.join(':').trim() } : null;
                }).filter(x => x !== null) as any;
        }

        if (mappings.length === 0) {
            const empty = container.createDiv({ cls: 'academic-empty-state' });
            empty.setText("No custom colors defined.");
        }

        mappings.forEach((m, idx) => {
            const row = container.createDiv({ cls: 'academic-color-item' });

            // 1. Color Picker
            const picker = row.createEl('input', { type: 'color', value: m.color, cls: 'academic-color-input' });

            // 2. Hex Input (Text)
            const hexInput = row.createEl('input', { type: 'text', value: m.color, cls: 'academic-color-hex' });
            hexInput.placeholder = "#000000";

            // 3. Label Name
            const nameInput = row.createEl('input', { type: 'text', value: m.type, cls: 'academic-color-text' });
            nameInput.placeholder = "Evaluation Type";

            // Sync Logic
            picker.oninput = () => {
                hexInput.value = picker.value;
            };
            picker.onchange = async () => {
                mappings[idx].color = picker.value;
                await this.saveColors(mappings);
            };

            hexInput.onchange = async () => {
                let val = hexInput.value;
                if (!val.startsWith('#')) val = '#' + val;
                // Basic Hex validation
                if (/^#[0-9A-F]{6}$/i.test(val)) {
                    picker.value = val;
                    mappings[idx].color = val;
                    await this.saveColors(mappings);
                } else {
                    // Revert if invalid
                    hexInput.value = mappings[idx].color;
                }
            };

            nameInput.onchange = async () => {
                mappings[idx].type = nameInput.value;
                await this.saveColors(mappings);
            };

            // 4. Delete Button
            const delBtn = row.createEl('button', { cls: 'academic-btn-icon' });
            // Using an icon or simple text 'X'
            delBtn.setText('✕');
            delBtn.setAttribute('aria-label', 'Remove');
            delBtn.onclick = async () => {
                mappings.splice(idx, 1);
                await this.saveColors(mappings);
                this.renderColorEditor(container, l);
            };
        });

        // Add Button
        const btnContainer = container.createDiv({ cls: 'academic-btn-row' });
        const addBtn = btnContainer.createEl('button', { text: t(l, 'addColor'), cls: 'mod-cta' });
        addBtn.onclick = async () => {
            mappings.push({ type: 'New Type', color: '#55aaff' });
            await this.saveColors(mappings);
            this.renderColorEditor(container, l);
        };
    }

    private async saveColors(mappings: { type: string, color: string }[]) {
        this.plugin.settings.evaluationColors = mappings.map(m => `${m.type}: ${m.color}`).join('\n');
        await this.plugin.saveSettings();
    }
}
