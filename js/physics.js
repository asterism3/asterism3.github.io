import { openModal } from './app.js';

const { Engine, Render, Runner, Bodies, Composite, MouseConstraint, Mouse, Events, Vector } = Matter;

const engine = Engine.create();
const world = engine.world;
engine.gravity.y = 0.5;

const container = document.getElementById('canvas-container');
const render = Render.create({
    element: container,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false
    }
});

const categories = [
    { id: 'projects', label: 'PROJECTS', color: '#22d3ee', x: 0.25, y: 0.28 },
    { id: 'art',      label: 'MY ART',   color: '#f472b6', x: 0.75, y: 0.28 },
    { id: 'blogs',    label: 'BLOGS',    color: '#facc15', x: 0.25, y: 0.58 },
    { id: 'contact',  label: 'CONTACT',  color: '#34d399', x: 0.50, y: 0.58 },
    { id: 'funfact',  label: 'SPECS',    color: '#a78bfa', x: 0.75, y: 0.58 }
];

const bodies = categories.map(cat => {
    const body = Bodies.rectangle(
        window.innerWidth * cat.x,
        window.innerHeight * cat.y,
        156, 54,
        {
            chamfer: { radius: 10 },
            render: {
                fillStyle: cat.color,
                strokeStyle: '#ffffff',
                lineWidth: 1.5
            },
            label: cat.id,
            restitution: 0.85
        }
    );
    body.customLabel = cat.label;
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);
    Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 });
    return body;
});

// Background ambient geometric shapes
const randomShapes = [];
const themeRgba = [
    'rgba(34, 211, 238, 0.25)',
    'rgba(244, 114, 182, 0.25)',
    'rgba(250, 204, 21, 0.25)',
    'rgba(52, 211, 153, 0.25)',
    'rgba(51, 65, 85, 0.35)'
];

for (let i = 0; i < 18; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.5;
    const size = Math.random() * 20 + 10;
    const color = themeRgba[Math.floor(Math.random() * themeRgba.length)];

    const shape = Math.random() > 0.5
        ? Bodies.circle(x, y, size, { render: { fillStyle: color }, restitution: 0.7, frictionAir: 0.01 })
        : Bodies.polygon(x, y, Math.round(Math.random() * 4 + 3), size, { render: { fillStyle: color }, restitution: 0.7, frictionAir: 0.01 });

    randomShapes.push(shape);
}

let walls = [];
function updateWalls() {
    Composite.remove(world, walls);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = 60;
    walls = [
        Bodies.rectangle(w / 2, -t / 2, w, t, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(w / 2, h + t / 2, w, t, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(w + t / 2, h / 2, t, h, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(-t / 2, h / 2, t, h, { isStatic: true, render: { visible: false } })
    ];
    Composite.add(world, walls);
}

Composite.add(world, [...bodies, ...randomShapes]);
updateWalls();

window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    render.canvas.width = w;
    render.canvas.height = h;
    render.options.width = w;
    render.options.height = h;
    render.bounds.max.x = w;
    render.bounds.max.y = h;
    updateWalls();
});

const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
});
Composite.add(world, mouseConstraint);
render.mouse = mouse;

// Subtle Mouse Repulsion
Events.on(engine, 'beforeUpdate', () => {
    if (!mouse.position.x || !mouse.position.y) return;
    const allBodies = Composite.allBodies(world);

    allBodies.forEach(body => {
        if (body.isStatic || mouseConstraint.body === body) return;
        const dx = body.position.x - mouse.position.x;
        const dy = body.position.y - mouse.position.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 20000 && distSq > 100) {
            const force = 0.00004 * body.mass;
            const dist = Math.sqrt(distSq);
            Matter.Body.applyForce(body, body.position, {
                x: (dx / dist) * force,
                y: (dy / dist) * force
            });
        }
    });
});

// Particle Explosions
const explosions = [];
function createExplosion(x, y, color) {
    for (let i = 0; i < 18; i++) {
        explosions.push({
            x, y,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.5) * 14,
            life: 1.0,
            color,
            size: Math.random() * 4 + 2
        });
    }
}

// Custom Canvas Overlay (Fixed with ctx.save / ctx.restore)
Events.on(render, 'afterRender', () => {
    const ctx = render.context;

    for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;
        if (p.life <= 0) {
            explosions.splice(i, 1);
            continue;
        }
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    bodies.forEach(body => {
        if (!body.customLabel) return;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        ctx.fillStyle = '#020617';
        ctx.font = '700 15px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(body.customLabel, 0, 0);

        ctx.restore();
    });
});

// Click vs Drag Detection
let mouseDownPos = null;
let clickedLabel = null;

Events.on(mouseConstraint, 'mousedown', (e) => {
    mouseDownPos = { ...e.mouse.position };
    const hit = Matter.Query.point(bodies, mouseDownPos);
    clickedLabel = hit.length > 0 ? hit[0].label : null;
});

Events.on(mouseConstraint, 'mouseup', (e) => {
    if (!clickedLabel || !mouseDownPos) return;
    const dist = Vector.magnitude(Vector.sub(mouseDownPos, e.mouse.position));
    if (dist < 6) {
        const body = bodies.find(b => b.label === clickedLabel);
        if (body) createExplosion(e.mouse.position.x, e.mouse.position.y, body.render.fillStyle);
        openModal(`modal-${clickedLabel}`);
    }
    clickedLabel = null;
});

// Gravity & Reset Controls
let gravityOn = true;
const gravityBtn = document.getElementById('gravity-toggle');
const gravityText = document.getElementById('gravity-text');

gravityBtn.addEventListener('click', () => {
    gravityOn = !gravityOn;
    engine.gravity.y = gravityOn ? 0.5 : 0;
    gravityText.textContent = gravityOn ? 'GRAVITY: ON' : 'GRAVITY: ZERO';

    if (!gravityOn) {
        Composite.allBodies(world).forEach(body => {
            if (!body.isStatic) {
                Matter.Body.applyForce(body, body.position, {
                    x: (Math.random() - 0.5) * 0.01,
                    y: -0.015 * body.mass
                });
            }
        });
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    categories.forEach((cat, i) => {
        const body = bodies[i];
        Matter.Body.setPosition(body, { x: window.innerWidth * cat.x, y: window.innerHeight * cat.y });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
        Matter.Body.setAngle(body, 0);
    });
    createExplosion(window.innerWidth / 2, window.innerHeight / 2, '#22d3ee');
});

Render.run(render);
Runner.run(Runner.create(), engine);
