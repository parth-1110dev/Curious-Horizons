document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('constellation-container');
    const svgLayer  = document.getElementById('connections-layer');

    // ─────────────────────────────────────────
    // DETERMINISTIC ANGULAR SLOTS
    // 7 fixed angles (in degrees), arranged so:
    //   • No node sits on a pure axis (0°,90°,180°,270°)
    //   • Left/right and top/bottom are visually balanced
    //   • Adjacent slots are always separated by ≥35°
    // ─────────────────────────────────────────
    const SLOT_ANGLES_DEG = [
        -65,   // top-right   (11 o'clock-ish)
        -15,   // right-upper (1 o'clock-ish)
         45,   // bottom-right (4 o'clock-ish)
        115,   // bottom      (6-7 o'clock-ish)
        155,   // bottom-left  (8 o'clock-ish)
       -155,   // left-upper  (10 o'clock-ish)
       -105,   // top-left    (10-11 o'clock-ish, offset from -155 by 50°)
    ];

    // ─────────────────────────────────────────
    // Responsive configuration by breakpoint
    // ─────────────────────────────────────────
    function getConfig(vw) {
        if (vw >= 1280) {
            return { radiusX: 320, radiusY: 240, cardW: 220, containerH: 700 };
        } else if (vw >= 1024) {
            return { radiusX: 280, radiusY: 210, cardW: 210, containerH: 640 };
        } else if (vw >= 768) {
            return { radiusX: 240, radiusY: 190, cardW: 196, containerH: 580 };
        } else if (vw >= 430) {
            return { radiusX: 155, radiusY: 175, cardW: 180, containerH: 620 };
        } else if (vw >= 390) {
            return { radiusX: 142, radiusY: 165, cardW: 165, containerH: 600 };
        } else {
            // 320 narrow mobile
            return { radiusX: 122, radiusY: 155, cardW: 148, containerH: 580 };
        }
    }

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────
    function toRad(deg) { return deg * Math.PI / 180; }

    // Given a rectangle centered at (cx,cy) with half-dimensions (hw, hh),
    // return the point on its boundary in the direction of angle `angleRad`.
    function rectEdgePoint(cx, cy, hw, hh, angleRad) {
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        // Scale to hit the rectangle boundary
        const scaleX = cos !== 0 ? hw / Math.abs(cos) : Infinity;
        const scaleY = sin !== 0 ? hh / Math.abs(sin) : Infinity;
        const scale  = Math.min(scaleX, scaleY);
        return { x: cx + cos * scale, y: cy + sin * scale };
    }

    // ─────────────────────────────────────────
    // Main render function
    // ─────────────────────────────────────────
    function init() {
        // Clear previous render
        container.innerHTML = '';
        container.appendChild(svgLayer);
        svgLayer.innerHTML = '';

        const vw     = window.innerWidth;
        const cfg    = getConfig(vw);

        // Fix the container height for a stable canvas
        container.style.minHeight = cfg.containerH + 'px';

        // Measure actual container dimensions after height is set
        const W  = container.clientWidth;
        const H  = container.clientHeight || cfg.containerH;
        const cx = W / 2;
        const cy = H / 2;

        // Sync SVG coordinate space 1:1 to container pixel space
        svgLayer.setAttribute('viewBox', `0 0 ${W} ${H}`);

        // ── Root node ──────────────────────────────
        const rootEl = createRootNode();
        container.appendChild(rootEl);
        rootEl.style.left = cx + 'px';
        rootEl.style.top  = cy + 'px';

        // Wait one microtask so the browser resolves the root node dimensions
        requestAnimationFrame(() => {
            const rootW = rootEl.offsetWidth  || 160;
            const rootH = rootEl.offsetHeight || 72;
            const rootHW = rootW / 2;
            const rootHH = rootH / 2;

            // ── Path nodes ─────────────────────────────
            const count = Math.min(mockData.paths.length, SLOT_ANGLES_DEG.length);

            // We'll collect final positions, then draw lines in a second pass
            const pathPositions = []; // { el, cx, cy, hw, hh, angleDeg }

            for (let i = 0; i < count; i++) {
                const path    = mockData.paths[i];
                const deg     = SLOT_ANGLES_DEG[i];
                const rad     = toRad(deg);

                const nodeCx  = cx + Math.cos(rad) * cfg.radiusX;
                const nodeCy  = cy + Math.sin(rad) * cfg.radiusY;

                // Clamp so no node goes outside the container with padding
                const edge    = 16;
                const hw      = cfg.cardW / 2;
                const clampedX = Math.max(edge + hw, Math.min(W - edge - hw, nodeCx));
                const clampedY = Math.max(edge + 40,  Math.min(H - edge - 40,  nodeCy));

                const el = createPathNode(path, i);
                el.style.width = cfg.cardW + 'px';
                container.appendChild(el);
                el.style.left = clampedX + 'px';
                el.style.top  = clampedY + 'px';

                pathPositions.push({ el, cx: clampedX, cy: clampedY, hw, deg, rad });
            }

            // ── Second pass: measure actual heights, draw lines ─
            requestAnimationFrame(() => {
                pathPositions.forEach(({ el, cx: nx, cy: ny, hw, rad }) => {
                    const nh = el.offsetHeight || 90;
                    const hh = nh / 2;

                    // Vector from root center → node center
                    const angle = Math.atan2(ny - cy, nx - cx);

                    // Start: root boundary
                    const start = rectEdgePoint(cx, cy, rootHW, rootHH, angle);
                    // End: node boundary (use opposite direction)
                    const end   = rectEdgePoint(nx, ny, hw, hh, angle + Math.PI);

                    drawLine(start.x, start.y, end.x, end.y, el);
                });

                // ── Staggered reveal ────────────────────────────
                // Root first
                requestAnimationFrame(() => {
                    rootEl.classList.add('visible');

                    // Lines fade in
                    const lines = svgLayer.querySelectorAll('.connection-line');
                    lines.forEach((line, i) => {
                        setTimeout(() => line.classList.add('visible'), 120 + i * 80);
                    });

                    // Path nodes stagger
                    pathPositions.forEach(({ el }, i) => {
                        setTimeout(() => el.classList.add('visible'), 160 + i * 90);
                    });
                });
            });
        });
    }

    // ─────────────────────────────────────────
    // DOM builders
    // ─────────────────────────────────────────
    function createRootNode() {
        const div = document.createElement('div');
        div.className = 'node node-root';
        div.innerHTML = `
            <div class="node-label">Topic Explored</div>
            <div class="node-title">${mockData.rootTopic.title}</div>
        `;
        return div;
    }

    function createPathNode(path, index) {
        const div = document.createElement('div');
        div.className = 'node node-path';
        div.dataset.nodeIndex = index;
        div.innerHTML = `
            <div class="node-title">${path.title}</div>
            <div class="node-desc">${path.description}</div>
        `;

        // Desktop hover → highlight line
        div.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 768) highlightLine(div, true);
        });
        div.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 768) highlightLine(div, false);
        });

        // Mobile tap → toggle active + highlight line
        div.addEventListener('click', () => {
            const isActive = div.classList.contains('active-mobile');
            // Deactivate all
            document.querySelectorAll('.node-path').forEach(n => {
                n.classList.remove('active-mobile');
                highlightLine(n, false);
            });
            if (!isActive) {
                div.classList.add('active-mobile');
                highlightLine(div, true);
            }
        });

        return div;
    }

    // ─────────────────────────────────────────
    // SVG line
    // ─────────────────────────────────────────
    function drawLine(x1, y1, x2, y2, targetEl) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.classList.add('connection-line');

        const id = targetEl.dataset.nodeIndex;
        line.dataset.nodeIndex = id;

        svgLayer.appendChild(line);
    }

    function highlightLine(nodeEl, on) {
        const id = nodeEl.dataset.nodeIndex;
        svgLayer.querySelectorAll('.connection-line').forEach(line => {
            if (line.dataset.nodeIndex === id) {
                line.classList.toggle('active', on);
            } else if (on) {
                // Dim others very slightly when one is highlighted
                line.classList.remove('active');
            }
        });
    }

    // ─────────────────────────────────────────
    // Initialization + resize
    // ─────────────────────────────────────────
    function tryInit() {
        if (container.clientWidth === 0) {
            requestAnimationFrame(tryInit);
            return;
        }
        init();
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(tryInit);
    } else {
        requestAnimationFrame(tryInit);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 220);
    });
});
