// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://sagarbehere.github.io',
	base: '/finzytrack-docs',
	server: { port: 4322 },
	integrations: [
		starlight({
			title: 'FinzyTrack',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/finzytrack/finzytrack' },
			],
			sidebar: [
				{ label: 'Home', slug: 'index' },
				{ label: 'Installation', slug: 'installation' },
				{ label: 'Quick Start', slug: 'quick-start' },
				{ label: 'Views', autogenerate: { directory: 'views' } },
				{ label: 'Reference', autogenerate: { directory: 'reference' } },
				{ label: 'Development', autogenerate: { directory: 'development' } },
				{ label: 'FAQ', slug: 'faq' },
			],
		}),
	],
});
