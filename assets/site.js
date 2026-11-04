// Hero: fire perimeters spreading over terrain contours.
// Arrival time for each grid point = distance from ignition, stretched by wind
// and slowed or sped up by a smooth noise "fuel" field. Isochrones of that
// field are drawn with marching squares, revealed over time on page load.
(function () {
	const canvas = document.querySelector('.hero-canvas');
	if (!canvas) return;
	const ctx = canvas.getContext('2d');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

	// Seeded value noise
	function makeNoise(seed) {
		const perm = new Uint8Array(512);
		let s = seed;
		const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
		const p = Array.from({ length: 256 }, (_, i) => i);
		for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
		for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
		const vals = Array.from({ length: 256 }, rand);
		const smooth = t => t * t * (3 - 2 * t);
		const v = (x, y) => vals[perm[(x & 255) + perm[y & 255]]];
		const n = (x, y) => {
			const xi = Math.floor(x), yi = Math.floor(y);
			const xf = smooth(x - xi), yf = smooth(y - yi);
			const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
			return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
		};
		return (x, y) => n(x, y) * 0.6 + n(x * 2.1 + 17, y * 2.1 + 9) * 0.3 + n(x * 4.3 + 3, y * 4.3 + 31) * 0.1;
	}
	const terrain = makeNoise(20250101);
	const fuel = makeNoise(406);

	let W, H, cols, rows, cell, tField, hField, tMax, frontLevels, topoLevels;

	function build() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		W = canvas.clientWidth; H = canvas.clientHeight;
		canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		cell = W < 700 ? 7 : 9;
		cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 1;
		const narrow = W < 760;
		const ix = narrow ? W * 0.66 : W * 0.8, iy = narrow ? H * 0.3 : H * 0.6;
		const wind = narrow ? Math.PI * 0.8 : Math.PI * 1.12; // head of the fire runs left and uphill
		const scale = Math.max(W, H);

		tField = new Float32Array(cols * rows);
		hField = new Float32Array(cols * rows);
		for (let j = 0; j < rows; j++) {
			for (let i = 0; i < cols; i++) {
				const x = i * cell, y = j * cell;
				const dx = x - ix, dy = y - iy;
				const r = Math.hypot(dx, dy) / scale;
				const theta = Math.atan2(dy, dx);
				const speed = 1 + 0.55 * Math.cos(theta - wind);
				const f = 0.55 + 0.9 * fuel(x / 260, y / 260);
				tField[j * cols + i] = r / (speed * f);
				hField[j * cols + i] = terrain(x / 380, y / 380);
			}
		}
		tMax = narrow ? 0.32 : 0.26;
		const nFront = 16;
		frontLevels = Array.from({ length: nFront }, (_, k) => ((k + 1) / nFront) * tMax);
		topoLevels = Array.from({ length: 14 }, (_, k) => 0.2 + k * 0.045);
	}

	function contour(field, level) {
		ctx.beginPath();
		for (let j = 0; j < rows - 1; j++) {
			for (let i = 0; i < cols - 1; i++) {
				const a = field[j * cols + i], b = field[j * cols + i + 1];
				const c = field[(j + 1) * cols + i + 1], d = field[(j + 1) * cols + i];
				const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
				if (idx === 0 || idx === 15) continue;
				const x = i * cell, y = j * cell;
				const lerp = (p, q) => (level - p) / (q - p);
				const top = [x + cell * lerp(a, b), y];
				const right = [x + cell, y + cell * lerp(b, c)];
				const bottom = [x + cell * lerp(d, c), y + cell];
				const left = [x, y + cell * lerp(a, d)];
				const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
				switch (idx) {
					case 1: case 14: seg(left, bottom); break;
					case 2: case 13: seg(bottom, right); break;
					case 3: case 12: seg(left, right); break;
					case 4: case 11: seg(top, right); break;
					case 5: seg(left, top); seg(bottom, right); break;
					case 6: case 9: seg(top, bottom); break;
					case 7: case 8: seg(left, top); break;
					case 10: seg(left, bottom); seg(top, right); break;
				}
			}
		}
		ctx.stroke();
	}

	function colors() {
		const cs = getComputedStyle(document.documentElement);
		return { topo: cs.getPropertyValue('--topo').trim(), accent: cs.getPropertyValue('--accent').trim() };
	}

	function draw(t) {
		const col = colors();
		ctx.clearRect(0, 0, W, H);
		ctx.lineJoin = 'round'; ctx.lineCap = 'round';

		ctx.strokeStyle = col.topo; ctx.lineWidth = 1;
		topoLevels.forEach(l => contour(hField, l));

		ctx.strokeStyle = col.accent;
		const past = frontLevels.filter(l => l < t);
		past.forEach((l, k) => {
			ctx.globalAlpha = 0.14 + 0.4 * ((k + 1) / frontLevels.length);
			ctx.lineWidth = 1;
			contour(tField, l);
		});
		ctx.globalAlpha = 1;
		ctx.lineWidth = 2;
		contour(tField, Math.max(t, 0.004));
		ctx.globalAlpha = 1;
	}

	let raf = null;
	function animate() {
		cancelAnimationFrame(raf);
		if (reduceMotion.matches) { draw(tMax); return; }
		const dur = 3600, start = performance.now();
		const step = now => {
			const p = Math.min((now - start) / dur, 1);
			const eased = 1 - Math.pow(1 - p, 2.2);
			draw(eased * tMax);
			if (p < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	}

	build(); animate();

	let lastW = W;
	window.addEventListener('resize', () => {
		clearTimeout(build.timer);
		build.timer = setTimeout(() => {
			// Mobile browsers fire resize when the address bar hides; only rebuild on width changes.
			if (canvas.clientWidth === lastW && Math.abs(canvas.clientHeight - H) < 120) return;
			lastW = canvas.clientWidth;
			cancelAnimationFrame(raf); build(); draw(tMax);
		}, 150);
	});
	darkQuery.addEventListener('change', () => { cancelAnimationFrame(raf); draw(tMax); });
})();

// Top bar: border + name after scrolling, highlight the section in view.
(function () {
	const bar = document.querySelector('.topbar');
	const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 40);
	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

	const links = [...document.querySelectorAll('.topbar nav a')];
	const sections = links.map(a => document.querySelector(a.getAttribute('href')));
	const io = new IntersectionObserver(entries => {
		entries.forEach(e => {
			if (!e.isIntersecting) return;
			links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
		});
	}, { rootMargin: '-45% 0px -50% 0px' });
	sections.forEach(s => s && io.observe(s));

	const y = document.getElementById('year');
	if (y) y.textContent = new Date().getFullYear();
})();
