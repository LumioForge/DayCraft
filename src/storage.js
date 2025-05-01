// storage.js - pohrana korisničkih podataka u LocalStorage
export let users = JSON.parse(localStorage.getItem('daycraftUsers') || '{}');

export function getCurrentUserEmail() {
  return localStorage.getItem('currentUser') || null;
}

export function setCurrentUserEmail(email) {
  if (email) localStorage.setItem('currentUser', email);
  else localStorage.removeItem('currentUser');
}

// spremi korisnika
export function saveUsers() {
  localStorage.setItem('daycraftUsers', JSON.stringify(users));
}
