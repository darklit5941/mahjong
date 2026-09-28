import { expect, test } from 'vitest';
import html from '../../index.html?raw';

test('F1: header report link opens the requested prefilled form in a new tab', () => {
  const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? '';
  const link = header.match(/<a\b[^>]*class="issue-report"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
  expect(link).toContain('問題回報');
  expect(link).toContain('target="_blank"');
  expect(link).toContain('rel="noopener noreferrer"');
  expect(link).toContain('另開新分頁');
  const href = link.match(/href="([^"]+)"/)?.[1] ?? '';
  const url = new URL(href.replaceAll('&amp;', '&'));
  expect(url.origin + url.pathname).toBe('https://docs.google.com/forms/d/e/1FAIpQLScTG2QE6irMwgGJYKDzS28hiXbVWtRL9OwYh-6pjAZt1WjP0A/viewform');
  expect(Object.fromEntries(url.searchParams)).toEqual({ usp: 'pp_url', 'entry.869162498': '麻將', 'entry.357280224': 'v1.0' });
});
