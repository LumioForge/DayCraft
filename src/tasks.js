import {
  users as korisnici,
  saveUsers as spremiKorisnike,
  getCurrentUserEmail as dohvatiEmail
} from './storage.js';

function initTasks() {
  // —— Učitavanje zadataka i ciljeva —— 
  const email = dohvatiEmail();
  let zadaci = [], ciljevi = [];

  // učitaj zadatke
  if (email && korisnici[email]?.tasks) {
    zadaci = korisnici[email].tasks;
  } else {
    const t = localStorage.getItem('daycraftTasks');
    if (t) {
      try {
        zadaci = JSON.parse(t);
      } catch {}
    }
  }

  // učitaj ciljeve
  if (email && korisnici[email]?.goals) {
    ciljevi = korisnici[email].goals;
  } else {
    const g = localStorage.getItem('daycraftGoals');
    if (g) {
      try {
        ciljevi = JSON.parse(g);
      } catch {}
    }
  }

  // —— Spremanje u pohranu —— 
  function spZad() {
    if (email && korisnici[email]) {
      korisnici[email].tasks = zadaci;
      spremiKorisnike();
    } else {
      localStorage.setItem('daycraftTasks', JSON.stringify(zadaci));
    }
    // re-render kalendara
    renderCalendar(currentYear, currentMonth);
  }
  function spCil() {
    if (email && korisnici[email]) {
      korisnici[email].goals = ciljevi;
      spremiKorisnike();
    } else {
      localStorage.setItem('daycraftGoals', JSON.stringify(ciljevi));
    }
  }

  const danas = new Date();
  const danasStr = danas.toISOString().split('T')[0];

  // —— Kalendar —— 
  const calGrid = document.getElementById('calendarGrid');
  const calMonthLabel = document.getElementById('calendarMonth');
  let currentYear = danas.getFullYear();
  let currentMonth = danas.getMonth();

  function renderCalendar(y, m) {
    if (!calGrid || !calMonthLabel) return;
    const mjeseci = [
      'Siječanj','Veljača','Ožujak','Travanj',
      'Svibanj','Lipanj','Srpanj','Kolovoz',
      'Rujan','Listopad','Studeni','Prosinac'
    ];
    calMonthLabel.textContent = `${mjeseci[m]} ${y}`;
    calGrid.innerHTML = '';
    ['Pon','Uto','Sri','Čet','Pet','Sub','Ned'].forEach(d => {
      const hd = document.createElement('div');
      hd.className = 'font-medium';
      hd.textContent = d;
      calGrid.append(hd);
    });
    const firstDay = new Date(y, m, 1).getDay();
    const lead = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(y, m+1, 0).getDate();
    let day = 1;
    for (let i = 0; i < 42; i++) {
      const cell = document.createElement('div');
      cell.className = 'py-1 text-center text-sm';
      if (i >= lead && day <= daysInMonth) {
        const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        cell.textContent = day;
        cell.dataset.date = ds;
        if (zadaci.some(z => z.dueDate === ds)) {
          cell.classList.add('bg-primary','text-primary-content','rounded');
        }
        cell.addEventListener('click', () => {
          const inp = document.getElementById('taskDueDate');
          if (inp) inp.value = ds;
          document.getElementById('addTaskModal').checked = true;
        });
        day++;
      }
      calGrid.append(cell);
    }
  }
  document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar(currentYear, currentMonth);
  });
  document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar(currentYear, currentMonth);
  });
  renderCalendar(currentYear, currentMonth);

  // —— Popis zadataka —— 
  const cnt = document.getElementById('tasksContainer');
  const nasl = document.getElementById('sectionTitle');
  let curView = 'today';

  // ako smo na daily-planner.html (postoji #tasksContainer i #sectionTitle)
  if (cnt && nasl) {
    const prMsg = {
      today: 'Nema zadataka.',
      upcoming: 'Nema nadolazećih zadataka.',
      completed: 'Nema dovršenih zadataka.',
      categories: 'Nema nedovršenih zadataka.',
      goals: 'Nema ciljeva.'
    };

    function makeTaskRow(z) {
      const li = document.createElement('li');
      li.className = 'flex justify-between items-start';
      // lijevi dio
      const left = document.createElement('div');
      left.className = 'flex-1 flex items-start';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'checkbox checkbox-sm task-checkbox';
      cb.dataset.id = z.id;
      if (z.completed) cb.checked = true;
      left.append(cb);

      const txt = document.createElement('div');
      txt.className = 'ml-2';
      const h = document.createElement('div');
      h.textContent = z.title;
      h.className = 'font-medium';
      if (z.completed) h.classList.add('line-through','text-gray-500');
      txt.append(h);

      if (z.description) {
        const d = document.createElement('div');
        d.textContent = z.description;
        d.className = 'text-sm text-gray-600 mt-1';
        txt.append(d);
      }

      // metapodaci (prioritet, rok, kategorija)
      const md = [];
      if (z.priority) {
        let cls = 'badge-success';
        if (z.priority === 'Visok') cls = 'badge-error';
        if (z.priority === 'Srednji') cls = 'badge-warning';
        md.push(`<span class="badge badge-sm ${cls} mr-2">${z.priority}</span>`);
      }
      if (z.dueDate) {
        let fmt = z.dueDate;
        if (korisnici[email]?.dateFormat) {
          const df = korisnici[email].dateFormat;
          const [Y,M,D] = z.dueDate.split('-');
          fmt = df==='MDY' ? `${M}/${D}/${Y}` : `${D}/${M}/${Y}`;
        }
        const clsD = z.dueDate < danasStr ? 'text-red-500' : '';
        md.push(`<span class="mr-2 ${clsD}">Rok: ${fmt}</span>`);
      }
      if (z.category?.trim()) {
        md.push(`<span class="badge badge-sm mr-2">${z.category}</span>`);
      }
      if (md.length) {
        const mdiv = document.createElement('div');
        mdiv.className = 'text-xs text-gray-500 mt-1';
        mdiv.innerHTML = md.join('');
        txt.append(mdiv);
      }

      left.append(txt);
      li.append(left);

      // gumb za brisanje
      const del = document.createElement('button');
      del.className = 'btn btn-xs btn-error delete-btn';
      del.dataset.id = z.id;
      del.textContent = '✕';
      li.append(del);

      return li;
    }

    function renderList(view) {
      cnt.innerHTML = '';
      let list = [];
      if (view === 'today') {
        list = zadaci.filter(z => !z.completed);
      } else if (view === 'upcoming') {
        list = zadaci.filter(z => {
          if (z.completed || !z.dueDate) return false;
          const diff = (new Date(z.dueDate) - danas) / (1000*60*60*24);
          return diff >= 0 && diff <= 20;
        });
      } else if (view === 'completed') {
        list = zadaci.filter(z => z.completed);
      } else if (view === 'categories') {
        list = zadaci.filter(z => !z.completed);
      }
      if (!list.length) {
        cnt.innerHTML = `<p class="text-gray-500">${prMsg[view]}</p>`;
        return;
      }
      const ul = document.createElement('ul');
      ul.className = 'space-y-2';
      list.forEach(z => ul.append(makeTaskRow(z)));
      cnt.append(ul);

      // ažuriraj brojač
      const doneCount = zadaci.filter(z => z.completed).length;
      document.getElementById('completedCount').textContent = doneCount;
      document.getElementById('totalCount').textContent = list.length;
    }

    function switchView(v) {
      curView = v;
      const titles = {
        today: 'Zadaci',
        upcoming: 'Nadolazeće',
        completed: 'Dovršeno',
        categories: 'Kategorije',
        goals: 'Budući ciljevi'
      };
      nasl.textContent = titles[v];
      document.querySelectorAll('aside.menu a').forEach(a => a.classList.remove('active'));
      document.getElementById('nav' + v.charAt(0).toUpperCase() + v.slice(1))?.classList.add('active');
      if (v === 'goals') {
        renderGoals();
      } else {
        renderList(v);
        renderCategoryRadials();
      }
    }

    // navigacija kroz korisnički odabir prikaza
    document.querySelectorAll('aside.menu a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const id = link.id.replace('nav','').toLowerCase();
        switchView(id);
      });
    });

    // dodavanje novog zadatka
    document.getElementById('addTaskBtn')?.addEventListener('click', e => {
      e.preventDefault();
      const frm = document.getElementById('taskForm');
      const ttl = frm.elements['title'].value.trim();
      if (!ttl) return frm.elements['title'].reportValidity();
      const nw = {
        id: Date.now().toString(),
        title: ttl,
        description: frm.elements['description'].value.trim(),
        priority: frm.elements['priority'].value,
        dueDate: frm.elements['dueDate'].value || '',
        category: frm.elements['category'].value.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      zadaci.push(nw);
      spZad();
      switchView(curView);
      frm.reset();
      document.getElementById('addTaskModal').checked = false;
    });

    // označavanje dovršenosti i brisanje
    cnt.addEventListener('click', e => {
      const el = e.target;
      if (el.classList.contains('task-checkbox')) {
        const z = zadaci.find(x => x.id === el.dataset.id);
        z.completed = el.checked;
        z.completedAt = el.checked ? new Date().toISOString() : null;
        spZad();
        switchView(curView);
      }
      if (el.classList.contains('delete-btn')) {
        zadaci = zadaci.filter(x => x.id !== el.dataset.id);
        spZad();
        switchView(curView);
      }
    });

    // inicijalni prikaz
    switchView('today');
  }

  // —— Upravljanje ciljevima —— 
  const goalsContainer = document.getElementById('goalsContainer');
  const noGoalsMsg = document.getElementById('noGoalsMsg');
  let editingGoalId = null;

  function renderGoals() {
    goalsContainer.innerHTML = '';
    if (!ciljevi.length) {
      noGoalsMsg.classList.remove('hidden');
      return;
    }
    noGoalsMsg.classList.add('hidden');
    ciljevi.forEach(g => {
      const card = document.createElement('div');
      card.className = 'card bg-base-100 w-96 shadow-sm';
      card.innerHTML = `
        <figure>
          <img src="${g.imageUrl || 'https://via.placeholder.com/192x96'}" alt="${g.title}" />
        </figure>
        <div class="card-body">
          <h2 class="card-title">${g.title}</h2>
          <p>${g.description}</p>
          <div class="card-actions justify-end">
            <button class="btn btn-sm btn-outline edit-goal-btn" data-id="${g.id}">Edit</button>
            <button class="btn btn-sm btn-error delete-goal-btn" data-id="${g.id}">Delete</button>
          </div>
        </div>
      `;
      goalsContainer.append(card);
    });
  }

  // otvoriti modal za ciljeve
  document.getElementById('addGoalBtn')?.addEventListener('click', () => {
    editingGoalId = null;
    document.getElementById('goalModalTitle').textContent = 'Dodaj novi cilj';
    document.getElementById('goalForm').reset();
    document.getElementById('addGoalModal').checked = true;
  });

  // spremanje cilja
  document.getElementById('saveGoalBtn')?.addEventListener('click', e => {
    e.preventDefault();
    const frm = document.getElementById('goalForm');
    const title = frm.elements['title'].value.trim();
    if (!title) return frm.elements['title'].reportValidity();
    const description = frm.elements['description'].value.trim();
    const imageUrl = frm.elements['imageUrl'].value.trim();
    if (editingGoalId) {
      const g = ciljevi.find(x => x.id === editingGoalId);
      g.title = title;
      g.description = description;
      g.imageUrl = imageUrl;
    } else {
      ciljevi.push({
        id: Date.now().toString(),
        title,
        description,
        imageUrl
      });
    }
    spCil();
    renderGoals();
    document.getElementById('addGoalModal').checked = false;
  });

  goalsContainer.addEventListener('click', e => {
    const btn = e.target;
    if (btn.classList.contains('delete-goal-btn')) {
      const id = btn.dataset.id;
      ciljevi = ciljevi.filter(x => x.id !== id);
      spCil();
      renderGoals();
    }
    if (btn.classList.contains('edit-goal-btn')) {
      const id = btn.dataset.id;
      const g = ciljevi.find(x => x.id === id);
      editingGoalId = id;
      document.getElementById('goalModalTitle').textContent = 'Uredi cilj';
      document.getElementById('goalTitle').value = g.title;
      document.getElementById('goalDescription').value = g.description;
      document.getElementById('goalImageUrl').value = g.imageUrl;
      document.getElementById('addGoalModal').checked = true;
    }
  });

  // —— Napredak po kategorijama —— 
  function renderCategoryRadials() {
    const div = document.getElementById('categoryRadials');
    if (!div) return;
    div.innerHTML = '';
    const mp = {}

  // funkcija za ispis nedavnih aktivnosti
  function renderActivity() {
    const ulA = document.getElementById('activityList');
    const noA = document.getElementById('noActivityMsg');
    if (!ulA) return;
    ulA.innerHTML = '';
    // prikaži posljednjih 5 aktivnosti
    const arr = zadaci
      .map(z => {
        if (z.completed && z.completedAt) {
          return { text: `Zadatak “${z.title}” dovršen`, date: z.completedAt };
        } else if (z.createdAt) {
          return { text: `Dodano: “${z.title}”`, date: z.createdAt };
        }
        return null;
      })
      .filter(x => x)
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0,5);
    if (!arr.length) {
      noA.classList.remove('hidden');
      return;
    }
    noA.classList.add('hidden');
    arr.forEach(a => {
      const li = document.createElement('li');
      li.textContent = a.text;
      ulA.append(li);
    });
  }

;
    zadaci.forEach(z => {
      const key = z.category?.trim() || 'Nekategorizirano';
      mp[key] = mp[key] || { total: 0, done: 0 };
      mp[key].total++;
      if (z.completed) mp[key].done++;
    });
    Object.keys(mp).sort().forEach(cat => {
      const d = mp[cat];
      const wr = document.createElement('div');
      wr.className = 'flex flex-col items-center';
      const pr = document.createElement('progress');
      pr.className = 'progress progress-info';
      pr.max = d.total; pr.value = d.done;
      const lbl = document.createElement('span');
      lbl.className = 'mt-2 text-sm';
      lbl.textContent = `${cat}: ${d.done}/${d.total}`;
      wr.append(pr, lbl);
      div.append(wr);
    });
  }

  

    // nadolazeći zadaci
    const ulU = document.getElementById('upcomingList');
    const noU = document.getElementById('noUpcomingMsg');
    ulU.innerHTML = '';
    const up = zadaci.filter(z => !z.completed && z.dueDate && z.dueDate > danasStr)
      .sort((a, b) => a.dueDate > b.dueDate ? 1 : -1);
    if (!up.length) {
      noU.classList.remove('hidden');
    } else {
      noU.classList.add('hidden');
      up.slice(0,5).forEach(z => {
        const li = document.createElement('li');
        const dt = new Date(z.dueDate).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
        li.textContent = `${z.title} – rok ${dt}`;
        ulU.append(li);
      });
      if (up.length > 5) {
        const more = document.createElement('li');
        more.className = 'text-sm text-gray-600';
        more.textContent = `…još ${up.length-5} zadataka`;
        ulU.append(more);
      }
    }
    
    // prikaz zadataka po kategorijama
    renderCategoryRadials();
    // prikaz nedavnih aktivnosti
    if (typeof renderActivity === 'function') {
      renderActivity();
    }
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTasks);
} else {
  initTasks();
}
