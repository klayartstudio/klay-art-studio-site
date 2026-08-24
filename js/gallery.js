document.querySelectorAll('[data-collection]').forEach(container => {
  const items = ARTWORKS[container.dataset.collection];
  if (!items) return;

  container.innerHTML = items.map(item => {
    const sold = item.status === 'sold';
    const priceLine = item.price ? `<p class="price">${item.price}</p>` : '';
    const link = `contact.html?piece=${encodeURIComponent(item.title)}`;

    const media = sold
      ? `<img src="${item.images[0]}" alt="${item.title}">`
      : `<a class="media-link" href="${link}"><img src="${item.images[0]}" alt="${item.title}"></a>`;

    const enquire = sold ? '' : `<a href="${link}">Enquire about this piece</a>`;

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