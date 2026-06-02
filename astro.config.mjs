// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.finzytrack.com',
	server: { port: 4322 },
	integrations: [
		starlight({
			title: 'Finzytrack',
			// Privacy-friendly analytics via self-hosted Plausible.
			head: [
				{
					tag: 'script',
					attrs: {
						src: 'https://visits.sagar.se/js/pa-a0LeYMJ3RBp_x0zN0I3s9.js',
						async: true,
					},
				},
				{
					tag: 'script',
					content:
						'window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()',
				},
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/sagarbehere/finzytrack' },
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
