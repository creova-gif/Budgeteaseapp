/** Shared category → emoji map used across the whole app */
export const CATEGORY_ICONS: Record<string, string> = {
  // Swahili
  Chakula: '🍛',
  Usafiri: '🚌',
  Kodi: '🏠',
  Malipo: '💡',
  'Data na Muda': '📱',
  Biashara: '💼',
  Afya: '💊',
  Burudani: '🎮',
  Familia: '👨‍👩‍👧',
  Mishahara: '💼',
  Nyingine: '💰',
  // English
  Food: '🍛',
  Transport: '🚌',
  Rent: '🏠',
  Bills: '💡',
  'Data & Airtime': '📱',
  Business: '💼',
  Health: '💊',
  Entertainment: '🎮',
  Family: '👨‍👩‍👧',
  Salary: '💼',
  Other: '💰',
};

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? '💰';
}
