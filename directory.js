'use strict';

const artists = JSON.parse(document.querySelector('#directory-data').textContent);
const $ = id => document.getElementById(id);
const slugByName = new Map(artists.map(artist => [artist.name, artist.slug]));
const url = new URL(location.href);
const filters = [$('query'), $('genre'), $('day'), $('sort')];
const compare = new Intl.Collator('en', { sensitivity: 'base', numeric: true }).compare;
const searchKey = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();
const pageSize = 18;
let page = Number(url.searchParams.get('page')) || 1;

function redirectLegacyLink() {
  const { hash } = location;
  if (hash === '#build' || hash === '#stories') {
    location.replace('news/index.html' + hash);
  } else if (hash.startsWith('#artist=')) {
    let name;
    try { name = decodeURIComponent(hash.slice(8)); } catch { return; }
    const slug = slugByName.get(name);
    if (slug) location.replace('artists/' + slug + '/index.html');
  }
}

function addCell(row, value, className) {
  const cell = row.insertCell();
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function render() {
  const [query, genre, day, sort] = filters.map(filter => filter.value);
  const term = searchKey(query.trim());
  const results = artists.filter(artist =>
    (!term || searchKey(artist.name + ' ' + artist.genre).includes(term)) &&
    (!genre || artist.genre === genre) &&
    (!day || artist.day === day)
  );
  if (sort !== 'poster') {
    const field = sort.startsWith('genre') ? 'genre' : 'name';
    const direction = sort.endsWith('-desc') ? -1 : 1;
    results.sort((a, b) => direction * compare(a[field], b[field]) || compare(a.name, b.name));
  }
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  page = Math.max(1, Math.min(Math.trunc(page), pages));
  $('matches').textContent = results.length + ' of ' + artists.length + ' artists';
  $('page').textContent = 'Page ' + page + ' of ' + pages;
  $('prev').disabled = page === 1;
  $('next').disabled = page === pages;

  const body = $('artists-body');
  body.replaceChildren();
  for (const artist of results.slice((page - 1) * pageSize, page * pageSize)) {
    const row = body.insertRow();
    const cell = row.insertCell();
    const link = document.createElement('a');
    link.href = 'artists/' + artist.slug + '/index.html';
    link.textContent = artist.name;
    const billing = document.createElement('span');
    billing.className = 'row-billing';
    billing.textContent = artist.day;
    cell.append(link, billing);
    addCell(row, artist.genre);
    addCell(row, artist.day, 'day');
    addCell(row, artist.count);
  }
  if (!results.length) {
    const cell = addCell(body.insertRow(), 'No artists match these filters.');
    cell.colSpan = 4;
  }
}

function saveDirectoryState() {
  const current = new URL(location.href);
  for (const filter of filters) {
    if (filter.value && !(filter.id === 'sort' && filter.value === 'name')) {
      current.searchParams.set(filter.id, filter.value);
    } else {
      current.searchParams.delete(filter.id);
    }
  }
  if (page > 1) current.searchParams.set('page', page);
  else current.searchParams.delete('page');
  if (current.protocol !== 'file:') history.replaceState(null, '', current);
}

for (const filter of filters) {
  const saved = url.searchParams.get(filter.id);
  if (saved !== null && (filter.tagName === 'INPUT' || Array.from(filter.options).some(option => option.value === saved))) {
    filter.value = saved;
  }
  filter.addEventListener(filter.tagName === 'INPUT' ? 'input' : 'change', () => {
    page = 1;
    render();
    saveDirectoryState();
  });
}

$('reset').addEventListener('click', () => {
  for (const filter of filters) filter.value = filter.id === 'sort' ? 'name' : '';
  page = 1;
  render();
  saveDirectoryState();
});

for (const [id, delta] of [['prev', -1], ['next', 1]]) {
  $(id).addEventListener('click', () => {
    page += delta;
    render();
    saveDirectoryState();
  });
}

window.addEventListener('hashchange', redirectLegacyLink);
redirectLegacyLink();
render();
