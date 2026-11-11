'use strict';

const from = new URLSearchParams(location.search).get('from');
if (from !== null) {
  const back = document.getElementById('all-artists');
  const directory = new URL(back.href);
  const filters = new URLSearchParams(from);
  for (const key of ['query', 'genre', 'day', 'sort', 'page']) {
    if (filters.has(key)) directory.searchParams.set(key, filters.get(key));
  }
  directory.hash = 'artist-row-' + back.dataset.artistSlug;
  back.href = directory.href;
}
