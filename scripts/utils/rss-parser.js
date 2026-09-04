/**
 * Lightweight RSS parser using regex.
 * @param {string} xml 
 * @returns {Array<Object>}
 */
export function parseRss(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const getTag = (tag) => {
      // Handle both standard tags and CDATA
      const tagRegex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
      const tagMatch = itemXml.match(tagRegex);
      return tagMatch ? tagMatch[1].trim() : '';
    };

    const title = getTag('title');
    const link = getTag('link');
    const description = getTag('description').replace(/<[^>]+>/g, '').trim(); // strip basic HTML
    const pubDate = getTag('pubDate');

    if (title && link) {
      items.push({ title, link, description, pubDate });
    }
  }

  return items;
}
