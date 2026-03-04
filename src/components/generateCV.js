import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

// ============================
// HELPERS CONDIVISI
// ============================

const isFemale = (gender) => /femminile|donna|\bf\b/i.test(gender || "");

const buildDeclaration = (CONTACT_INFO, LABEL_WIDTH, VALUE_LEFT_MARGIN, VALUE_WIDTH, BODY_FONT) => {
    const sottoscritto = isFemale(CONTACT_INFO.gender) ? "La sottoscritta" : "Il sottoscritto";
    return [
        { text: "", margin: [0, 25, 0, 0] },
        {
            columns: [
                { width: LABEL_WIDTH, text: "", fontSize: BODY_FONT },
                { width: VALUE_LEFT_MARGIN, text: "" },
                {
                    width: VALUE_WIDTH,
                    text: `${sottoscritto}, ai sensi degli artt. 46 e 47 D.P.R. n. 445/2000, consapevole delle sanzioni penali previste dall'art. 76 D.P.R. n. 445/2000 nel caso di mendaci dichiarazioni, falsità negli atti, uso o esibizione di atti falsi o contenenti dati non più rispondenti a verità, dichiara che quanto di seguito riportato corrisponde a verità.`,
                    fontSize: BODY_FONT,
                    italics: true,
                    color: "#444444"
                }
            ],
            margin: [0, 3, 0, 3]
        }
    ];
};

const buildLangTable = (langList, LABEL_WIDTH, VALUE_LEFT_MARGIN, VALUE_WIDTH) => {
    if (!langList || langList.length === 0) return [];
    const CELL = { fontSize: 8, alignment: "center" };
    const HDR = { fontSize: 8, bold: true, alignment: "center" };
    const header1 = [
        { text: "", ...HDR },
        { text: "Comprensione", ...HDR, colSpan: 2 }, {},
        { text: "Parlato", ...HDR, colSpan: 2 }, {},
        { text: "Scritto", ...HDR }
    ];
    const header2 = [
        { text: "", ...HDR },
        { text: "Ascolto", ...HDR },
        { text: "Lettura", ...HDR },
        { text: "Interazione", ...HDR },
        { text: "Produzione orale", ...HDR },
        { text: "", ...HDR }
    ];
    const dataRows = langList.map(l => ([
        { text: l.lang || "", ...CELL, bold: true, alignment: "left" },
        { text: l.listen || "", ...CELL },
        { text: l.read || "", ...CELL },
        { text: l.interact || "", ...CELL },
        { text: l.speak || "", ...CELL },
        { text: l.write || "", ...CELL }
    ]));
    return [{
        margin: [0, 3, 0, 0],
        columns: [
            { width: LABEL_WIDTH, text: "" },
            { width: VALUE_LEFT_MARGIN, text: "" },
            {
                width: VALUE_WIDTH,
                table: {
                    widths: ["auto", "*", "*", "*", "*", "*"],
                    body: [header1, header2, ...dataRows]
                },
                layout: "lightHorizontalLines"
            }
        ]
    }];
};

// ============================
// FUNZIONE PRINCIPALE: DOWNLOAD PDF
// ============================
export const generateCV = async (formData) => {

    const CONTACT_INFO = formData.contact;
    const expCards = formData.experience;
    const educationCards = formData.education;
    const certifications = formData.certifications;
    const projects = formData.projects;
    const publications = formData.publications || [];
    const languages = formData.languages;
    const skillGroups = formData.skillGroups;
    const drivingLicense = formData.drivingLicense;
    const customSections = formData.customSections || [];
    const signatureLocation = formData.signatureLocation || "";
    const today = new Date();
    const autoDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    const fullName = `${CONTACT_INFO.firstName} ${CONTACT_INFO.lastName}`.trim();

    const PAGE_MARGINS = [60, 70, 56, 56];
    const VERTICAL_LINE_X = 250;
    const LABEL_WIDTH = VERTICAL_LINE_X - PAGE_MARGINS[0] - 10;
    const VALUE_LEFT_MARGIN = 15;
    const VALUE_WIDTH = "*";
    const TITLE_FONT = 14;
    const BODY_FONT = 10;
    const SECTION_FONT = 11;
    const EU_BLUE = "#003399";
    const GOLD = "#FFCC00";

    const createEUFlag = () => {
        const stars = [];
        const centerX = 30, centerY = 20, radius = 11;
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            const points = [];
            for (let j = 0; j < 10; j++) {
                const r = j % 2 === 0 ? 2.5 : 1;
                const a = (j * 36 - 90) * Math.PI / 180;
                points.push({ x: x + r * Math.cos(a), y: y + r * Math.sin(a) });
            }
            stars.push({ type: 'polyline', closePath: true, points, color: GOLD });
        }
        return {
            canvas: [{ type: 'rect', x: 0, y: 0, w: 60, h: 40, color: EU_BLUE }, ...stars],
            width: 60
        };
    };

    const footer = (currentPage) => ({
        margin: [60, 0, 56, 30],
        stack: [
            { text: `Pagina ${currentPage} - Curriculum vitae di `, fontSize: 9 },
            { text: `${CONTACT_INFO.lastName}, ${CONTACT_INFO.firstName}`, fontSize: 9 }
        ]
    });

    const titleBlock = {
        margin: [0, 0, 0, 30],
        columns: [
            {
                width: LABEL_WIDTH - 5,
                stack: [
                    { text: "FORMATO EUROPEO\nPER IL CURRICULUM\nVITAE", fontSize: TITLE_FONT, bold: true, alignment: "right" },
                    { alignment: "right", margin: [0, 20, 0, 0], ...createEUFlag() }
                ]
            },
            { width: "*", text: "" }
        ]
    };

    const background = (currentPage, pageSize) => ({
        canvas: [{
            type: "line", x1: VERTICAL_LINE_X, y1: 70,
            x2: VERTICAL_LINE_X, y2: pageSize.height - 56,
            lineWidth: 0.5, lineColor: "#000"
        }]
    });

    const row = (label, value, bold = false) => ({
        columns: [
            { width: LABEL_WIDTH, text: label, fontSize: BODY_FONT, bold, alignment: "right" },
            { width: VALUE_LEFT_MARGIN, text: "" },
            { width: VALUE_WIDTH, text: value, fontSize: BODY_FONT }
        ],
        margin: [0, 3, 0, 3]
    });

    const sectionHeader = (title) => [
        { text: "", margin: [0, 8, 0, 0] },
        {
            columns: [
                { width: LABEL_WIDTH, text: title, fontSize: SECTION_FONT, bold: true, alignment: "right" },
                { width: VALUE_LEFT_MARGIN, text: "" },
                { width: VALUE_WIDTH, text: "" }
            ]
        },
        { text: "", margin: [0, 0, 0, 5] }
    ];

    const personalInfo = [
        ...sectionHeader("INFORMAZIONI PERSONALI"),
        row("Nome", fullName),
        ...(CONTACT_INFO.email ? [row("E-mail", CONTACT_INFO.email)] : []),
        ...(CONTACT_INFO.pec ? [row("PEC", CONTACT_INFO.pec)] : []),
        ...(CONTACT_INFO.phone ? [row("Telefono", CONTACT_INFO.phone)] : []),
        ...(CONTACT_INFO.location ? [row("Indirizzo", CONTACT_INFO.location)] : []),
        ...(CONTACT_INFO.dateOfBirth ? [row("Data di nascita", CONTACT_INFO.dateOfBirth)] : []),
        ...(CONTACT_INFO.nationality ? [row("Nazionalità", CONTACT_INFO.nationality)] : []),
        ...(CONTACT_INFO.gender ? [row("Sesso", CONTACT_INFO.gender)] : [])
    ];

    const experienceSec = expCards.length > 0 ? [
        ...sectionHeader("ESPERIENZA LAVORATIVA"),
        ...expCards.flatMap(e => [
            row("• Date (da – a)", `${e.dateFrom || ""} - ${e.dateTo || ""}`),
            ...(e.company ? [row("• Nome e indirizzo del datore di\nlavoro", e.company)] : []),
            ...(e.company_sector ? [row("• Tipo di azienda o settore", e.company_sector)] : []),
            ...(e.title ? [row("• Tipo di impiego", e.title)] : []),
            ...(e.responsibilities && e.responsibilities.length > 0 ? [
                row("• Principali mansioni e\nresponsabilità", e.responsibilities.filter(r => r.trim()).join("\n"))
            ] : []),
            { text: "", margin: [0, 5, 0, 0] }
        ])
    ] : [];

    const educationSec = educationCards.length > 0 ? [
        ...sectionHeader("ISTRUZIONE E FORMAZIONE"),
        ...educationCards.flatMap(e => [
            row("• Date (da – a)", `${e.dateFrom || ""} - ${e.dateTo || ""}`),
            ...(e.study ? [row("• Nome e tipo di istituto di\nistruzione o formazione", e.study)] : []),
            ...(e.study_sector ? [row("• Principali materie / abilità\nprofessionali oggetto dello studio", e.study_sector)] : []),
            ...(e.title ? [row("• Qualifica conseguita", e.title)] : []),
            ...(e.grade ? [row("• Votazione", e.grade)] : []),
            ...(e.national_level ? [row("• Livello nella classificazione\nnazionale (se pertinente)", e.national_level)] : []),
            { text: "", margin: [0, 5, 0, 0] }
        ])
    ] : [];

    const languagesSec = [
        ...sectionHeader("CAPACITÀ E COMPETENZE\nPERSONALI"),
        row("Madrelingua/e", languages.motherTongue || "Italiano"),
        ...(languages.other && languages.other.length > 0 ? [
            { text: "", margin: [0, 3, 0, 0] },
            {
                columns: [
                    { width: LABEL_WIDTH, text: "Altra/e lingua/e\nAutovalutazione\nLivello europeo(*)", fontSize: BODY_FONT, italics: true, alignment: "right" },
                    { width: VALUE_LEFT_MARGIN, text: "" },
                    { width: VALUE_WIDTH, text: "" }
                ]
            },
            ...buildLangTable(languages.other, LABEL_WIDTH, VALUE_LEFT_MARGIN, VALUE_WIDTH)
        ] : [])
    ];

    const skillsSec = skillGroups.length > 0 ? [
        ...sectionHeader("ALTRE CAPACITÀ E COMPETENZE"),
        ...skillGroups.flatMap(group => [
            ...((group.name || group.title) ? [row(group.name || group.title, group._skillsText || (group.skills ? group.skills.map(s => s.name || s).join(", ") : ""))] : []),
            { text: "", margin: [0, 3, 0, 0] }
        ])
    ] : [];

    const projectsSec = projects.length > 0 ? [
        ...sectionHeader("PROGETTI RILEVANTI"),
        ...projects.flatMap(p => [
            ...(p.title ? [row("Titolo", p.title, true)] : []),
            ...(p.tech && p.tech.length > 0 ? [row("Tecnologie", p.tech.join(", "))] : []),
            ...(p.description ? [row("Descrizione", p.description)] : []),
            { text: "", margin: [0, 5, 0, 0] }
        ])
    ] : [];

    const certificationsSec = certifications.length > 0 ? [
        ...sectionHeader("CORSI FORMATIVI\nCERTIFICAZIONI"),
        {
            columns: [
                { width: LABEL_WIDTH, text: "", fontSize: BODY_FONT },
                { width: VALUE_LEFT_MARGIN, text: "" },
                {
                    width: VALUE_WIDTH,
                    stack: certifications
                        .filter(c => c.name || c.title)
                        .map(c => ({
                            text: `${c.name || c.title}${c.issuer ? " - " + c.issuer : ""}${c.year ? " (" + c.year + ")" : ""}`,
                            fontSize: BODY_FONT,
                            margin: [0, 1, 0, 1],
                            noWrap: false
                        }))
                }
            ],
            margin: [0, 3, 0, 3]
        }
    ] : [];

    const publicationsSec = publications.length > 0 ? [
        ...sectionHeader("PUBBLICAZIONI"),
        ...publications.map(pub => ({
            ...row("•", [pub.authors, pub.title ? `"${pub.title}"` : null, pub.venue, pub.year ? pub.year.toString() : null, pub.doi ? `DOI: ${pub.doi}` : null].filter(Boolean).join(", ")),
            margin: [0, 3, 0, 8]
        }))
    ] : [];

    const otherSec = drivingLicense ? [
        ...sectionHeader("PATENTE O PATENTI"),
        row("Patente di guida", drivingLicense)
    ] : [];

    const customSectionsSec = customSections.flatMap(sec => {
        if (!sec.title && (!sec.rows || sec.rows.length === 0)) return [];
        const rows = (sec.rows || []).filter(r => r.label || r.value);
        return [
            ...sectionHeader(sec.title || "SEZIONE PERSONALIZZATA"),
            ...rows.map(r => row(r.label || "", r.value || ""))
        ];
    });

    const declarationSec = buildDeclaration(CONTACT_INFO, LABEL_WIDTH, VALUE_LEFT_MARGIN, VALUE_WIDTH, BODY_FONT);

    const signatureSec = [
        { text: "", margin: [0, 20, 0, 0] },
        {
            canvas: [{
                type: "rect",
                x: VERTICAL_LINE_X - 1,
                y: 0,
                w: 3,
                h: 200,
                color: "#ffffff"
            }],
            absolutePosition: { x: 0, y: 650 }
        },
        {
            columns: [
                { width: LABEL_WIDTH, text: "", fontSize: BODY_FONT },
                { width: VALUE_LEFT_MARGIN, text: "" },
                {
                    width: VALUE_WIDTH,
                    stack: [
                        {
                            text: `${signatureLocation ? signatureLocation + ", " : ""}${autoDate}`,
                            fontSize: BODY_FONT
                        },
                        { text: "", margin: [0, 50, 0, 0] },
                        {
                            columns: [
                                { width: "*", text: "" },
                                {
                                    width: "auto",
                                    stack: [
                                        { canvas: [{ type: "line", x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.5, lineColor: "#000" }] },
                                        { text: "FIRMA", fontSize: BODY_FONT, bold: true, alignment: "center", margin: [0, 4, 0, 0] }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    const docDefinition = {
        pageSize: "A4",
        pageMargins: PAGE_MARGINS,
        footer,
        background,
        content: [
            titleBlock,
            ...personalInfo,
            ...experienceSec,
            ...educationSec,
            ...languagesSec,
            ...skillsSec,
            ...projectsSec,
            ...certificationsSec,
            ...publicationsSec,
            ...otherSec,
            ...customSectionsSec,
            ...declarationSec,
            ...signatureSec
        ],
        defaultStyle: { fontSize: BODY_FONT, lineHeight: 1.15 }
    };

    pdfMake.createPdf(docDefinition).download(`CV_${CONTACT_INFO.lastName}_${CONTACT_INFO.firstName}.pdf`);
};

// ============================
// FUNZIONE ANTEPRIMA: BLOB
// ============================
export const generateCVBlob = async (formData) => {
    return new Promise((resolve) => {

        const CONTACT_INFO = formData.contact;
        const expCards = formData.experience;
        const educationCards = formData.education;
        const certifications = formData.certifications;
        const projects = formData.projects;
        const publications = formData.publications || [];
        const languages = formData.languages;
        const skillGroups = formData.skillGroups;
        const drivingLicense = formData.drivingLicense;
        const customSections = formData.customSections || [];
        const signatureLocation = formData.signatureLocation || "";
        const today = new Date();
        const autoDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

        const fullName = `${CONTACT_INFO.firstName} ${CONTACT_INFO.lastName}`.trim();

        const PAGE_MARGINS = [60, 70, 56, 56];
        const VERTICAL_LINE_X = 250;
        const LABEL_WIDTH = VERTICAL_LINE_X - PAGE_MARGINS[0] - 10;
        const VALUE_LEFT_MARGIN = 15;
        const VALUE_WIDTH = "*";
        const TITLE_FONT = 14;
        const BODY_FONT = 10;
        const SECTION_FONT = 11;
        const EU_BLUE = "#003399";
        const GOLD = "#FFCC00";

        const createEUFlag = () => {
            const stars = [];
            const centerX = 30, centerY = 20, radius = 11;
            for (let i = 0; i < 12; i++) {
                const angle = (i * 30 - 90) * Math.PI / 180;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                const points = [];
                for (let j = 0; j < 10; j++) {
                    const r = j % 2 === 0 ? 2.5 : 1;
                    const a = (j * 36 - 90) * Math.PI / 180;
                    points.push({ x: x + r * Math.cos(a), y: y + r * Math.sin(a) });
                }
                stars.push({ type: 'polyline', closePath: true, points, color: GOLD });
            }
            return {
                canvas: [{ type: 'rect', x: 0, y: 0, w: 60, h: 40, color: EU_BLUE }, ...stars],
                width: 60
            };
        };

        const footer = (currentPage) => ({
            margin: [60, 0, 56, 30],
            stack: [
                { text: `Pagina ${currentPage} - Curriculum vitae di `, fontSize: 9 },
                { text: `${CONTACT_INFO.lastName}, ${CONTACT_INFO.firstName}`, fontSize: 9 }
            ]
        });

        const background = (currentPage, pageSize) => ({
            canvas: [{
                type: "line", x1: VERTICAL_LINE_X, y1: 70,
                x2: VERTICAL_LINE_X, y2: pageSize.height - 56,
                lineWidth: 0.5, lineColor: "#000"
            }]
        });

        const row = (label, value, bold = false) => ({
            columns: [
                { width: LABEL_WIDTH, text: label, fontSize: BODY_FONT, bold, alignment: "right" },
                { width: VALUE_LEFT_MARGIN, text: "" },
                { width: VALUE_WIDTH, text: value, fontSize: BODY_FONT }
            ],
            margin: [0, 3, 0, 3]
        });

        const sectionHeader = (title) => [
            { text: "", margin: [0, 8, 0, 0] },
            {
                columns: [
                    { width: LABEL_WIDTH, text: title, fontSize: SECTION_FONT, bold: true, alignment: "right" },
                    { width: VALUE_LEFT_MARGIN, text: "" },
                    { width: VALUE_WIDTH, text: "" }
                ]
            },
            { text: "", margin: [0, 0, 0, 5] }
        ];

        const titleBlock = {
            margin: [0, 0, 0, 30],
            columns: [
                {
                    width: LABEL_WIDTH - 5,
                    stack: [
                        { text: "FORMATO EUROPEO\nPER IL CURRICULUM\nVITAE", fontSize: TITLE_FONT, bold: true, alignment: "right" },
                        { alignment: "right", margin: [0, 20, 0, 0], ...createEUFlag() }
                    ]
                },
                { width: "*", text: "" }
            ]
        };

        const personalInfo = [
            ...sectionHeader("INFORMAZIONI PERSONALI"),
            row("Nome", fullName),
            ...(CONTACT_INFO.email ? [row("E-mail", CONTACT_INFO.email)] : []),
            ...(CONTACT_INFO.pec ? [row("PEC", CONTACT_INFO.pec)] : []),
            ...(CONTACT_INFO.phone ? [row("Telefono", CONTACT_INFO.phone)] : []),
            ...(CONTACT_INFO.location ? [row("Indirizzo", CONTACT_INFO.location)] : []),
            ...(CONTACT_INFO.dateOfBirth ? [row("Data di nascita", CONTACT_INFO.dateOfBirth)] : []),
            ...(CONTACT_INFO.nationality ? [row("Nazionalità", CONTACT_INFO.nationality)] : []),
            ...(CONTACT_INFO.gender ? [row("Sesso", CONTACT_INFO.gender)] : []),
        ];

        const experienceSec = expCards.length > 0 ? [
            ...sectionHeader("ESPERIENZA LAVORATIVA"),
            ...expCards.flatMap(e => [
                row("• Date (da – a)", `${e.dateFrom || ""} - ${e.dateTo || ""}`),
                ...(e.company ? [row("• Nome e indirizzo del datore di\nlavoro", e.company)] : []),
                ...(e.company_sector ? [row("• Tipo di azienda o settore", e.company_sector)] : []),
                ...(e.title ? [row("• Tipo di impiego", e.title)] : []),
                ...(e.responsibilities && e.responsibilities.length > 0 ? [
                    row("• Principali mansioni e\nresponsabilità", e.responsibilities.filter(r => r.trim()).join("\n"))
                ] : []),
                { text: "", margin: [0, 5, 0, 0] }
            ])
        ] : [];

        const educationSec = educationCards.length > 0 ? [
            ...sectionHeader("ISTRUZIONE E FORMAZIONE"),
            ...educationCards.flatMap(e => [
                row("• Date (da – a)", `${e.dateFrom || ""} - ${e.dateTo || ""}`),
                ...(e.study ? [row("• Nome e tipo di istituto di\nistruzione o formazione", e.study)] : []),
                ...(e.study_sector ? [row("• Principali materie / abilità\nprofessionali oggetto dello studio", e.study_sector)] : []),
                ...(e.title ? [row("• Qualifica conseguita", e.title)] : []),
                ...(e.grade ? [row("• Votazione", e.grade)] : []),
                ...(e.national_level ? [row("• Livello nella classificazione\nnazionale (se pertinente)", e.national_level)] : []),
                { text: "", margin: [0, 5, 0, 0] }
            ])
        ] : [];

        const languagesSec = [
            ...sectionHeader("CAPACITÀ E COMPETENZE\nPERSONALI"),
            row("Madrelingua/e", languages.motherTongue || "Italiano"),
            ...(languages.other && languages.other.length > 0 ? [
                { text: "", margin: [0, 3, 0, 0] },
                {
                    columns: [
                        { width: LABEL_WIDTH, text: "Altra/e lingua/e\nAutovalutazione\nLivello europeo(*)", fontSize: BODY_FONT, italics: true, alignment: "right" },
                        { width: VALUE_LEFT_MARGIN, text: "" },
                        { width: VALUE_WIDTH, text: "" }
                    ]
                },
                ...buildLangTable(languages.other, LABEL_WIDTH, VALUE_LEFT_MARGIN, VALUE_WIDTH)
            ] : [])
        ];

        const skillsSec = skillGroups.length > 0 ? [
            ...sectionHeader("ALTRE CAPACITÀ E COMPETENZE"),
            ...skillGroups.flatMap(group => [
                ...((group.name || group.title) ? [row(group.name || group.title, group._skillsText || (group.skills ? group.skills.map(s => s.name || s).join(", ") : ""))] : []),
                { text: "", margin: [0, 3, 0, 0] }
            ])
        ] : [];

        const projectsSec = projects.length > 0 ? [
            ...sectionHeader("PROGETTI RILEVANTI"),
            ...projects.flatMap(p => [
                ...(p.title ? [row("Titolo", p.title, true)] : []),
                ...(p.tech && p.tech.length > 0 ? [row("Tecnologie", p.tech.join(", "))] : []),
                ...(p.description ? [row("Descrizione", p.description)] : []),
                { text: "", margin: [0, 5, 0, 0] }
            ])
        ] : [];

        const certificationsSec = certifications.length > 0 ? [
            ...sectionHeader("CORSI FORMATIVI\nCERTIFICAZIONI"),
            {
                columns: [
                    { width: LABEL_WIDTH, text: "", fontSize: BODY_FONT },
                    { width: VALUE_LEFT_MARGIN, text: "" },
                    {
                        width: VALUE_WIDTH,
                        stack: certifications
                            .filter(c => c.name || c.title)
                            .map(c => ({
                                text: `${c.name || c.title}${c.issuer ? " - " + c.issuer : ""}${c.year ? " (" + c.year + ")" : ""}`,
                                fontSize: BODY_FONT,
                                margin: [0, 1, 0, 1]
                            }))
                    }
                ],
                margin: [0, 3, 0, 3]
            }
        ] : [];

        const publicationsSec = publications.length > 0 ? [
            ...sectionHeader("PUBBLICAZIONI"),
            ...publications.map(pub => ({
                ...row("•", [pub.authors, pub.title ? `"${pub.title}"` : null, pub.venue, pub.year ? pub.year.toString() : null, pub.doi ? `DOI: ${pub.doi}` : null].filter(Boolean).join(", ")),
                margin: [0, 3, 0, 8]
            }))
        ] : [];

        const otherSec = drivingLicense ? [
            ...sectionHeader("PATENTE O PATENTI"),
            row("Patente di guida", drivingLicense)
        ] : [];

        const customSectionsSec = customSections.flatMap(sec => {
            if (!sec.title && (!sec.rows || sec.rows.length === 0)) return [];
            const rows = (sec.rows || []).filter(r => r.label || r.value);
            return [
                ...sectionHeader(sec.title || "SEZIONE PERSONALIZZATA"),
                ...rows.map(r => row(r.label || "", r.value || ""))
            ];
        });

        const declarationSec = buildDeclaration(CONTACT_INFO, LABEL_WIDTH, VALUE_LEFT_MARGIN, VALUE_WIDTH, BODY_FONT);

        const signatureSec = [
            { text: "", margin: [0, 20, 0, 0] },
            {
                canvas: [{
                    type: "rect",
                    x: VERTICAL_LINE_X - 1,
                    y: 0,
                    w: 3,
                    h: 200,
                    color: "#ffffff"
                }],
                absolutePosition: { x: 0, y: 650 }
            },
            {
                columns: [
                    { width: LABEL_WIDTH, text: "", fontSize: BODY_FONT },
                    { width: VALUE_LEFT_MARGIN, text: "" },
                    {
                        width: VALUE_WIDTH,
                        stack: [
                            {
                                text: `${signatureLocation ? signatureLocation + ", " : ""}${autoDate}`,
                                fontSize: BODY_FONT
                            },
                            { text: "", margin: [0, 50, 0, 0] },
                            {
                                columns: [
                                    { width: "*", text: "" },
                                    {
                                        width: "auto",
                                        stack: [
                                            { canvas: [{ type: "line", x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.5, lineColor: "#000" }] },
                                            { text: "FIRMA", fontSize: BODY_FONT, bold: true, alignment: "center", margin: [0, 4, 0, 0] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        const docDefinition = {
            pageSize: "A4",
            pageMargins: PAGE_MARGINS,
            footer,
            background,
            content: [
                titleBlock,
                ...personalInfo,
                ...experienceSec,
                ...educationSec,
                ...languagesSec,
                ...skillsSec,
                ...projectsSec,
                ...certificationsSec,
                ...publicationsSec,
                ...otherSec,
                ...customSectionsSec,
                ...declarationSec,
                ...signatureSec
            ],
            defaultStyle: { fontSize: BODY_FONT, lineHeight: 1.15 }
        };

        pdfMake.createPdf(docDefinition).getBlob((blob) => {
            resolve(blob);
        });
    });
};
