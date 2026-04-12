import DOMPurify from 'dompurify';

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

const ALLOWED_TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'u',
  'ul',
];

const ALLOWED_ATTR = ['alt', 'data-align', 'href', 'rel', 'src', 'style', 'target', 'title', 'width'];

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const isRichTextHtml = (value = '') => HTML_TAG_PATTERN.test(value);

export const normalizeLessonContentToHtml = (value = '') => {
  if (typeof value !== 'string') return '';

  const normalizedValue = value.replace(/\r\n/g, '\n').trim();
  if (!normalizedValue) return '';
  if (isRichTextHtml(normalizedValue)) return normalizedValue;

  return normalizedValue
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
};

export const sanitizeLessonContent = (value = '') => DOMPurify.sanitize(
  normalizeLessonContentToHtml(value),
  {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  },
);

export const hasRenderableLessonContent = (value = '') => sanitizeLessonContent(value)
  .replace(/<img[^>]*>/gi, ' image ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .trim().length > 0;
