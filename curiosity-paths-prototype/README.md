# Curiosity Paths Prototype

## 1. Prototype Files Created
- `index.html`: Structural markup, isolated from production HTML.
- `styles.css`: Visual language implementation (void black, cosmic blue, glassmorphism).
- `script.js`: Layout, rendering, connection handling, and collision-aware positioning.
- `mock-data.js`: Mock topics (Artificial Intelligence as root, 7 paths) cleanly separated from UI logic.
- `README.md`: This documentation.

## 2. Visualization Approach Used
- Implemented a "knowledge landscape/constellation".
- Used an organic, center-out hierarchy where the root node sits in the center with maximum visual weight (Nebula Gold hints).
- Connected paths radiate outward, maintaining clear visual distinction.
- Avoided rigid tree structures in favor of an orbital, dynamic composition.

## 3. Node Positioning Approach Used
- **Collision-Aware Algorithm**: Nodes are placed using radial mathematics. Before final placement, an Axis-Aligned Bounding Box (AABB) collision check runs against all previously placed nodes.
- **Dynamic Recalculation**: If a collision is detected, the algorithm pushes the node outward (increasing radius) and slightly adjusts the angle until a clear space is found.
- **Overlap Prevention**: Strict padding is enforced to guarantee nodes and their text never overlap.
- **Connection Layer**: An SVG layer lives behind the nodes to draw lines that never obscure text.

## 4. Responsive Strategy Used
- **Desktop**: A spacious constellation layout with subtle hover effects and large node sizing.
- **Tablet/Mobile**: The base radius tightens. Node sizing is reduced. For higher node counts on mobile, an alternating inner/outer ring strategy is utilized to maximize space and prevent horizontal overflow.
- **Resize handling**: Layout dynamically recalculates on window resize to ensure no clipped elements.

## 5. Animation Strategy Used
- **CSS Transitions/Animations**: Used pure CSS for entrance staggering (`animate-in`) and idle motion (`idleFloat`) to remain lightweight without external dependencies (no GSAP required).
- **Reduced Motion**: Wrapped continuous animations in `@media (prefers-reduced-motion: no-preference)` to respect user settings. Reduced motion turns off the idle floating while keeping essential state changes.
- **Interaction**: Subtle scale and shadow transitions on hover (desktop) or tap (mobile).

## 6. Performance Considerations
- **No Canvas/WebGL**: Relied on DOM nodes and a single SVG for lines to keep rendering extremely cheap.
- **Hardware Acceleration**: Used `transform: translate()` for layout positioning and animations to leverage GPU compositing.
- **Event Delegation/Throttling**: Window resize event is debounced to avoid layout thrashing.
- **Minimal DOM updates**: Nodes are computed and rendered once per layout cycle.

## 7. Test Viewports Considered
- Desktop Wide (1440px+)
- Desktop Standard (1024px)
- Tablet (768px)
- Modern Mobile (390px)
- Narrow Mobile (320px)

## 8. Known Limitations
- Pure DOM/SVG constellations scale well up to ~20-30 nodes. For a massive infinite canvas, a transition to Canvas/WebGL would be required later.
- Collision detection uses approximate rectangular AABBs based on expected CSS dimensions rather than complex font-metrics computation, which is fast and robust for this prototype.

## 9. Confirmation
- **CONFIRMED**: No production files were modified. The session rendering pipeline, generation pipeline, and authentication systems remain completely untouched. This is an entirely isolated sandbox.
