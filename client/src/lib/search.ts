/**
 * Smart search that matches all words in the query, regardless of order or position
 * Example: "latte soia" matches "latte di soia"
 */
export function matchesSmartSearch(text: string, query: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return true;
  
  // Split query into individual words
  const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);
  
  // Check if all search terms are found in the text
  return searchTerms.every(term => normalizedText.includes(term));
}
