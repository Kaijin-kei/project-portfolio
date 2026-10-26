const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
  navLinks.classList.toggle('open', !open);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation menu');
}));

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
}), { rootMargin: '-38% 0px -54% 0px' });
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
document.querySelector('#year').textContent = new Date().getFullYear();

// Tiny twinkling points give the background a slow, soft night-sky feel.
const canvas = document.querySelector('.starfield');
const ctx = canvas.getContext('2d');
let stars = [];
let frame = 0;
let skyFrame = 0;
function seedStars() {
  if (skyFrame) cancelAnimationFrame(skyFrame);
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * ratio);
  canvas.height = Math.floor(innerHeight * ratio);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(150, Math.floor(innerWidth * innerHeight / 6500));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: Math.random() * 1.35 + .3, phase: Math.random() * Math.PI * 2,
    speed: Math.random() * .018 + .006,
    tint: Math.random() > .7 ? '205,193,255' : '221,231,255'
  }));
  drawStars();
}
function drawStars() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const star of stars) {
    const alpha = reducedMotion ? .62 : .34 + (Math.sin(frame * star.speed + star.phase) + 1) * .29;
    ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + star.tint + ',' + alpha + ')'; ctx.fill();
    if (star.r > 1.2) {
      ctx.beginPath(); ctx.arc(star.x, star.y, star.r * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + star.tint + ',' + alpha * .12 + ')'; ctx.fill();
    }
  }
  frame++;
  if (!reducedMotion && !document.hidden) skyFrame = requestAnimationFrame(drawStars);
  else skyFrame = 0;
}
seedStars();
window.addEventListener('resize', seedStars, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !reducedMotion && !skyFrame) drawStars();
});

// A subtle tilt makes the glass cards feel touchable on pointer devices.
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      const base = card.classList.contains('profile-glass') ? 'rotate(-2deg) ' : '';
      card.style.transform = base + 'perspective(700px) rotateX(' + y * -4 + 'deg) rotateY(' + x * 5 + 'deg) translateY(-2px)';
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

const guestbookForm = document.querySelector('#guestbook-form');
if (guestbookForm) {
  const guestName = guestbookForm.elements.name;
  const guestMessage = guestbookForm.elements.message;
  const noteArea = document.querySelector('#board-notes');
  const noteCount = document.querySelector('#board-post-count');
  const characterCount = document.querySelector('#guestbook-count');
  const feedback = document.querySelector('#guestbook-feedback');
  const config = window.GUESTBOOK_CONFIG || {};
  const remoteGuestbook = Boolean(config.supabaseUrl && config.publishableKey);
  const localStorageKey = 'kaijin-portfolio-guestbook-v1';
  let guestNotes = [];
  if (!remoteGuestbook) { try { const savedNotes = JSON.parse(localStorage.getItem(localStorageKey) || '[]'); if (Array.isArray(savedNotes)) guestNotes = savedNotes.filter(note => note && typeof note.name === 'string' && typeof note.message === 'string').slice(0, 80); } catch (_) {} }
  const renderGuestbook = () => {
    noteArea.replaceChildren();
    if (!guestNotes.length) { const empty = document.createElement('div'); empty.className = 'board-empty'; const icon = document.createElement('span'); icon.textContent = '✧'; const text = document.createElement('p'); text.textContent = 'Your first little note can go here.'; empty.append(icon, text); noteArea.append(empty); }
    guestNotes.forEach((note, index) => {
      const card = document.createElement('article'); card.className = 'bulletin-note';
      const head = document.createElement('header'); const name = document.createElement('strong'); name.textContent = note.name; const time = document.createElement('time'); const date = new Date(note.created_at || note.createdAt); time.textContent = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {month:'short', day:'numeric'}); head.append(name, time);
      const message = document.createElement('p'); message.textContent = note.message;
      card.append(head, message);
      if (!remoteGuestbook) { const remove = document.createElement('button'); remove.className = 'remove-note'; remove.type = 'button'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', 'Remove note by ' + note.name + ' from this browser'); remove.addEventListener('click', () => { guestNotes.splice(index, 1); try { localStorage.setItem(localStorageKey, JSON.stringify(guestNotes)); } catch (_) {} renderGuestbook(); }); card.append(remove); }
      noteArea.append(card);
    });
    noteCount.textContent = guestNotes.length + (guestNotes.length === 1 ? ' note' : ' notes');
  };
  const apiUrl = (path) => config.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + path;
  const apiHeaders = { apikey: config.publishableKey, Authorization: 'Bearer ' + config.publishableKey, 'Content-Type': 'application/json' };
  const loadRemoteNotes = async () => {
    try {
      const response = await fetch(apiUrl('guestbook_notes?select=id,name,message,created_at&order=created_at.desc&limit=80'), {headers: apiHeaders});
      if (!response.ok) throw new Error('Guestbook read failed');
      guestNotes = await response.json(); renderGuestbook();
      feedback.textContent = '';
    } catch (_) { feedback.textContent = 'The shared board is not connected yet. Check that the Supabase table and read policy are set up.'; renderGuestbook(); }
  };
  guestMessage.addEventListener('input', () => { characterCount.textContent = guestMessage.value.length + ' / 240'; });
  guestbookForm.addEventListener('submit', async event => {
    event.preventDefault(); const name = guestName.value.trim().slice(0, 40); const message = guestMessage.value.trim().slice(0, 240);
    if (!name || !message) { feedback.textContent = 'Add a name and a message before posting.'; return; }
    const submit = guestbookForm.querySelector('button[type="submit"]'); submit.disabled = true;
    if (remoteGuestbook) {
      try {
        const response = await fetch(apiUrl('guestbook_notes'), {method:'POST', headers:{...apiHeaders, Prefer:'return=minimal'}, body:JSON.stringify({name, message})});
        if (!response.ok) throw new Error('Guestbook post failed');
        guestbookForm.reset(); characterCount.textContent = '0 / 240'; feedback.textContent = 'Your note is now on the shared board.'; await loadRemoteNotes();
      } catch (_) { feedback.textContent = 'Your note could not be posted. Check the Supabase table and insert policy.'; }
      finally { submit.disabled = false; }
    } else {
      guestNotes.unshift({name, message, createdAt:new Date().toISOString()}); guestNotes = guestNotes.slice(0, 80);
      try { localStorage.setItem(localStorageKey, JSON.stringify(guestNotes)); } catch (_) {}
      renderGuestbook(); guestbookForm.reset(); characterCount.textContent = '0 / 240'; feedback.textContent = 'Your note is pinned to this browser’s board.'; submit.disabled = false;
    }
  });
  if (remoteGuestbook) loadRemoteNotes(); else renderGuestbook();
}

// The sheep guide cycles through the page and calls a brief Aries meteor shower.
const sheepButton = document.querySelector('#sheep-button');
const sheepPanel = document.querySelector('#sheep-panel');
const panelClose = document.querySelector('.panel-close');
const sheepHero = document.querySelector('.hero');
const meteorLane = document.querySelector('.shooting-lane');
const skyStatus = document.querySelector('#sky-status');
const guidePanels = [
  { title: 'A little about me', text: 'A few notes about the person behind this cozy corner.', href: '#about', label: 'Meet me' },
  { title: 'My little toolkit', text: 'Peek at the skills and creative tools I’m growing.', href: '#skills', label: 'Explore my skills' },
  { title: 'Things I made', text: 'Wander through projects, experiments, and lessons learned.', href: '#projects', label: 'See my projects' },
  { title: 'Say hello', text: 'Have an idea or just want to chat? Let’s connect.', href: '#contact', label: 'Get in touch' }
];
let guideIndex = -1;
let showerTimeout;
function showGuidePanel(index) {
  const item = guidePanels[index];
  document.querySelector('#panel-kicker').textContent = 'A LITTLE WANDER · ' + (index + 1) + ' / ' + guidePanels.length;
  document.querySelector('#panel-title').textContent = item.title;
  document.querySelector('#panel-description').textContent = item.text;
  const link = document.querySelector('#panel-link');
  link.href = item.href; link.firstChild.textContent = item.label + ' ';
  sheepPanel.hidden = false;
  sheepButton.setAttribute('aria-expanded', 'true');
  sheepButton.setAttribute('aria-label', 'Next sheep guide panel: ' + item.title);
}
function summonAries() {
  sheepHero.classList.add('sky-show');
  meteorLane.replaceChildren();
  if (!reducedMotion) {
    for (let i = 0; i < 9; i++) {
      const meteor = document.createElement('i');
      meteor.className = 'shooting-star';
      meteor.style.left = (52 + Math.random() * 53) + '%';
      meteor.style.top = (Math.random() * 50) + '%';
      meteor.style.setProperty('--delay', (Math.random() * 1.8) + 's');
      meteor.style.setProperty('--duration', (1.4 + Math.random() * 1.2) + 's');
      meteorLane.append(meteor);
    }
  }
  skyStatus.textContent = 'Aries is shining as shooting stars cross the sky.';
  clearTimeout(showerTimeout);
  showerTimeout = setTimeout(() => {
    sheepHero.classList.remove('sky-show');
    meteorLane.replaceChildren();
    skyStatus.textContent = 'The Aries meteor shower has faded.';
  }, 5000);
}
sheepButton.addEventListener('click', () => {
  guideIndex = (guideIndex + 1) % guidePanels.length;
  showGuidePanel(guideIndex);
  summonAries();
});
panelClose.addEventListener('click', () => { sheepPanel.hidden = true; sheepButton.setAttribute('aria-expanded', 'false'); sheepButton.setAttribute('aria-label', 'Open the sheep guide and summon stars'); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !sheepPanel.hidden) { sheepPanel.hidden = true; sheepButton.setAttribute('aria-expanded', 'false'); sheepButton.focus(); }
});


// Open a runnable browser recreation for each downloadable Python practice project.
const playerDialog = document.querySelector('#project-dialog');
const playerApp = document.querySelector('#project-app');
const playerTitle = document.querySelector('#dialog-title');
const playerNote = document.querySelector('#dialog-note');
const projectInfo = {
  math: ['Math Class & Objects', 'A tiny quiz inspired by the original Python class exercise. Pick a topic and try up to three times.'],
  students: ['Student Management System', 'Add, search, filter, edit, and delete sample records. Records stay in this browser tab and clear when the page reloads.'],
  guess: ['Guess the Number', 'I picked a whole number from 1 to 100. Use the hints to find it, then start a fresh round.'],
  calc: ['Simple Calculator', 'This playable browser version completes the calculator idea. The downloadable Python file is still an early prototype.'],
  login: ['Console Login Trial', 'Practice a three-attempt login flow. This local demo is only for learning and is not secure authentication.']
};
function launchProject(id) {
  const info = projectInfo[id];
  if (!info) return;
  playerTitle.textContent = info[0];
  playerNote.textContent = info[1];
  if (id === 'math') renderMathApp();
  if (id === 'students') renderStudentsApp();
  if (id === 'guess') renderGuessApp();
  if (id === 'calc') renderCalcApp();
  if (id === 'login') renderLoginApp();
  playerDialog.showModal();
}
document.querySelectorAll('.run-project').forEach(button => button.addEventListener('click', () => launchProject(button.dataset.project)));
document.querySelector('.dialog-close').addEventListener('click', () => playerDialog.close());
playerDialog.addEventListener('click', event => { if (event.target === playerDialog) playerDialog.close(); });
function escapePlayerText(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }

function renderMathApp() {
  let topic = 'function'; let tries = 0; let solved = false;
  const quiz = {
    function: { label: 'Functions', prompt: 'For x = 2, evaluate 2x² + 3x − 1.', answers: ['13'] },
    sequence: { label: 'Sequences', prompt: 'Complete the sequence: 3, 6, 9, __', answers: ['12'] },
    sets: { label: 'Sets', prompt: 'What is the usual name for the set {0, 1, 2, 3, …}?', answers: ['w', 'w set', 'whole numbers', 'whole number set'] }
  };
  function draw() {
    const q = quiz[topic];
    playerApp.innerHTML = '<div class="quiz-tabs">' + Object.keys(quiz).map(key => '<button type="button" data-topic="' + key + '" aria-pressed="' + (topic === key) + '">' + quiz[key].label + '</button>').join('') + '</div><p class="app-question">' + q.prompt + '</p><form class="guess-form" id="math-form"><label>Your answer<input name="answer" autocomplete="off" required ' + (solved || tries >= 3 ? 'disabled' : '') + '></label><button class="app-button" ' + (solved || tries >= 3 ? 'disabled' : '') + '>Check answer</button><span class="attempt-meter">' + tries + ' / 3 tries</span></form><p class="app-feedback" id="math-feedback" aria-live="polite">' + (solved ? 'You got it! Choose another topic to keep playing.' : tries >= 3 ? 'That’s all three tries—choose another topic and start fresh.' : 'Give it your best guess!') + '</p>' + (solved || tries >= 3 ? '<button class="app-secondary" type="button" id="math-retry">Try this topic again</button>' : '');
    playerApp.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => { topic = button.dataset.topic; tries = 0; solved = false; draw(); }));
    const retry = playerApp.querySelector('#math-retry'); if (retry) retry.addEventListener('click', () => { tries = 0; solved = false; draw(); });
    playerApp.querySelector('#math-form').addEventListener('submit', event => { event.preventDefault(); tries++; const answer = event.currentTarget.elements.answer.value.trim().toLowerCase(); solved = q.answers.includes(answer); const feedback = playerApp.querySelector('#math-feedback'); feedback.textContent = solved ? 'Correct! Nice work ✨' : tries >= 3 ? 'The answer was ' + q.answers[0] + '. Pick a topic to try again.' : 'Not quite—give it another go.'; draw(); });
  }
  draw();
}

function renderGuessApp() {
  const secret = Math.floor(Math.random() * 100) + 1; let guesses = 0; let done = false;
  playerApp.innerHTML = '<p class="app-intro">I’m thinking of a number between <strong>1 and 100</strong>. Can you find it?</p><form class="guess-form" id="number-form"><label>Your guess<input name="guess" type="number" min="1" max="100" required ' + (done ? 'disabled' : '') + '></label><button class="app-button" ' + (done ? 'disabled' : '') + '>Make a guess</button><span class="attempt-meter">Guesses: <b id="guess-count">0</b></span></form><p class="app-feedback" id="guess-feedback" aria-live="polite">Ready when you are!</p><button class="app-secondary" id="new-number" type="button">Pick a new number</button>';
  playerApp.querySelector('#number-form').addEventListener('submit', event => { event.preventDefault(); const guess = Number(event.currentTarget.elements.guess.value); const feedback = playerApp.querySelector('#guess-feedback'); if (guess < 1 || guess > 100) { feedback.textContent = 'Choose a number from 1 to 100.'; return; } guesses++; playerApp.querySelector('#guess-count').textContent = guesses; if (guess === secret) { feedback.textContent = 'You got it in ' + guesses + (guesses === 1 ? ' guess! 🎉' : ' guesses! 🎉'); done = true; event.currentTarget.elements.guess.disabled = true; event.currentTarget.querySelector('button').disabled = true; } else feedback.textContent = guess > secret ? 'A little lower ↓' : 'Go higher ↑'; event.currentTarget.elements.guess.value = ''; });
  playerApp.querySelector('#new-number').addEventListener('click', renderGuessApp);
}

function renderCalcApp() {
  playerApp.innerHTML = '<p class="app-intro">A simple four-operation calculator. Enter two numbers and pick what to do.</p><form class="calc-form" id="calc-form"><label>First number<input name="first" type="number" step="any" required></label><label>Operation<select name="operation"><option value="+">+</option><option value="-">−</option><option value="*">×</option><option value="/">÷</option></select></label><label>Second number<input name="second" type="number" step="any" required></label><button class="app-button">Calculate</button></form><p class="app-feedback" id="calc-feedback" aria-live="polite">Your answer will appear here.</p>';
  playerApp.querySelector('#calc-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; const a = Number(form.elements.first.value); const b = Number(form.elements.second.value); const op = form.elements.operation.value; if (op === '/' && b === 0) { playerApp.querySelector('#calc-feedback').textContent = 'You can’t divide by zero—try a different second number.'; return; } const result = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b; playerApp.querySelector('#calc-feedback').textContent = 'Answer: ' + Number(result.toPrecision(10)); });
}

function renderLoginApp() {
  const demoUsers = { admin: 'admin123', user1: 'pass1', guest: 'guest' }; let attempts = 0; let locked = false;
  playerApp.innerHTML = '<p class="login-demo-note">Learning demo only · try <strong>guest</strong> / <strong>guest</strong> · three attempts maximum</p><form class="app-form" id="login-form"><label>Username<input name="username" autocomplete="username" required ' + (locked ? 'disabled' : '') + '></label><label>Password<input name="password" type="password" autocomplete="current-password" required ' + (locked ? 'disabled' : '') + '></label><button class="span-all" ' + (locked ? 'disabled' : '') + '>Log in</button></form><p class="app-feedback" id="login-feedback" aria-live="polite">Attempts remaining: 3</p><p class="demo-warning">This is a client-side learning exercise. Never use it to protect real accounts or private information.</p>';
  playerApp.querySelector('#login-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; const username = form.elements.username.value.trim(); const password = form.elements.password.value; const feedback = playerApp.querySelector('#login-feedback'); if (demoUsers[username] === password) { feedback.textContent = 'Welcome, ' + username + '! Login successful ✨'; form.querySelector('button').disabled = true; return; } attempts++; const remaining = 3 - attempts; locked = remaining === 0; feedback.textContent = locked ? 'Too many failed attempts. This demo is locked.' : 'Those details didn’t match. Attempts remaining: ' + remaining; if (locked) { form.elements.username.disabled = true; form.elements.password.disabled = true; form.querySelector('button').disabled = true; } else form.elements.password.value = ''; });
}

function renderStudentsApp() {
  let students = []; let editId = null;
  playerApp.innerHTML = '<p class="app-intro">Manage a few sample student records. They’re kept only while this page stays open.</p><form class="app-form student-form" id="student-form"><label>Student ID<input name="id" required></label><label>Full name<input name="name" required></label><label>Course<input name="course" required></label><label>Year<select name="year"><option>1</option><option>2</option><option>3</option><option>4</option></select></label><label>GPA<input name="gpa" type="number" min="0" max="5" step=".01" required></label><label>Highest grade<input name="high" type="number" min="0" max="100" step="any"></label><label>Lowest grade<input name="low" type="number" min="0" max="100" step="any"></label><button class="span-all" id="student-submit">Add student</button></form><p class="app-feedback" id="student-feedback" aria-live="polite">Add your first student to get started.</p><div class="student-tools"><label>Search records<input id="student-search" placeholder="ID, name, or course"></label><label>Filter by course<input id="student-course" placeholder="Any course"></label><label>Year<select id="student-year"><option value="">Any year</option><option value="1">Year 1</option><option value="2">Year 2</option><option value="3">Year 3</option><option value="4">Year 4</option></select></label><label>Minimum GPA<input id="student-gpa" type="number" min="0" max="5" step=".1" placeholder="0"></label></div><div class="student-table-wrap"><table class="student-table"><thead><tr><th>ID</th><th>NAME</th><th>COURSE</th><th>YEAR</th><th>GPA</th><th>HIGH</th><th>LOW</th><th>ACTIONS</th></tr></thead><tbody id="student-rows"></tbody></table></div>';
  const form = playerApp.querySelector('#student-form'); const rows = playerApp.querySelector('#student-rows');
  function paintRows() {
    const term = playerApp.querySelector('#student-search').value.toLowerCase(); const course = playerApp.querySelector('#student-course').value.trim().toLowerCase(); const year = playerApp.querySelector('#student-year').value; const minimum = Number(playerApp.querySelector('#student-gpa').value || 0);
    const visible = students.filter(s => (!term || [s.id,s.name,s.course].some(v => v.toLowerCase().includes(term))) && (!course || s.course.toLowerCase().includes(course)) && (!year || String(s.year) === year) && Number(s.gpa) >= minimum);
    if (!visible.length) { rows.innerHTML = '<tr><td class="table-empty" colspan="8">' + (students.length ? 'No matching students.' : 'No student records yet.') + '</td></tr>'; return; }
    rows.innerHTML = visible.map(s => '<tr><td>' + escapePlayerText(s.id) + '</td><td>' + escapePlayerText(s.name) + '</td><td>' + escapePlayerText(s.course) + '</td><td>' + escapePlayerText(s.year) + '</td><td>' + escapePlayerText(s.gpa) + '</td><td>' + escapePlayerText(s.high || '—') + '</td><td>' + escapePlayerText(s.low || '—') + '</td><td><button class="table-action" data-action="edit" data-id="' + escapePlayerText(s.id) + '">Edit</button><button class="table-action" data-action="delete" data-id="' + escapePlayerText(s.id) + '">Delete</button></td></tr>').join('');
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(form)); const id = values.id.trim(); const name = values.name.trim(); const gpa = Number(values.gpa);
    if (!/^[A-Za-z\s.'-]+$/.test(name)) { playerApp.querySelector('#student-feedback').textContent = 'Use letters, spaces, apostrophes, dots, or hyphens for the name.'; return; }
    if (!Number.isFinite(gpa) || gpa < 0 || gpa > 5) { playerApp.querySelector('#student-feedback').textContent = 'Enter a GPA between 0 and 5.'; return; }
    if (students.some(s => s.id.toLowerCase() === id.toLowerCase() && s.id !== editId)) { playerApp.querySelector('#student-feedback').textContent = 'That student ID is already in the list.'; return; }
    const record = { id, name, course: values.course.trim(), year: values.year, gpa: gpa.toFixed(2), high: values.high, low: values.low };
    if (editId) { const index = students.findIndex(s => s.id === editId); students[index] = record; playerApp.querySelector('#student-feedback').textContent = 'Student record updated.'; } else { students.push(record); playerApp.querySelector('#student-feedback').textContent = 'Student added.'; }
    editId = null; form.reset(); playerApp.querySelector('#student-submit').textContent = 'Add student'; paintRows();
  });
  playerApp.querySelector('#student-search').addEventListener('input', paintRows); playerApp.querySelector('#student-course').addEventListener('input', paintRows); playerApp.querySelector('#student-year').addEventListener('change', paintRows); playerApp.querySelector('#student-gpa').addEventListener('input', paintRows);
  rows.addEventListener('click', event => {
    const action = event.target.closest('[data-action]'); if (!action) return; const record = students.find(s => s.id === action.dataset.id); if (!record) return;
    if (action.dataset.action === 'delete') { students = students.filter(s => s.id !== record.id); if (editId === record.id) { editId = null; form.reset(); playerApp.querySelector('#student-submit').textContent = 'Add student'; } playerApp.querySelector('#student-feedback').textContent = 'Student removed from this session.'; paintRows(); return; }
    editId = record.id; for (const key of ['id','name','course','year','gpa','high','low']) form.elements[key].value = record[key]; playerApp.querySelector('#student-submit').textContent = 'Save changes'; playerApp.querySelector('#student-feedback').textContent = 'Editing ' + record.name + '. Update the fields and save.'; form.elements.name.focus();
  });
  paintRows();
}


// Three small quiz games for the learning corner.
const meQuestions = [
  { prompt: 'What name is on this portfolio?', answers: ['jan vincent s. garcia', 'jan vincent garcia'] },
  { prompt: 'What kind of student is Jan?', answers: ['college student', 'a college student', 'student'] },
  { prompt: 'Which programming language appears in several of Jan’s practice projects?', answers: ['python'] },
  { prompt: 'Which fluffy animal runs the little guide button?', answers: ['sheep', 'a sheep', 'lamb', 'a lamb'] },
  { prompt: 'Which constellation appears during the star shower?', answers: ['aries', 'the ram'] }
];
const questionBanks = window.portfolioQuestionBank;
const gameTitle = { me: 'How well do you know me?', python: 'Code curiosity', japanese: 'Little word match' };
const gameNote = { me: 'Five quick questions using details already shown on this portfolio.', python: 'Choose a difficulty and question count. Questions are picked from a beginner Python bank.', japanese: 'Choose a difficulty and question count. Even the hardest round uses common beginner words.' };
document.querySelectorAll('.run-minigame').forEach(button => button.addEventListener('click', () => startMiniGame(button.dataset.minigame)));
function normalizeQuizAnswer(value) { return value.normalize('NFKC').trim().toLowerCase().replace(/[.,!?。！？]/g, '').replace(/\s+/g, ' '); }
function startMiniGame(game) {
  const baseQuestions = game === 'me' ? meQuestions : null;
  if (!baseQuestions && !questionBanks[game]) return;
  playerTitle.textContent = gameTitle[game]; playerNote.textContent = gameNote[game];
  if (game === 'me') { playQuizRound(game, baseQuestions, '', 5); playerDialog.showModal(); return; }
  function showSetup() {
    const question = game === 'python' ? 'Choose your level and round size. The Python bank has 300 prompts, 100 per level.' : 'Choose your level and round size. The Japanese bank has 300 beginner words, 100 per level.';
    playerApp.innerHTML = '<p class="app-intro">' + question + '</p><form class="app-form" id="game-setup"><label>Difficulty<select name="difficulty"><option value="easy">Easy · start here</option><option value="medium">Medium · a little challenge</option><option value="hard">Hard · challenge mode</option></select></label><label>Number of questions<select name="amount"><option value="5" selected>5 questions</option><option value="10">10 questions</option><option value="15">15 questions</option><option value="20">20 questions</option><option value="30" disabled hidden>30 questions · Hard mode</option></select></label><p class="setup-hint span-all" id="amount-hint">Choose 5, 10, 15, or 20 questions.</p><button class="span-all">Start game</button></form>';
    const setupForm = playerApp.querySelector('#game-setup');
    const difficultySelect = setupForm.elements.difficulty; const amountSelect = setupForm.elements.amount; const thirtyOption = amountSelect.querySelector('option[value="30"]'); const amountHint = playerApp.querySelector('#amount-hint');
    function updateAmountChoice() {
      const hardMode = difficultySelect.value === 'hard';
      thirtyOption.disabled = !hardMode; thirtyOption.hidden = !hardMode;
      amountSelect.disabled = hardMode;
      if (hardMode) { amountSelect.value = '30'; amountHint.textContent = 'Hard mode automatically gives you 30 questions.'; }
      else { if (amountSelect.value === '30') amountSelect.value = '5'; amountHint.textContent = 'Choose 5, 10, 15, or 20 questions.'; }
    }
    difficultySelect.addEventListener('change', updateAmountChoice); updateAmountChoice();
    setupForm.addEventListener('submit', event => {
      event.preventDefault(); const difficulty = difficultySelect.value; const amount = difficulty === 'hard' ? 30 : Number(amountSelect.value);
      const pool = questionBanks[game][difficulty].slice();
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      playQuizRound(game, pool.slice(0, amount), difficulty, amount);
    });
  }
  showSetup(); playerDialog.showModal();
}
function playQuizRound(game, questions, difficulty, amount) {
  let index = 0; let score = 0; let checked = false;
  function drawQuestion() {
    if (index >= questions.length) {
      playerApp.innerHTML = '<div class="trivia-final"><strong>' + score + ' / ' + questions.length + ' ✨</strong>' + (score === questions.length ? 'Perfect score! You’re a little star.' : 'Nice playing! Want another round?') + '</div><div class="app-actions"><button class="app-button trivia-next" id="play-again" type="button">Play again</button>' + (game === 'me' ? '' : '<button class="app-secondary" id="change-settings" type="button">Change settings</button>') + '</div>';
      playerApp.querySelector('#play-again').addEventListener('click', () => { if (game !== 'me') { const nextPool = questionBanks[game][difficulty].slice(); for (let i = nextPool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [nextPool[i], nextPool[j]] = [nextPool[j], nextPool[i]]; } questions = nextPool.slice(0, amount); } index = 0; score = 0; checked = false; drawQuestion(); });
      const settings = playerApp.querySelector('#change-settings'); if (settings) settings.addEventListener('click', () => { playerDialog.close(); startMiniGame(game); });
      return;
    }
    const item = questions[index]; const level = difficulty ? ' · ' + difficulty.toUpperCase() : '';
    playerApp.innerHTML = '<div class="trivia-progress">QUESTION ' + (index + 1) + ' OF ' + questions.length + level + ' · SCORE ' + score + '</div><p class="trivia-prompt">' + item.prompt + '</p><form class="guess-form trivia-answer" id="trivia-form"><label>Your answer<input name="answer" autocomplete="off" required ' + (checked ? 'disabled' : '') + '></label><button class="app-button" ' + (checked ? 'disabled' : '') + '>Check</button></form><p class="trivia-feedback" id="trivia-feedback" aria-live="polite">' + (checked ? 'Ready for the next one?' : 'Take your time—there’s no timer.') + '</p>' + (checked ? '<button class="app-button trivia-next" id="trivia-next" type="button">' + (index === questions.length - 1 ? 'See my score' : 'Next question →') + '</button>' : '');
    if (checked) { playerApp.querySelector('#trivia-next').addEventListener('click', () => { index++; checked = false; drawQuestion(); }); return; }
    playerApp.querySelector('#trivia-form').addEventListener('submit', event => {
      event.preventDefault(); const answer = normalizeQuizAnswer(event.currentTarget.elements.answer.value);
      const correct = item.answers.some(value => normalizeQuizAnswer(value) === answer);
      if (correct) score++; checked = true; drawQuestion();
      const feedback = playerApp.querySelector('#trivia-feedback');
      if (correct) { feedback.textContent = 'That’s right! Nice one 🌟'; feedback.classList.add('good'); }
      else { feedback.textContent = 'Not quite—one answer is “' + item.answers[0] + '”. Keep going!'; feedback.classList.add('retry'); }
    });
  }
  drawQuestion();
}


// Slide between code, digital drawings, and traditional art.
const portfolioTrack = document.querySelector('#category-track');
const portfolioTabs = Array.from(document.querySelectorAll('.category-tab'));
const portfolioPanels = Array.from(document.querySelectorAll('.category-panel'));
const portfolioPosition = document.querySelector('#portfolio-position');
let portfolioIndex = 0;
function selectPortfolioCategory(index, moveFocus = false) {
  portfolioIndex = (index + portfolioTabs.length) % portfolioTabs.length;
  portfolioTrack.style.transform = 'translateX(-' + (portfolioIndex * 100 / portfolioTabs.length) + '%)';
  portfolioTabs.forEach((tab, i) => {
    const active = i === portfolioIndex;
    tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    portfolioPanels[i].setAttribute('aria-hidden', String(!active)); portfolioPanels[i].inert = !active;
  });
  portfolioPosition.innerHTML = '<b>' + String(portfolioIndex + 1).padStart(2, '0') + '</b> <i>/ 03</i>';
  if (moveFocus) portfolioTabs[portfolioIndex].focus();
}
portfolioTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPortfolioCategory(index));
  tab.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); selectPortfolioCategory(portfolioIndex + 1, true); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); selectPortfolioCategory(portfolioIndex - 1, true); }
    if (event.key === 'Home') { event.preventDefault(); selectPortfolioCategory(0, true); }
    if (event.key === 'End') { event.preventDefault(); selectPortfolioCategory(portfolioTabs.length - 1, true); }
  });
});
document.querySelectorAll('[data-slide-step]').forEach(button => button.addEventListener('click', () => selectPortfolioCategory(portfolioIndex + Number(button.dataset.slideStep))));
selectPortfolioCategory(0);


// Let each art collection choose and remember its own featured piece.
document.querySelectorAll('[data-art-feature]').forEach(feature => {
  const kind = feature.dataset.artFeature;
  const select = feature.querySelector('.art-feature-select');
  const image = feature.querySelector('.art-feature-img');
  const link = feature.querySelector('.art-feature-link');
  const number = feature.querySelector('.art-feature-number');
  const pathFor = value => 'artwork/' + kind + '/' + (kind === 'digital' ? 'digital-art-' : 'traditional-art-') + String(value).padStart(2, '0') + '.jpg';
  try { const saved = localStorage.getItem('featured-art-' + kind); if (saved && select.querySelector('option[value="' + saved + '"]')) select.value = saved; } catch (_) {}
  const update = () => { const path = pathFor(select.value); image.src = path; image.alt = 'Featured ' + kind + ' drawing, piece ' + String(select.value).padStart(2, '0'); link.href = path; number.textContent = 'Piece ' + String(select.value).padStart(2, '0'); try { localStorage.setItem('featured-art-' + kind, select.value); } catch (_) {} };
  select.addEventListener('change', update);
  update();
});


// Switch between traditional drawings and the storyboard collection.
const tradTabs = Array.from(document.querySelectorAll('.trad-subtab'));
const tradPanels = Array.from(document.querySelectorAll('.trad-subpanel'));
tradTabs.forEach(tab => tab.addEventListener('click', () => {
  const target = tab.dataset.tradView;
  tradTabs.forEach(item => { const active = item === tab; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
  tradPanels.forEach(panel => { panel.hidden = panel.dataset.tradPanel !== target; });
}));


// Enlarge artwork in an accessible on-page viewer.
const artViewer = document.querySelector('#art-lightbox');
if (artViewer) {
  const artViewerImage = artViewer.querySelector('.art-lightbox-image');
  const artViewerCaption = artViewer.querySelector('.art-lightbox-caption');
  const artViewerVideo = artViewer.querySelector('.art-lightbox-video');
  const artViewerPrev = artViewer.querySelector('.art-lightbox-prev');
  const artViewerNext = artViewer.querySelector('.art-lightbox-next');
  const artViewerShowImage = () => { artViewerImage.hidden = false; artViewerVideo.hidden = true; artViewerVideo.pause(); artViewerVideo.removeAttribute('src'); artViewerPrev.hidden = false; artViewerNext.hidden = false; };
  const artImages = Array.from(document.querySelectorAll('.artwork-frame img, .art-feature-img, .storyboard-paper img')).map(img => ({src: img.getAttribute('src'), alt: img.alt || 'Artwork'})).filter((item, index, all) => all.findIndex(other => other.src === item.src) === index);
  let artViewerIndex = 0;
  const showArtAt = index => { artViewerIndex = (index + artImages.length) % artImages.length; const item = artImages[artViewerIndex]; artViewerImage.src = item.src; artViewerImage.alt = item.alt; artViewerCaption.textContent = item.alt + ' · ' + (artViewerIndex + 1) + ' / ' + artImages.length; };
  document.addEventListener('click', event => {
    const enlargeVideo = event.target.closest('.animation-expand');
    if (enlargeVideo) { event.preventDefault(); artViewerShowImage(); artViewerImage.hidden = true; artViewerVideo.hidden = false; artViewerVideo.src = 'artwork/digital/impact-frame-animation.mp4'; artViewerVideo.currentTime = 0; artViewerPrev.hidden = true; artViewerNext.hidden = true; artViewerCaption.textContent = 'Impact Frame Study · Inspired by “impact frame test - Flipaclip Animation” by polyolk.'; if (!artViewer.open) artViewer.showModal(); const playResult = artViewerVideo.play(); if (playResult && playResult.catch) playResult.catch(() => {}); return; }
    const img = event.target.closest('.artwork-frame img, .art-feature-img, .storyboard-paper img');
    const pageLink = event.target.closest('.storyboard-page-links a');
    if (!img && !pageLink) return;
    event.preventDefault();
    const src = img ? img.getAttribute('src') : pageLink.getAttribute('href');
    const index = artImages.findIndex(item => item.src === src);
    artViewerShowImage();
    showArtAt(index < 0 ? 0 : index);
    if (!artViewer.open) artViewer.showModal();
  });
  artViewer.querySelector('.art-lightbox-close').addEventListener('click', () => artViewer.close());
  artViewer.addEventListener('close', () => { artViewerVideo.pause(); artViewerVideo.removeAttribute('src'); artViewerVideo.load(); artViewerShowImage(); });
  artViewer.querySelector('.art-lightbox-prev').addEventListener('click', () => showArtAt(artViewerIndex - 1));
  artViewer.querySelector('.art-lightbox-next').addEventListener('click', () => showArtAt(artViewerIndex + 1));
  artViewer.addEventListener('click', event => { if (event.target === artViewer) artViewer.close(); });
  document.addEventListener('keydown', event => { if (!artViewer.open) return; if (event.key === 'ArrowLeft') showArtAt(artViewerIndex - 1); if (event.key === 'ArrowRight') showArtAt(artViewerIndex + 1); });
}
