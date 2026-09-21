"""
Borderless Maastricht – Source Registry
Alle Quellen die gecrawlt werden, mit Metadaten.
"""

SOURCES = [
    # ================================================================
    # NIEDERLANDE (NL)
    # ================================================================
    {
        "url": "https://www.rijksoverheid.nl/onderwerpen/inschrijving-gemeente",
        "source_name": "Rijksoverheid – Inschrijving gemeente",
        "country": "NL", "category": "law", "update_frequency": "quarterly",
    },
    {
        "url": "https://www.rijksoverheid.nl/onderwerpen/burgerservicenummer-bsn",
        "source_name": "Rijksoverheid – BSN",
        "country": "NL", "category": "law", "update_frequency": "quarterly",
    },
    {
        "url": "https://www.digid.nl/aanvragen-en-activeren/hoe-vraag-ik-digid-aan",
        "source_name": "DigiD – Aanvragen",
        "country": "NL", "category": "form", "update_frequency": "monthly",
    },
    {
        "url": "https://www.gemeentemaastricht.nl/en/living-in-maastricht/registration",
        "source_name": "Gemeente Maastricht – Registration",
        "country": "NL", "category": "form", "update_frequency": "weekly",
    },
    {
        "url": "https://www.rijksoverheid.nl/onderwerpen/zorgverzekering/zorgverzekering-afsluiten",
        "source_name": "Rijksoverheid – Zorgverzekering afsluiten",
        "country": "NL", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/zorgtoeslag",
        "source_name": "Belastingdienst – Zorgtoeslag",
        "country": "NL", "category": "tariff", "update_frequency": "monthly",
    },
    {
        "url": "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/huurtoeslag",
        "source_name": "Belastingdienst – Huurtoeslag",
        "country": "NL", "category": "tariff", "update_frequency": "monthly",
    },
    {
        "url": "https://www.grenzinfopunt.nl/nl",
        "source_name": "Grenzinfopunt – NL",
        "country": "NL", "category": "general", "update_frequency": "monthly",
    },
    {
        "url": "https://www.grenzinfopunt.nl/nl/themas/belastingen",
        "source_name": "Grenzinfopunt – Steuern Grenzgänger NL",
        "country": "NL", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.grenzinfopunt.nl/nl/themas/sociale-zekerheid",
        "source_name": "Grenzinfopunt – Sozialversicherung NL",
        "country": "NL", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.svb.nl/nl/internationale-regelingen",
        "source_name": "SVB – Internationale Regelingen",
        "country": "NL", "category": "law", "update_frequency": "quarterly",
    },
    {
        "url": "https://www.duo.nl/particulier/student-in-het-hoger-onderwijs/",
        "source_name": "DUO – Studiefinanciering",
        "country": "NL", "category": "tariff", "update_frequency": "monthly",
    },
    {
        "url": "https://www.ns.nl/producten/studenten-ov-chipkaart",
        "source_name": "NS – OV Studentenkaart",
        "country": "NL", "category": "tariff", "update_frequency": "quarterly",
    },

    # ================================================================
    # DEUTSCHLAND (DE)
    # ================================================================

    # --- Steuer-ID & Finanzamt ---
    {
        "url": "https://www.bzst.de/DE/Privatpersonen/SteuerlicheIdentifikationsnummer/steuerlicheidentifikationsnummer_node.html",
        "source_name": "Bundeszentralamt für Steuern – Steuer-ID",
        "country": "DE", "category": "form", "update_frequency": "quarterly",
    },
    {
        "url": "https://www.elster.de/eportal/helpGlobal?themaGlobal=hilfe_allgemein_was_ist_elster",
        "source_name": "ELSTER – Steuererklärung online",
        "country": "DE", "category": "form", "update_frequency": "quarterly",
    },

    # --- Studentenjobs: Minijob & Werkstudent ---
    {
        "url": "https://www.minijob-zentrale.de/DE/1_fuer_minijobber/1_was_ist_ein_minijob/node.html",
        "source_name": "Minijob-Zentrale – Was ist ein Minijob",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.minijob-zentrale.de/DE/1_fuer_minijobber/3_sozialversicherung/node.html",
        "source_name": "Minijob-Zentrale – Sozialversicherung Minijobber",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.arbeitsagentur.de/bildung/studium/arbeiten-im-studium",
        "source_name": "Bundesagentur für Arbeit – Arbeiten im Studium (Werkstudent)",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },

    # --- Krankenversicherung ---
    {
        "url": "https://www.gkv-spitzenverband.de/krankenversicherung/krankenversicherung.jsp",
        "source_name": "GKV-Spitzenverband – Gesetzliche Krankenversicherung",
        "country": "DE", "category": "law", "update_frequency": "quarterly",
    },
    {
        "url": "https://www.krankenkassen.de/gesetzliche-krankenkassen/krankenversicherung-studenten/",
        "source_name": "Krankenkassen.de – Studentische Krankenversicherung",
        "country": "DE", "category": "tariff", "update_frequency": "monthly",
    },

    # --- Kindergeld ---
    {
        "url": "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-beantragen",
        "source_name": "Familienkasse – Kindergeld beantragen",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-im-ausland",
        "source_name": "Familienkasse – Kindergeld im Ausland (Grenzgänger)",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },

    # --- Sozialversicherung & Rente (Grenzgänger) ---
    {
        "url": "https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Internationales/internationale-sozialversicherung/internationale-sozialversicherung_node.html",
        "source_name": "Deutsche Rentenversicherung – Internationale Sozialversicherung",
        "country": "DE", "category": "law", "update_frequency": "quarterly",
    },

    # --- Grenzgänger NL↔DE (Kernthema Borderless) ---
    {
        "url": "https://www.grenzinfopunt.nl/de",
        "source_name": "Grenzinfopunt – DE Startseite",
        "country": "DE", "category": "general", "update_frequency": "monthly",
    },
    {
        "url": "https://www.grenzinfopunt.nl/de/themen/steuern",
        "source_name": "Grenzinfopunt – Steuern Grenzgänger DE",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.grenzinfopunt.nl/de/themen/soziale-sicherheit",
        "source_name": "Grenzinfopunt – Soziale Sicherheit DE",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.grenzinfopunt.nl/de/themen/krankenversicherung",
        "source_name": "Grenzinfopunt – Krankenversicherung Grenzgänger",
        "country": "DE", "category": "law", "update_frequency": "monthly",
    },

    # --- Anmeldung & Aufenthalt ---
    {
        "url": "https://www.bamf.de/DE/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Studium/studium-node.html",
        "source_name": "BAMF – Studium in Deutschland (Aufenthaltsrecht)",
        "country": "DE", "category": "law", "update_frequency": "quarterly",
    },

    # --- BAföG ---
    {
        "url": "https://www.bafoeg.bmbf.de/bafoeg/de/das-bafoeg/das-bafoeg_node.html",
        "source_name": "BAföG – Studienförderung Deutschland",
        "country": "DE", "category": "tariff", "update_frequency": "monthly",
    },

    # --- Deutschlandticket ---
    {
        "url": "https://www.bundesregierung.de/breg-de/themen/klimaschutz/deutschlandticket-2184276",
        "source_name": "Bundesregierung – Deutschlandticket",
        "country": "DE", "category": "tariff", "update_frequency": "monthly",
    },


    # ================================================================
    # BELGIEN (BE)
    # ================================================================

    # --- Studienbeihilfe ---
    {
        "url": "https://www.studietoelagen.be/",
        "source_name": "Vlaanderen – Studietoelage (Studienbeihilfe Flandern)",
        "country": "BE", "category": "tariff", "update_frequency": "monthly",
    },
    {
        "url": "https://onderwijs.vlaanderen.be/nl/studietoelagen-voor-hoger-onderwijs",
        "source_name": "Onderwijs Vlaanderen – Studietoelage hoger onderwijs",
        "country": "BE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://allocations-etudes.cfwb.be/",
        "source_name": "Fédération Wallonie-Bruxelles – Allocations d'études",
        "country": "BE", "category": "tariff", "update_frequency": "monthly",
    },

    # --- Kindergeld (Groeipakket / Allocations familiales) ---
    {
        "url": "https://www.groeipakket.be/",
        "source_name": "Groeipakket – Kinderbijslag Vlaanderen",
        "country": "BE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.famiwal.be/nl/hoeveel-krijg-je",
        "source_name": "Famiwal – Kinderbijslag Wallonien",
        "country": "BE", "category": "tariff", "update_frequency": "monthly",
    },

    # --- Studentenjobs (studentenovereenkomst, 600h-Regel) ---
    {
        "url": "https://www.studentatwork.be/nl",
        "source_name": "Student@Work – Studentenarbeid & 600-urencontingent",
        "country": "BE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.socialsecurity.be/citizen/nl/werknemer/arbeidsrelatie/studentenarbeidsovereenkomst",
        "source_name": "Sociale Zekerheid BE – Studentenarbeidsovereenkomst",
        "country": "BE", "category": "law", "update_frequency": "quarterly",
    },

    # --- Steuern ---
    {
        "url": "https://finances.belgium.be/nl/particulieren/aangifte",
        "source_name": "FOD Financiën – Belastingaangifte particulieren",
        "country": "BE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://finances.belgium.be/nl/particulieren/belastingvoordelen-en-verminderingen/voor-studenten",
        "source_name": "FOD Financiën – Belastingvoordelen studenten",
        "country": "BE", "category": "tariff", "update_frequency": "monthly",
    },

    # --- Krankenversicherung (Mutualiteit) ---
    {
        "url": "https://www.riziv.fgov.be/nl/themas/kost-en-terugbetaling/door-ziekteverzekering/terugbetaling-voor-specifieke-bevolkingsgroepen/studenten",
        "source_name": "RIZIV – Ziekteverzekering voor studenten",
        "country": "BE", "category": "law", "update_frequency": "quarterly",
    },
    {
        "url": "https://www.socialsecurity.be/citizen/nl/werknemer/arbeidsrelatie/sociale-zekerheid-studenten",
        "source_name": "Sociale Zekerheid BE – Sociale zekerheid studenten",
        "country": "BE", "category": "law", "update_frequency": "quarterly",
    },

    # --- Grenzgänger BE↔NL (Kernthema Borderless) ---
    {
        "url": "https://www.grenzinfopunt.nl/nl/themas/belastingen/belgie-nederland",
        "source_name": "Grenzinfopunt – Belastingen België-Nederland",
        "country": "BE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://finances.belgium.be/nl/particulieren/internationale_aspecten/grensarbeiders",
        "source_name": "FOD Financiën – Grensarbeiders België",
        "country": "BE", "category": "law", "update_frequency": "monthly",
    },
    {
        "url": "https://www.socialsecurity.be/citizen/nl/werknemer/internationale-aspecten/werken-in-meerdere-landen",
        "source_name": "Sociale Zekerheid BE – Werken in meerdere landen",
        "country": "BE", "category": "law", "update_frequency": "quarterly",
    },

    # --- ÖPNV ---
    {
        "url": "https://www.sncb.be/nl/aanbiedingen/young-and-student",
        "source_name": "NMBS/SNCB – Student- en jongerentarieven",
        "country": "BE", "category": "tariff", "update_frequency": "monthly",
    },
    {
        "url": "https://www.delijn.be/nl/content/aanbod/abonnementen/studentenabonnement.html",
        "source_name": "De Lijn – Studentenabonnement Vlaanderen",
        "country": "BE", "category": "tariff", "update_frequency": "monthly",
    },
]
