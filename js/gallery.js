document.querySelectorAll('[data-collection]').forEach(container => {
  const items = ARTWORKS[container.dataset.collection];
  if (!items) return;

  container.innerHTML = items.map(item => {
    const sold = item.status === 'sold';
    const priceLine = item.price ? `<p class="price">${item.price}</p>` : '';
    const enquireLink = `contact?piece=${encodeURIComponent(item.title)}`;
    const imageLink = item.seriesLink || (sold ? null : enquireLink);

    const media = imageLink
      ? `<a class="media-link" href="${imageLink}"><img src="${item.images[0]}" alt="${item.title}" loading="lazy" decoding="async"></a>`
      : `<img src="${item.images[0]}" alt="${item.title}" loading="lazy" decoding="async">`;

    const enquire = sold ? '' : `<a href="${enquireLink}">Enquire about this piece</a>`;

    return `
      <div class="gallery-item reveal${sold ? ' sold' : ''}" data-images="${item.images.join(',')}">
        ${media}
        <span class="status status--${sold ? 'sold' : 'available'}">${sold ? 'Sold' : 'Available'}</span>
        <h3>${item.title}</h3>
        ${priceLine}
        <p>${item.details}</p>
        ${enquire}
      </div>
    `;
  }).join('');
});