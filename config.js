// config.js – Demo-Konfiguration (ohne Supabase)
window.APP_CONFIG = {
  PROJECT_NAME: "Dienstgruppe D – PRO",
  YEAR_START: 2026,
  YEAR_END: 2032,

  // Startdatum des Gelb/Weiß-Zyklus (2 Tage Arbeit = Gelb, 2 Tage frei = Weiß)
  // Diese Logik ist aus deiner Originaldatei übernommen.
  START_PATTERN_DATE: "2026-01-02",
  PATTERN_SHIFT: 0,

  // Start-Mitarbeiter (kann in der App geändert werden – Demo speichert lokal)
  EMPLOYEES_DEFAULT: ["Wiesent","Puhl","Botzenhard","Sommer","Schmid"],

  // Buttons/Codes (Optik + Demo-Funktion)
  CODES: [
    {code:"N",  cls:"markN"},
    {code:"F",  cls:"markF"},
    {code:"S",  cls:"markS"},
    {code:"U2", cls:"markU2"},
    {code:"U",  cls:"markU"},
    {code:"AA", cls:"markAA"},
    {code:"AZA",cls:"markAZA"},
    {code:"🍺", cls:"markBeer"},
    {code:"🥳", cls:"markParty"},
    {code:"★",  cls:"markStar"},
    {code:"X",  cls:"markX"}
  ]
};
