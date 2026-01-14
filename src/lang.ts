export const translations = {
    fr: {
        // Settings
        settingsTitle: "Paramètres du tableau de bord académique",

        sectionGeneral: "Général",
        sectionGeneralDesc: "Configuration de base pour l'affichage et le filtrage.",
        dashboardTitle: "Titre du tableau de bord",
        dashboardTitleDesc: "Titre affiché dans l'onglet du tableau de bord.",
        targetYear: "Année académique cible",
        targetYearDesc: "L'année académique à filtrer (ex: '2025-2026').",

        sectionSchedule: "Calendrier semestriel",
        scheduleDesc: "Définissez les dates pour suivre la progression et gérer l'affichage.",
        semester1: "Semestre 1",
        semester2: "Semestre 2",
        startDate: "Date de début",
        endDate: "Date de fin",

        sectionVisuals: "Fonctionnalités & visuels",
        sectionVisualsDesc: "Personnalisez l'apparence et les outils de productivité.",
        pomodoroTimer: "Minuteur Pomodoro",
        pomodoroDesc: "Durée d'une session en minutes pour les estimations.",
        evalColors: "Couleurs d'évaluation",
        evalColorsDesc: "Associez des types d'évaluation à des couleurs spécifiques.",
        addColor: "Ajouter une couleur",

        sectionAdvanced: "Configuration des propriétés",
        advancedDesc: "Définissez les clés de propriétés Frontmatter exactes utilisées dans vos notes.",
        propYear: "Propriété année académique",
        propYearDesc: "Clé pour l'année (ex: ied_ec_academic_year).",
        propSemester: "Propriété semestre",
        propSemesterDesc: "Clé pour le semestre (ex: ied_ec_semestre).",
        propUE: "Propriété UE",
        propUEDesc: "Clé pour l'unité d'enseignement (ex: ied_ue).",
        propVolume: "Propriété volume horaire",
        propVolumeDesc: "Clé pour le volume horaire (ex: ied_ec_volume).",
        propEvalType: "Propriété type d'évaluation",
        propEvalTypeDesc: "Clé pour le type d'évaluation (ex: ied_ec_evaluation_type).",
        propExamDates: "Propriétés dates d'examen",
        propExamDatesDesc: "Clés pour les dates de session 1 et 2.",
        propSupervision: "Propriétés supervision",
        propSupervisionDesc: "Clés pour le début et la fin de supervision.",
        propExcluded: "Dossiers exclus",
        propExcludedDesc: "Un chemin de dossier par ligne à ignorer.",

        // View
        viewSemester1: "Semestre 1",
        viewSemester2: "Semestre 2",
        viewOthers: "Autres / Indéfini",
        viewNoCourses: "Aucun cours trouvé pour ce semestre.",
        viewNoPages: "Aucune page trouvée pour cette année académique.",
        viewEnds: "Fin le",
        viewAllTasksDone: "Toutes les tâches sont terminées",

        // Progress Bar
        progStartIn: "Commence dans",
        progStartInMini: "Dans ",
        progDays: "j",
        progDone: "Terminé",
        progWeeksLeft: "semaine(s) restante(s)",
        progWeeks: "sem", // mini

        // General
        settingLanguage: "Langue",
        settingLanguageDesc: "Choisissez la langue de l'interface."
    },
    en: {
        // Settings
        settingsTitle: "Academic Dashboard Settings",

        sectionGeneral: "General",
        sectionGeneralDesc: "Basic configuration for display and filtering.",
        dashboardTitle: "Dashboard Title",
        dashboardTitleDesc: "Title to display in the dashboard tab.",
        targetYear: "Target Academic Year",
        targetYearDesc: "The academic year to filter for (e.g. '2025-2026').",

        sectionSchedule: "Semester Schedule",
        scheduleDesc: "Set dates to track progress bars and manage display.",
        semester1: "Semester 1",
        semester2: "Semester 2",
        startDate: "Start Date",
        endDate: "End Date",

        sectionVisuals: "Features & Visuals",
        sectionVisualsDesc: "Customize appearance and productivity tools.",
        pomodoroTimer: "Pomodoro Timer",
        pomodoroDesc: "Duration of one session in minutes for estimates.",
        evalColors: "Evaluation Colors",
        evalColorsDesc: "Map specific evaluation types to colors.",
        addColor: "Add Color Mapping",

        sectionAdvanced: "Property Configuration",
        advancedDesc: "Define the specific Frontmatter property keys used in your notes.",
        propYear: "Academic Year Property",
        propYearDesc: "Key for the year (e.g. ied_ec_academic_year).",
        propSemester: "Semester Property",
        propSemesterDesc: "Key for the semester (e.g. ied_ec_semestre).",
        propUE: "UE Property",
        propUEDesc: "Key for the teaching unit (e.g. ied_ue).",
        propVolume: "Volume Property",
        propVolumeDesc: "Key for the course volume (e.g. ied_ec_volume).",
        propEvalType: "Evaluation Type Property",
        propEvalTypeDesc: "Key for evaluation type (e.g. ied_ec_evaluation_type).",
        propExamDates: "Exam Dates Properties",
        propExamDatesDesc: "Keys for session 1 and 2 dates.",
        propSupervision: "Supervision Properties",
        propSupervisionDesc: "Keys for supervision start and end dates.",
        propExcluded: "Excluded Folders",
        propExcludedDesc: "One folder path per line to ignore.",

        // View
        viewSemester1: "Semester 1",
        viewSemester2: "Semester 2",
        viewOthers: "Others / Undefined",
        viewNoCourses: "No courses found for this semester.",
        viewNoPages: "No pages found for this academic year.",
        viewEnds: "Ends",
        viewAllTasksDone: "All tasks are completed",

        // Progress Bar
        progStartIn: "Start in",
        progStartInMini: "In ",
        progDays: "d",
        progDone: "Done",
        progWeeksLeft: "week(s) left",
        progWeeks: "w", // mini

        // General
        settingLanguage: "Language",
        settingLanguageDesc: "Choose the interface language."
    }
};

export type Language = 'fr' | 'en';

export function t(lang: string, key: keyof typeof translations['fr']): string {
    const l = (lang === 'en' || lang === 'fr') ? lang : 'fr';
    return translations[l][key] || translations['fr'][key];
}
