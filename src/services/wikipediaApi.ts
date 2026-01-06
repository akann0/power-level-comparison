import { WikiSearchResult, Entity } from '../types';

const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

/* Searches Wikipedia for entities matching the query string */
export async function searchWikipedia(query: string): Promise<WikiSearchResult[]> {
  if (!query.trim()) return [];
  
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'prefixsearch',
    gpssearch: query,
    gpslimit: '8',
    prop: 'pageimages|description',
    piprop: 'thumbnail',
    pithumbsize: '100',
  });

  const response = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();
  
  if (!data.query?.pages) return [];
  
  return Object.values(data.query.pages as Record<string, WikiSearchResult>)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/* Fetches full Wikipedia page content including infobox data */
export async function fetchWikipediaPage(pageId: number): Promise<Entity | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    pageids: pageId.toString(),
    prop: 'extracts|pageimages|revisions',
    exintro: '0',
    explaintext: '1',
    piprop: 'original',
    rvprop: 'content',
    rvslots: 'main',
  });

  const response = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();
  
  const page = data.query?.pages?.[pageId];
  if (!page) return null;

  const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
  const infobox = parseInfobox(wikitext);

  return {
    title: page.title,
    pageid: page.pageid,
    extract: page.extract,
    thumbnail: page.original?.source,
    infobox,
    fullContent: page.extract,
  };
}

/* Parses infobox data from Wikipedia raw wikitext */
function parseInfobox(wikitext: string): Record<string, string> {
  const infobox: Record<string, string> = {};
  const infoboxMatch = wikitext.match(/\{\{Infobox[\s\S]*?\n\}\}/i);
  
  if (!infoboxMatch) return infobox;
  
  const lines = infoboxMatch[0].split('\n');
  for (const line of lines) {
    const match = line.match(/\|\s*(\w+)\s*=\s*(.+)/);
    if (match) {
      const key = match[1].toLowerCase().trim();
      let value = match[2].trim();
      // Remove wiki markup
      value = value.replace(/\[\[([^\]|]+)\|?[^\]]*\]\]/g, '$1');
      value = value.replace(/\{\{[^}]+\}\}/g, '');
      value = value.replace(/<[^>]+>/g, '');
      infobox[key] = value.trim();
    }
  }
  
  return infobox;
}

/* Gets Wikipedia image URL for an entity */
export async function getEntityImage(title: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    titles: title,
    prop: 'pageimages',
    piprop: 'original',
  });

  const response = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await response.json();
  
  const pages = data.query?.pages;
  if (!pages) return null;
  
  const page = Object.values(pages)[0] as { original?: { source: string } };
  return page.original?.source || null;
}

