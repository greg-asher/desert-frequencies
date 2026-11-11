'use strict';

const back = document.getElementById('all-artists');
const slug = back.dataset.artistSlug;
const from = new URLSearchParams(location.search).get('from');
const filters = new URLSearchParams(from ?? '');
let results = artistDirectory.results(Object.fromEntries(filters));
let index = results.findIndex(artist => artist.slug === slug);
if (index === -1) {
  for (const key of ['query', 'genre', 'day', 'sort']) filters.delete(key);
  results = artistDirectory.results({});
  index = results.findIndex(artist => artist.slug === slug);
}

function stateFor(position) {
  const state = new URLSearchParams();
  for (const key of ['query', 'genre', 'day', 'sort']) {
    if (filters.has(key)) state.set(key, filters.get(key));
  }
  const page = Math.floor(position / artistDirectory.pageSize) + 1;
  if (page > 1) state.set('page', page);
  return state;
}

if (from !== null && index !== -1) {
  const directory = new URL(back.href);
  directory.search = stateFor(index).toString();
  directory.hash = 'artist-row-' + slug;
  back.href = directory.href;
}

if (index !== -1) {
  for (const [id, position] of [['previous-artist', index - 1], ['next-artist', index + 1]]) {
    const artist = results[position];
    if (!artist) continue;
    const link = document.getElementById(id);
    link.href = '../../' + artistDirectory.artistPath(artist.slug, stateFor(position));
    link.title = artist.name;
    link.hidden = false;
  }
}
