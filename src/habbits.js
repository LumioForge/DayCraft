import {
  users as korisnici,
  saveUsers as spremiKorisnike,
  getCurrentUserEmail as dohvatiTrenutnogKorisnikaEmail
} from './storage.js';

document.addEventListener('DOMContentLoaded', function() {
  // dohvatimo korisnika koji je prijavljen
  const trenutniKorisnikEmail = dohvatiTrenutnogKorisnikaEmail();
  if (!trenutniKorisnikEmail) return;

  // spremi dijelove stranice za prikaz navika
  const listaNavikaDiv = document.getElementById('habitList');
  if (!listaNavikaDiv) return;

  // učitajmo postojeće navike ili krenimo s praznim popisom
  let navike = korisnici[trenutniKorisnikEmail].habits || [];

  // karta ikona u emoji
  const mapaEmoji = {
    fire:        '🔥',
    heart:       '❤️',
    'book-open': '📖',
    'check-circle': '✔️'
  };

  // spremanje navika u LocalStorage
  function zapisiPodatke() {
    korisnici[trenutniKorisnikEmail].habits = navike;
    spremiKorisnike();
  }

  // pripremimo varijable za grafikone
  let barChart, donutChart;

  // osvježi grafikone
  function azurirajGrafove() {
    const ctxBar   = document.getElementById('habitsBarChart').getContext('2d');
    const ctxDonut = document.getElementById('habitsDonutChart').getContext('2d');

    // oznake za zadnjih 7 dana
    const oznake = [];
    const danas   = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(danas.getDate() - i);
      oznake.push(
        d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      );
    }

    // broj dovršenih zadataka po danu
    const brojeviDnevni = new Array(7).fill(0);
    navike.forEach(function(n) {
      n.dates.forEach(function(ds) {
        const lbl = new Date(ds).toLocaleDateString(undefined,
          { month: 'short', day: 'numeric' });
        const idx = oznake.indexOf(lbl);
        if (idx >= 0) brojeviDnevni[idx]++;
      });
    });

    // ukupni nizovi po navici u posljednjih 7 dana
    const nazivi     = navike.map(n => n.name);
    const dovrseno   = navike.map(function(n) {
      return n.dates.filter(function(ds) {
        const d = new Date(ds);
        return (danas - d) / (1000*60*60*24) < 7;
      }).length;
    });

    // ukloni prethodne grafikone ako postoje
    if (barChart)   barChart.destroy();
    if (donutChart) donutChart.destroy();

    // stupčasti grafikon ukupnih ispunjenja
    barChart = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: oznake,
        datasets: [{ label: 'Dovršeno', data: brojeviDnevni }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });

    // kružni dijagram udjela navika
    donutChart = new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: nazivi,
        datasets: [{ data: dovrseno }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // izračun i prikaz niza (streak) za naviku
  function azurirajNiz(idx) {
    const span = document.getElementById('streak-' + idx);
    if (!span) return;

    const d = [...navike[idx].dates].sort();
    let niz = 0;
    const danas = new Date();
    for (let i = 0; ; i++) {
      const p = new Date();
      p.setDate(danas.getDate() - i);
      const ds = p.toISOString().split('T')[0];
      if (d.includes(ds)) niz++;
      else break;
    }
    span.textContent = '🔥 Niz: ' + niz + ' dan' + (niz === 1 ? '' : 'a');
  }

  // generiraj prikaz svih navika
  function prikaziNavike() {
    listaNavikaDiv.innerHTML = '';

    if (navike.length === 0) {
      listaNavikaDiv.innerHTML =
        '<p class="text-gray-500">Još nema navika. Kliknite “Dodaj naviku”.</p>';
      azurirajGrafove();
      return;
    }

    navike.forEach(function(h, idx) {
      // kartica za naviku
      const kartica = document.createElement('div');
      kartica.className = 'card bg-base-100 shadow mb-6 p-4';

      // redak s nazivom i nizom
      const red = document.createElement('div');
      red.className = 'flex items-center justify-between mb-2';

      // naslov s emoji
      const naslovSpan = document.createElement('span');
      naslovSpan.className = 'text-lg flex items-center';
      const em = mapaEmoji[h.icon] || '';
      if (em) {
        const sp = document.createElement('span');
        sp.textContent = em;
        sp.className = 'mr-2';
        naslovSpan.append(sp);
      }
      const strong = document.createElement('strong');
      strong.textContent = h.name;
      naslovSpan.append(strong);
      red.append(naslovSpan);

      // oznaka niza
      const nizSpan = document.createElement('span');
      nizSpan.id        = 'streak-' + idx;
      nizSpan.className = 'text-sm text-gray-600';
      red.append(nizSpan);

      kartica.append(red);

      // tablica kalendara
      const table = document.createElement('table');
      table.className = 'table-fixed w-full text-center text-sm mb-2';

      const thead = document.createElement('thead');
      const trD = document.createElement('tr');
      ['Pon','Uto','Sri','Čet','Pet','Sub','Ned'].forEach(function(dan) {
        const th = document.createElement('th');
        th.textContent = dan;
        th.className = 'font-medium';
        trD.append(th);
      });
      thead.append(trD);
      table.append(thead);

      const tbody = document.createElement('tbody');
      const sad = new Date();
      const y   = sad.getFullYear();
      const m   = sad.getMonth();
      const prvi = new Date(y, m, 1);
      let poc = prvi.getDay() === 0 ? 6 : prvi.getDay() - 1;
      const zadnjiDan = new Date(y, m+1, 0).getDate();

      let danBr = 1;
      while (danBr <= zadnjiDan) {
        const tr = document.createElement('tr');
        for (let wd = 0; wd < 7; wd++) {
          const td = document.createElement('td');
          td.className = 'py-1';
          if (danBr === 1 && wd < poc) {
            td.textContent = '';
          } else if (danBr > zadnjiDan) {
            td.textContent = '';
          } else {
            const ds = y + '-' +
              String(m+1).padStart(2,'0') + '-' +
              String(danBr).padStart(2,'0');
            td.textContent = danBr;
            td.dataset.date       = ds;
            td.dataset.habitIndex = idx;
            if (h.dates.includes(ds)) {
              td.classList.add(
                'bg-primary','text-primary-content','rounded'
              );
            }
          }
          tr.append(td);
          if (!(danBr === 1 && wd < poc) && danBr <= zadnjiDan) {
            danBr++;
          }
        }
        tbody.append(tr);
      }
      table.append(tbody);
      kartica.append(table);

      listaNavikaDiv.append(kartica);
      azurirajNiz(idx);
    });

    // postavi ponašanje kod klika na datume
    listaNavikaDiv.querySelectorAll('td[data-date]')
      .forEach(function(td) {
        td.addEventListener('click', function() {
          const idx = +td.dataset.habitIndex;
          const ds  = td.dataset.date;
          const arr = navike[idx].dates;
          const pos = arr.indexOf(ds);
          if (pos >= 0) {
            arr.splice(pos, 1);
            td.classList.remove(
              'bg-primary','text-primary-content','rounded'
            );
          } else {
            arr.push(ds);
            td.classList.add(
              'bg-primary','text-primary-content','rounded'
            );
          }
          zapisiPodatke();
          azurirajNiz(idx);
          azurirajGrafove();
        });
      });

    azurirajGrafove();
  }

  // izradi početni prikaz navika
  prikaziNavike();

  // postavi kontrole za modal za novu naviku
  document.getElementById('openAddHabitBtn')
    .addEventListener('click', function() {
      document.getElementById('habitModal').showModal();
    });
  document.getElementById('closeHabitModal')
    .addEventListener('click', function() {
      document.getElementById('habitModal').close();
    });

  // dodaj novu naviku u sustav
  document.getElementById('addHabitBtn')
    .addEventListener('click', function() {
      const inpNaziv = document.getElementById('habitName');
      const selIkona = document.getElementById('habitIcon');
      const nm = inpNaziv.value.trim();
      if (!nm) {
        inpNaziv.reportValidity();
        return;
      }
      navike.push({
        name:  nm,
        icon:  selIkona.value,
        dates: []
      });
      zapisiPodatke();
      document.getElementById('habitModal').close();
      inpNaziv.value = '';
      selIkona.value = 'fire';
      prikaziNavike();
    });
});
