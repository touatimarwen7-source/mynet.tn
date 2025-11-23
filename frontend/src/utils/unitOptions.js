// ============ Shared Unit Options Configuration ============
// Used across CreateTender, CreateBid, CreateOffer for consistent unit selection

export const UNIT_OPTIONS = [
  { group: 'Unités Standard', options: [
    { value: 'unité', label: 'Unité' },
    { value: 'pièce', label: 'Pièce' },
    { value: 'lot', label: 'Lot' },
  ]},
  { group: 'Poids & Masse', options: [
    { value: 'mg', label: 'Milligramme (mg)' },
    { value: 'g', label: 'Gramme (g)' },
    { value: 'kg', label: 'Kilogramme (kg)' },
    { value: 'tonnes', label: 'Tonnes' },
  ]},
  { group: 'Volume & Liquides', options: [
    { value: 'ml', label: 'Millilitre (ml)' },
    { value: 'l', label: 'Litre (l)' },
    { value: 'm3', label: 'Mètre cube (m³)' },
  ]},
  { group: 'Longueur & Surface', options: [
    { value: 'mm', label: 'Millimètre (mm)' },
    { value: 'cm', label: 'Centimètre (cm)' },
    { value: 'm', label: 'Mètre (m)' },
    { value: 'km', label: 'Kilomètre (km)' },
    { value: 'm2', label: 'Mètre carré (m²)' },
    { value: 'ha', label: 'Hectare (ha)' },
  ]},
  { group: 'Temps', options: [
    { value: 'minute', label: 'Minute' },
    { value: 'heure', label: 'Heure' },
    { value: 'jour', label: 'Jour' },
    { value: 'semaine', label: 'Semaine' },
    { value: 'mois', label: 'Mois' },
    { value: 'année', label: 'Année' },
  ]},
  { group: 'Emballage', options: [
    { value: 'boite', label: 'Boîte' },
    { value: 'paquet', label: 'Paquet' },
    { value: 'carton', label: 'Carton' },
    { value: 'palette', label: 'Palette' },
    { value: 'conteneur', label: 'Conteneur' },
  ]},
];

export default UNIT_OPTIONS;
