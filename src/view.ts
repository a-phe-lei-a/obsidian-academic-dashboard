import { ItemView, WorkspaceLeaf, TFile, MarkdownRenderer, debounce, Notice } from 'obsidian';
import AcademicDashboardPlugin from './main';
import { VIEW_TYPE_ACADEMIC_DASHBOARD } from './main';
import { t } from './lang';

interface FileCacheData {
    mtime: number;
    pomodorosDone: number;
    pomodorosTotal: number;
    tasks: any[];
}

export class AcademicDashboardView extends ItemView {
    plugin: AcademicDashboardPlugin;
    private cache: Map<string, FileCacheData> = new Map();
    private debouncedRefresh: () => void;
    private isRefreshing = false;

    constructor(leaf: WorkspaceLeaf, plugin: AcademicDashboardPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.debouncedRefresh = debounce(this.safeRefresh.bind(this), 1000, true);
    }

    getViewType() {
        return VIEW_TYPE_ACADEMIC_DASHBOARD;
    }

    getDisplayText() {
        return this.plugin.settings.dashboardTitle || "Academic Dashboard";
    }

    getIcon() {
        return "graduation-cap";
    }

    async onOpen() {
        this.registerEvent(this.app.metadataCache.on('changed', () => this.debouncedRefresh()));
        this.registerEvent(this.app.vault.on('create', () => this.debouncedRefresh()));
        this.registerEvent(this.app.vault.on('delete', () => this.debouncedRefresh()));
        this.registerEvent(this.app.vault.on('rename', () => this.debouncedRefresh()));
        // Initial load
        await this.safeRefresh();
    }

    async safeRefresh() {
        if (this.isRefreshing) return;
        this.isRefreshing = true;
        try {
            await this.refresh();
        } catch (e) {
            console.error("Academic Dashboard Refresh Error:", e);
            new Notice("Error refreshing Academic Dashboard. Check console.");
        } finally {
            this.isRefreshing = false;
        }
    }

    // --- Core Refresh Logic ---
    async refresh() {
        if (!this.containerEl?.children[1]) return;
        const container = this.containerEl.children[1];

        // Optimize: Use DocumentFragment to build off-screen then unnecessary DOM updates
        // However, emptying first is safer for full rebuilds.
        container.empty();

        const wrapper = container.createDiv({ cls: 'academic-dashboard-view' });
        const files = this.getRelevantFiles();

        if (files.length === 0) {
            this.renderEmptyState(wrapper);
            return;
        }

        // Parallel processing of cache updates
        await Promise.all(files.map(f => this.updateFileCache(f)));

        const structure = this.structureData(files);
        const l = this.plugin.settings.language;
        const { s1StartDate, s1EndDate, s2StartDate, s2EndDate } = this.plugin.settings;

        // Render S1
        await this.renderSemester(wrapper, t(l, 'viewSemester1'), structure.s1, s1StartDate, s1EndDate);
        // Render S2
        await this.renderSemester(wrapper, t(l, 'viewSemester2'), structure.s2, s2StartDate, s2EndDate);
        // Render Others
        if (structure.other.length > 0) {
            await this.renderSemester(wrapper, t(l, 'viewOthers'), structure.other, '', '', true);
        }
    }

    // --- Data Layer (Optimized) ---

    // Reads file content ONLY if mtime changed.
    private async updateFileCache(file: TFile): Promise<void> {
        const currentMtime = file.stat.mtime;
        const cached = this.cache.get(file.path);

        if (cached && cached.mtime === currentMtime) return; // Cache Hit

        // Cache Miss: Re-calculate
        try {
            const content = await this.app.vault.cachedRead(file);
            const lines = content.split('\n');
            const metaCache = this.app.metadataCache.getFileCache(file);

            // 1. Pomodoros (Total)
            const volProp = this.plugin.settings.volumePropertyName;
            const pomMinutes = this.plugin.settings.pomodoroMinutes;
            const vol = metaCache?.frontmatter?.[volProp];
            let totalHours = 0;
            if (vol !== undefined) {
                const val = typeof vol === 'string' ? parseFloat(vol) : vol;
                if (!isNaN(val)) totalHours += val;
            }
            const pTotal = totalHours === 0 ? 0 : Math.ceil((totalHours * 60) / pomMinutes);

            // 2. Pomodoros (Done) & Tasks
            let pDone = 0;
            const taskItems: any[] = [];
            const listItems = metaCache?.listItems || [];

            for (const item of listItems) {
                if (item.task === undefined) continue; // Not a task

                const lineIndex = item.position.start.line;
                const lineText = lines[lineIndex];

                // Check for Pomodoro tag
                const match = lineText.match(/\[🍅::\s*(\d+)\]/);
                if (match && match[1]) {
                    pDone += parseInt(match[1], 10) || 0;
                }

                // Store task data for rendering (including indentation)
                taskItems.push({
                    line: lineIndex,
                    text: lineText, // Full line for indent calc
                    checked: item.task !== ' ',
                    pomodoro: (match && match[1]) ? parseInt(match[1], 10) : null
                });
            }

            this.cache.set(file.path, {
                mtime: currentMtime,
                pomodorosDone: pDone,
                pomodorosTotal: pTotal,
                tasks: taskItems
            });

        } catch (e) {
            console.warn(`Failed to process file ${file.path}`, e);
        }
    }

    private getRelevantFiles(): TFile[] {
        const { academicYear, propertyName, excludedFolders } = this.plugin.settings;
        if (!academicYear) return [];

        const excludes = excludedFolders.split('\n').map(p => p.trim()).filter(p => p);

        return this.app.vault.getMarkdownFiles().filter(f => {
            if (excludes.some(e => f.path.startsWith(e))) return false;
            const fm = this.app.metadataCache.getFileCache(f)?.frontmatter;
            if (!fm || !fm[propertyName]) return false;

            const years = Array.isArray(fm[propertyName]) ? fm[propertyName] : [fm[propertyName]];
            return years.some((y: any) => this.cleanText(y) === academicYear);
        });
    }

    private structureData(files: TFile[]) {
        const s1: TFile[] = [];
        const s2: TFile[] = [];
        const other: TFile[] = [];
        const semProp = this.plugin.settings.semesterPropertyName;

        files.forEach(f => {
            const fm = this.app.metadataCache.getFileCache(f)?.frontmatter;
            const sem = fm?.[semProp];
            let assigned = false;

            if (sem) {
                const sems = Array.isArray(sem) ? sem : [sem];
                for (const s of sems) {
                    const txt = this.cleanText(s);
                    if (txt === 'S1') { s1.push(f); assigned = true; break; }
                    if (txt === 'S2') { s2.push(f); assigned = true; break; }
                }
            }
            if (!assigned) other.push(f);
        });
        return { s1, s2, other };
    }

    // --- Render Components (Functional-ish) ---

    private renderEmptyState(container: HTMLElement) {
        container.createDiv({
            cls: 'academic-empty-state',
            text: t(this.plugin.settings.language, 'viewNoPages')
        });
    }

    private async renderSemester(
        container: HTMLElement,
        title: string,
        files: TFile[],
        start: string,
        end: string,
        forceOpen = false
    ) {
        const details = container.createEl("details", { cls: "academic-dashboard-section" });
        const summary = details.createEl("summary");
        summary.createSpan({ text: title });

        if (end) {
            this.createProgressBar(summary, start, end);
            const dateStr = new Date(end).toLocaleDateString();
            summary.createSpan({ text: ` (${t(this.plugin.settings.language, 'viewEnds')} ${dateStr})`, cls: "academic-dashboard-date-label" });
        }

        if (forceOpen || this.isSemesterActive(end)) details.setAttr("open", "");

        if (files.length === 0) {
            details.createDiv({
                text: t(this.plugin.settings.language, 'viewNoCourses'),
                cls: 'academic-no-items'
            });
            return;
        }

        // Group by UE
        const groups: Record<string, TFile[]> = {};
        const ueProp = this.plugin.settings.uePropertyName;
        const otherLabel = t(this.plugin.settings.language, 'viewOthers');

        files.forEach(f => {
            const fm = this.app.metadataCache.getFileCache(f)?.frontmatter;
            let name = otherLabel;
            if (fm && fm[ueProp]) {
                const arr = Array.isArray(fm[ueProp]) ? fm[ueProp] : [fm[ueProp]];
                if (arr.length) name = this.cleanText(arr[0]);
            }
            if (!groups[name]) groups[name] = [];
            groups[name].push(f);
        });

        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === otherLabel) return 1;
            if (b === otherLabel) return -1;
            return a.localeCompare(b);
        });

        for (const ue of sortedKeys) {
            await this.renderUEGroup(details, ue, groups[ue], ue === otherLabel && sortedKeys.length === 1);
        }
    }

    private async renderUEGroup(container: HTMLElement, name: string, files: TFile[], skipHeader: boolean) {
        const wrapper = container.createDiv({ cls: 'academic-dashboard-ue-container' });

        // Stats Aggregation from Cache
        let total = 0, done = 0;
        files.forEach(f => {
            const c = this.cache.get(f.path);
            if (c) { total += c.pomodorosTotal; done += c.pomodorosDone; }
        });

        if (!skipHeader) {
            let label = name;
            if (total > 0 || done > 0) label += ` (🍅 ${done}/${total})`;
            wrapper.createDiv({ text: label, cls: 'academic-dashboard-ue-header' });
        }

        const ul = wrapper.createEl('ul', { cls: 'academic-dashboard-list' });
        for (const f of files) {
            await this.renderFileItem(ul, f);
        }
    }

    private async renderFileItem(container: HTMLElement, file: TFile) {
        const li = container.createEl("li", { cls: 'academic-dashboard-item' });
        const header = li.createDiv({ cls: 'academic-dashboard-item-header' });
        const info = header.createDiv({ cls: 'academic-dashboard-item-info' });

        header.addEventListener("click", e => {
            e.preventDefault();
            this.app.workspace.getLeaf(false).openFile(file);
        });

        const cached = this.cache.get(file.path);
        const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;

        // 1. Title Row
        const titleRow = info.createDiv({ cls: 'academic-dashboard-item-title-row' });
        titleRow.createEl("a", { text: file.basename, cls: 'academic-dashboard-link' });

        // Supervision
        if (fm && fm[this.plugin.settings.supervisionStartPropertyName] && fm[this.plugin.settings.supervisionEndPropertyName]) {
            this.createProgressBar(titleRow, fm[this.plugin.settings.supervisionStartPropertyName], fm[this.plugin.settings.supervisionEndPropertyName], true);
        }

        // Pomodoros
        if (cached && (cached.pomodorosTotal > 0 || cached.pomodorosDone > 0)) {
            titleRow.createSpan({
                text: `🍅 ${cached.pomodorosDone}/${cached.pomodorosTotal}`,
                cls: 'academic-dashboard-tag tag-pomodoro'
            });
        }

        // 2. Meta Row
        const meta = info.createDiv({ cls: 'academic-dashboard-item-meta' });

        // Eval Type
        if (fm?.[this.plugin.settings.evaluationTypePropertyName]) {
            const type = this.cleanText(fm[this.plugin.settings.evaluationTypePropertyName]);
            const badge = meta.createSpan({ text: type, cls: 'academic-dashboard-tag tag-eval' });

            // Color
            this.plugin.settings.evaluationColors.split('\n').forEach(l => {
                const [k, c] = l.split(':');
                if (k?.trim() === type && c) {
                    badge.setAttribute('style', `color: ${c.trim()}; border-color: ${c.trim()};`);
                }
            });
        }

        // Dates
        if (fm?.[this.plugin.settings.session1PropertyName]) this.addDate(meta, fm[this.plugin.settings.session1PropertyName], 'S1');
        if (fm?.[this.plugin.settings.session2PropertyName]) this.addDate(meta, fm[this.plugin.settings.session2PropertyName], 'S2');

        // 3. Tasks
        if (cached && cached.tasks.length > 0) {
            const allTasksDone = cached.tasks.every(t => t.checked);
            let targetContainer: HTMLElement = li;

            if (allTasksDone) {
                li.addClass('is-completed');
                const details = li.createEl("details", { cls: 'academic-dashboard-tasks-collapsed' });
                const summary = details.createEl("summary", { cls: 'academic-dashboard-tasks-summary' });
                summary.createSpan({ text: t(this.plugin.settings.language, 'viewAllTasksDone') });
                targetContainer = details;
            }

            const ul = targetContainer.createEl("ul", { cls: 'academic-dashboard-task-list' });

            for (const t of cached.tasks) {
                const taskLi = ul.createEl("li", { cls: 'academic-dashboard-task-item task-list-item' });
                if (t.checked) taskLi.addClass('is-checked');
                taskLi.setAttribute('data-task', t.checked ? 'x' : ' '); // Standard Obsidian attr

                // Indentation (Tabs=4ch, Spaces=1ch)
                const indentMatch = t.text.match(/^(\s*)/);
                if (indentMatch && indentMatch[1]) {
                    const w = indentMatch[1];
                    const tabs = (w.match(/\t/g) || []).length;
                    const sp = (w.match(/ /g) || []).length;
                    const px = (tabs * 32) + (sp * 8); // Optimized slightly smaller values
                    if (px > 0) taskLi.style.marginLeft = `${px}px`;
                }

                taskLi.createEl("input", {
                    type: "checkbox",
                    cls: 'academic-dashboard-task-checkbox task-list-item-checkbox'
                }).checked = t.checked;
                const span = taskLi.createEl("span", { cls: 'academic-dashboard-task-content' });

                // Clean markdown for task (removes [ ] and [🍅:: N]) without full read
                const cleanMD = t.text.replace(/^\s*[-*+]\d*\.?\s*\[.\]\s*/, "")
                    .replace(/\[🍅::\s*\d+\]/g, "");

                await MarkdownRenderer.render(this.app, cleanMD, span, file.path, this);

                if (t.pomodoro) {
                    taskLi.createSpan({ text: `🍅 ${t.pomodoro}`, cls: 'academic-dashboard-task-pomodoro' });
                }
            }
        }
    }

    // --- Utils ---

    private cleanText(val: any): string {
        if (typeof val !== 'string') return String(val);
        let c = val.replace(/\[\[/g, '').replace(/\]\]/g, '');
        if (c.includes('|')) c = c.split('|').pop()?.trim() || "";
        return c.trim();
    }

    private isSemesterActive(end: string): boolean {
        return !end || new Date() <= new Date(end);
    }

    private addDate(container: HTMLElement, dateStr: string, label: string) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            container.createSpan({ text: `${label}: ${d.toLocaleDateString()}`, cls: 'academic-dashboard-tag tag-date' });
        }
    }

    private createProgressBar(container: HTMLElement, start: string, end: string, mini = false) {
        if (!start || !end) return;
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        const now = Date.now();
        if (isNaN(s) || isNaN(e)) return;

        const total = e - s, elapsed = now - s;
        const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));

        const l = this.plugin.settings.language;
        let text = "";

        if (now < s) {
            const d = Math.ceil((s - now) / 86400000);
            text = mini ? `${t(l, 'progStartInMini')}${d}${t(l, 'progDays')}` : `${t(l, 'progStartIn')} ${d}${t(l, 'progDays')}`;
        } else if (now >= e) text = t(l, 'progDone');
        else {
            const w = Math.ceil((e - now) / 604800000);
            text = mini ? `${w}${t(l, 'progWeeks')}` : `${w} ${t(l, 'progWeeksLeft')}`;
        }

        const wrap = container.createSpan({ cls: `academic-dashboard-progress-container${mini ? ' mini' : ''}` });
        const bar = wrap.createDiv({ cls: `academic-dashboard-progress-bar${mini ? ' mini' : ''}` });
        bar.createDiv({ cls: 'academic-dashboard-progress-fill', attr: { style: `width: ${pct}%` } });
        wrap.createSpan({ text, cls: 'academic-dashboard-progress-text' });
    }

    async onClose() { }
}
