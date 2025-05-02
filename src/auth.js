import {
  users as korisnici,
  saveUsers as spremiKorisnike,
  getCurrentUserEmail as dohvatiTrenutnogKorisnikaEmail,
  setCurrentUserEmail as postaviTrenutnogKorisnikaEmail
} from './storage.js';

document.addEventListener('DOMContentLoaded', function() {
  // dohvatimo trenutno prijavljenog korisnika
  let trenutniKorisnikEmail =
    dohvatiTrenutnogKorisnikaEmail();
  const jeStranicaPrijave =
    window.location.href.includes('login.html');
  const jeStranicaRegistracije =
    window.location.href.includes('register.html');

  

  // primijeni korisnikove postavke teme i veličine fonta
  if (
    trenutniKorisnikEmail &&
    korisnici[trenutniKorisnikEmail]
  ) {
    const prefs =
      korisnici[trenutniKorisnikEmail];
    if (prefs.theme) {
      document.documentElement.setAttribute(
        'data-theme',
        prefs.theme
      );
    }
    if (prefs.fontSize === 'large') {
      document.documentElement.style.fontSize =
        '18px';
    } else {
      document.documentElement.style.fontSize =
        '';
    }
  }

  // prikaži inicijale korisnika u avataru
  const navAvatar = document.getElementById(
    'navAvatar'
  );
  if (
    navAvatar &&
    trenutniKorisnikEmail &&
    korisnici[trenutniKorisnikEmail]
  ) {
    const ime =
      korisnici[trenutniKorisnikEmail].name || '';
    if (ime.trim().length > 0) {
      const inicijali = ime
        .trim()
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      navAvatar.textContent = inicijali;
    }
  }

  // logika odjave
  ['logoutBtn', 'logoutLinkMobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function() {
        postaviTrenutnogKorisnikaEmail(null);
        window.location.href = 'login.html';
      });
    }
  });

  // registracija novog korisnika
  const obrazacRegistracije = document.getElementById(
    'registerForm'
  );
  if (obrazacRegistracije) {
    obrazacRegistracije.addEventListener(
      'submit',
      function(e) {
        e.preventDefault();
        const ime = document
          .getElementById('regName')
          .value.trim();
        const email = document
          .getElementById('regEmail')
          .value.trim()
          .toLowerCase();
        const lozinka = document
          .getElementById('regPassword')
          .value;
        if (!ime || !email || !lozinka) return;
        if (korisnici[email]) {
          alert(
            'Račun s tom e‑poštom već postoji. ' +
              'Prijavite se.'
          );
          return;
        }
        korisnici[email] = {
          name: ime,
          email,
          password: lozinka,
          theme: 'light',
          fontSize: 'medium',
          dateFormat: 'DMY',
          startOfWeek: 'Monday',
          tasks: [],
          habits: [],
          goals: [],
          tutorialShown: false
        };
        spremiKorisnike();
        document
          .getElementById('regSuccess')
          .classList.remove('hidden');
        obrazacRegistracije.reset();
      }
    );
  }

  // prijava korisnika
  const obrazacPrijave = document.getElementById(
    'loginForm'
  );
  if (obrazacPrijave) {
    obrazacPrijave.addEventListener(
      'submit',
      function(e) {
        e.preventDefault();
        const email = e.target.email.value
          .trim()
          .toLowerCase();
        const loz = e.target.password.value;
        const greskaEl = document.getElementById(
          'loginError'
        );
        if (greskaEl) greskaEl.classList.add('hidden');
        if (
          korisnici[email] &&
          korisnici[email].password === loz
        ) {
          postaviTrenutnogKorisnikaEmail(email);
          trenutniKorisnikEmail = email;
          window.location.href = 'index.html';
        } else {
          if (greskaEl)
            greskaEl.classList.remove('hidden');
          else
            alert('Neispravna e‑pošta ili lozinka');
        }
      }
    );
  }

  // upravljanje postavkama profila i aplikacije
  if (
    document.getElementById('profileSection')
  ) {
    const unosImeProfil = document.getElementById(
      'profileName'
    );
    const unosEmailProfil = document.getElementById(
      'profileEmail'
    );
    const gumbSpremiProfil = document.getElementById(
      'saveProfileBtn'
    );
    const odabirFormatDatuma = document.getElementById(
      'dateFormatSelect'
    );
    const odabirPrviDan = document.getElementById(
      'startOfWeekSelect'
    );
    const gumbSpremiAplikaciju = document.getElementById(
      'saveAppSettingsBtn'
    );
    const odabirTeme = document.getElementById(
      'themeSelect'
    );
    const odabirVelicineFonta = document.getElementById(
      'fontSizeSelect'
    );
    const gumbSpremiPersonal = document.getElementById(
      'savePersonalizationBtn'
    );

    const podaciKorisnika =
      korisnici[trenutniKorisnikEmail];
    unosImeProfil.value = podaciKorisnika.name;
    unosEmailProfil.value = podaciKorisnika.email;
    odabirFormatDatuma.value =
      podaciKorisnika.dateFormat || 'DMY';
    odabirPrviDan.value =
      podaciKorisnika.startOfWeek || 'Monday';
    odabirTeme.value =
      podaciKorisnika.theme || 'light';
    odabirVelicineFonta.value =
      podaciKorisnika.fontSize || 'medium';

    // prebacivanje tabova
    const tabLinkovi = {
      profile: document.getElementById('tabProfile'),
      app: document.getElementById('tabApp'),
      personalization: document.getElementById('tabPersonalization')
    };
    const sekcije = {
      profile: document.getElementById('profileSection'),
      app: document.getElementById('appSettingsSection'),
      personalization: document.getElementById('personalizationSection')
    };
    Object.keys(tabLinkovi).forEach(key => {
      const link = tabLinkovi[key];
      if (link) {
        link.addEventListener('click', function() {
          Object.values(tabLinkovi).forEach(l =>
            l.classList.remove('active')
          );
          link.classList.add('active');
          Object.values(sekcije).forEach(s =>
            s.classList.add('hidden')
          );
          sekcije[key].classList.remove('hidden');
        });
      }
    });

    // spremi profil
    gumbSpremiProfil.addEventListener('click', function() {
      const novoIme = unosImeProfil.value.trim();
      const noviEmail = unosEmailProfil.value
        .trim()
        .toLowerCase();
      if (!novoIme || !noviEmail) {
        alert('Ime ili e‑pošta ne smiju biti prazni.');
        return;
      }
      if (
        noviEmail !== trenutniKorisnikEmail &&
        korisnici[noviEmail]
      ) {
        alert('E‑pošta je već zauzeta.');
        return;
      }
      const stariEmail = trenutniKorisnikEmail;
      korisnici[stariEmail].name = novoIme;
      if (noviEmail !== stariEmail) {
        korisnici[noviEmail] = {
          ...korisnici[stariEmail],
          email: noviEmail
        };
        delete korisnici[stariEmail];
        trenutniKorisnikEmail = noviEmail;
        postaviTrenutnogKorisnikaEmail(noviEmail);
      }
      spremiKorisnike();
      alert('Profil je uspješno ažuriran!');
    });

    // spremi postavke aplikacije
    gumbSpremiAplikaciju.addEventListener('click', function() {
      korisnici[trenutniKorisnikEmail].dateFormat =
        odabirFormatDatuma.value;
      korisnici[trenutniKorisnikEmail].startOfWeek =
        odabirPrviDan.value;
      spremiKorisnike();
      alert('Postavke aplikacije spremljene!');
    });

    // spremi personalizaciju
    gumbSpremiPersonal.addEventListener('click', function() {
      korisnici[trenutniKorisnikEmail].theme =
        odabirTeme.value;
      korisnici[trenutniKorisnikEmail].fontSize =
        odabirVelicineFonta.value;
      spremiKorisnike();
      document.documentElement.setAttribute(
        'data-theme',
        odabirTeme.value
      );
      document.documentElement.style.fontSize =
        odabirVelicineFonta.value === 'large'
          ? '18px'
          : '';
      alert('Personalizacijske postavke ažurirane!');
    });

  // prekidač teme u navigaciji
  const prekidacTeme = document.querySelector('.theme-controller');
  if (prekidacTeme) {
    // postavi checkbox na temelju spremljene postavke
    if (trenutniKorisnikEmail && korisnici[trenutniKorisnikEmail].theme === 'dark') {
      prekidacTeme.checked = true;
    }
    prekidacTeme.addEventListener('change', function() {
      const novaTema = this.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', novaTema);
      if (trenutniKorisnikEmail && korisnici[trenutniKorisnikEmail]) {
        korisnici[trenutniKorisnikEmail].theme = novaTema;
        spremiKorisnike();
      }
    });
  }

  }
});
