import { heroSequence, projectsData, blogsData, factsData, contactData } from './data.js';

// 1. Render Projects
const projectsContainer = document.getElementById('projects-list');
projectsContainer.innerHTML = projectsData.map(proj => {
    const Tag = proj.link ? 'a' : 'div';
    const attrs = proj.link ? `href="${proj.link}" target="_blank" rel="noopener noreferrer"` : '';

    return `
        <${Tag} ${attrs} class="block p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-cyan-400/50 transition group">
            <div class="flex items-center justify-between gap-2">
                <h3 class="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition">${proj.title}</h3>
                ${proj.link ? '<span class="text-slate-500 group-hover:text-cyan-400 transition text-sm">↗</span>' : ''}
            </div>
            <p class="text-xs font-mono text-cyan-400/80 mt-0.5">${proj.date}</p>
            <p class="text-slate-400 text-sm mt-2 leading-relaxed">${proj.description}</p>
            <div class="flex flex-wrap gap-1.5 mt-3">
                ${proj.tags.map(t => `<span class="px-2 py-0.5 bg-slate-800/90 border border-slate-700/80 text-slate-300 text-[11px] font-mono rounded">${t}</span>`).join('')}
            </div>
        </${Tag}>
    `;
}).join('');

// 2. Render Blogs List & Reader
const blogsContainer = document.getElementById('blogs-list');
const blogReaderContent = document.getElementById('blog-reader-content');

blogsContainer.innerHTML = blogsData.map(blog => `
    <article data-blog-id="${blog.id}" class="blog-card p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-yellow-400/50 cursor-pointer transition group">
        <p class="text-xs font-mono text-yellow-400/80">${blog.date}</p>
        <h3 class="text-lg font-bold text-slate-100 group-hover:text-yellow-400 transition mt-0.5">${blog.title}</h3>
        <p class="text-slate-400 text-sm mt-1.5">${blog.summary}</p>
        <span class="text-xs font-mono text-yellow-400 mt-3 inline-block">READ ENTRY →</span>
    </article>
`).join('');

blogsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.blog-card');
    if (!card) return;
    const blog = blogsData.find(b => b.id === card.dataset.blogId);
    if (!blog) return;

    blogReaderContent.innerHTML = `
        <p class="text-xs font-mono text-yellow-400 uppercase tracking-widest">${blog.date}</p>
        <h2 class="text-2xl font-bold text-slate-100 mt-1 mb-6">${blog.title}</h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
            ${blog.paragraphs.map(p => `<p>${p}</p>`).join('')}
        </div>
    `;
    closeAllModals();
    openModal('modal-blog-reader');
});

document.getElementById('back-to-blogs').addEventListener('click', () => {
    closeAllModals();
    openModal('modal-blogs');
});

// 3. Render Fun Facts
document.getElementById('facts-list').innerHTML = factsData.map(fact => `
    <div class="p-4 bg-slate-900/90 border border-slate-800 border-l-2 border-l-purple-400 rounded-xl">
        <span class="text-xs font-mono text-purple-400 block mb-1">${fact.label}</span>
        <p class="text-slate-300 text-sm leading-relaxed">${fact.text}</p>
    </div>
`).join('');

// 4. Render Contact Links
document.getElementById('contact-list').innerHTML = contactData.map(item => `
    <a href="${item.href}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-4 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-emerald-400/50 transition group">
        <div>
            <span class="text-xs font-mono text-emerald-400 block">${item.label}</span>
            <span class="text-sm font-medium text-slate-200 group-hover:text-white">${item.value}</span>
        </div>
        <span class="text-slate-500 group-hover:text-emerald-400 transition">↗</span>
    </a>
`).join('');

// 5. Modal Controller (Exported so physics.js can trigger it too)
export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

export function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
}

document.querySelectorAll('.nav-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
        closeAllModals();
        openModal(btn.dataset.modal);
    });
});

document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) closeAllModals();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
});

// 6. Hero Typing Sequence
async function runTyping() {
    await new Promise(r => setTimeout(r, 500));
    for (const step of heroSequence) {
        const el = document.getElementById(step.id);
        if (!el) continue;
        el.classList.add('typing-cursor');
        for (let i = 0; i < step.text.length; i++) {
            el.textContent = step.text.substring(0, i + 1);
            await new Promise(r => setTimeout(r, step.delay));
        }
        await new Promise(r => setTimeout(r, 350));
        el.classList.remove('typing-cursor');
    }
    const lastLine = document.getElementById('line3');
    if (lastLine) lastLine.classList.add('typing-cursor');
}

runTyping();
