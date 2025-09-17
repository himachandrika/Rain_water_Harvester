self.addEventListener('install', (event) => {
	event.waitUntil((async () => {
		const cache = await caches.open('rtrwh-cache-v1');
		await cache.addAll(['/','/index.html']);
	})());
});

self.addEventListener('fetch', (event) => {
	event.respondWith((async () => {
		const cached = await caches.match(event.request);
		return cached || fetch(event.request);
	})());
});
