import html from '../index.html?raw';
import { expect, test } from 'vitest';

test('A1: loads Google tag asynchronously and initializes the requested property once', () => {
  const head = html.split('</head>')[0];
  expect(head.match(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-7ENQ4BFR7C"><\/script>/g)).toHaveLength(1);
  const inlineScripts = [...head.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const dataLayer: IArguments[] = [];
  const window = { dataLayer };
  for (const [, script] of inlineScripts) new Function('window', 'dataLayer', script)(window, dataLayer);
  expect(dataLayer.map((args) => Array.from(args))).toEqual([
    ['js', expect.anything()],
    ['config', 'G-7ENQ4BFR7C'],
  ]);
});
