document.addEventListener('DOMContentLoaded', () => {
  const ENV = 'dev';
  const BASE_URL = ENV === 'dev' 
    ? 'http://localhost:5000/api/review' 
    : 'https://your-production-domain.com/api/review';

  const propertiesContainer = document.getElementById("propertiesContainer");
  if (!propertiesContainer) return;

  function pickRandomImages(images) {
    const fallbackImages = [
      "https://i2.au.reastatic.net/800x600/fb29881473ce05f2822f1e22069642bf7f1f72d2bb29297a97a4358ff8cb371d/main.jpg",
      "https://www.whatsoninnewcastleupontyne.com/wp-content/uploads/2017/05/properties2.jpg",
      "https://www.ecoprops.co.za/images/slide-1.jpg",
      "https://godslandempire.com/wp-content/uploads/2023/10/How-to-buy-a-property-in-Lagos-Nigeria.png"
    ];

    const source = images && images.length > 0 ? images : fallbackImages;
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }

  // ---------- Render a single property ----------
  function renderProperty(property, googleReviews = []) {
    const card = document.createElement("div");
    card.classList.add("property-card");

    const selectedImages = pickRandomImages(property.images || []);

    // Internal approved review
    const internalReviewHTML = property.publicReview
      ? `<li><strong>${property.guestName}:</strong> ${property.publicReview}</li>`
      : '<li>No approved reviews</li>';

    // Google reviews
    const googleReviewHTML = googleReviews.length > 0
      ? googleReviews.map(r => `<li><strong>${r.author_name}:</strong> ${r.text}</li>`).join('')
      : '<li>No Google reviews yet</li>';

    card.innerHTML = `
      <div class="images">
        ${selectedImages.map(img => `<img src="${img}" alt="Property Image">`).join('')}
      </div>
      <div class="info">
        <h2>${property.listingName}</h2>
        <p><strong>Type:</strong> ${property.type}</p>
        <p><strong>Rating:</strong> ${property.rating}/10</p>
        <p><strong>Channel:</strong> ${property.channel || 'Hostaway'}</p>
        <p><strong>Submitted:</strong> ${new Date(property.submittedAt).toLocaleDateString()}</p>
      </div>
      <ul class="reviews">
        ${internalReviewHTML}
      </ul>
      <ul class="google-reviews">
        <strong>Google Reviews:</strong>
        ${googleReviewHTML}
      </ul>
    `;

    propertiesContainer.appendChild(card);
  }

  // ---------- Fetch approved properties ----------
  async function fetchApprovedProperties() {
    try {
      const res = await fetch(`${BASE_URL}/approved`);
      if (!res.ok) throw new Error("Failed to fetch approved properties");

      const data = await res.json();
      let properties = data.result || [];
      properties = properties.filter(p => p.approved);

      if (properties.length === 0) {
        propertiesContainer.innerHTML = "<p>No approved properties yet.</p>";
        return;
      }

      // Render all approved properties first
      properties.forEach(prop => renderProperty(prop));

      // Then fetch Google reviews
      fetchGoogleReviews(properties);

    } catch (err) {
      console.error(err);
      propertiesContainer.innerHTML = "<p>Failed to load approved properties.</p>";
    }
  }

  // ---------- Fetch Google reviews ----------
  async function fetchGoogleReviews(properties) {
    try {
      const res = await fetch(`${BASE_URL}/google`);
      if (!res.ok) throw new Error("Failed to fetch Google reviews");

      const data = await res.json();
      const googleProperties = data.result || [];

      // Map Google reviews to their listingName
      googleProperties.forEach(googleProp => {
        // Find the card for the matching listingName
        const card = [...propertiesContainer.children].find(c =>
          c.querySelector('h2')?.textContent === googleProp.listingName
        );

        if (card) {
          // Append Google reviews below existing reviews
          const googleReviewsList = card.querySelector('.google-reviews');
          if (googleReviewsList) {
            googleReviewsList.innerHTML = googleProp.reviews && googleProp.reviews.length > 0
              ? googleProp.reviews.map(r => `<li><strong>${r.author_name}:</strong> ${r.text}</li>`).join('')
              : '<li>No Google reviews yet</li>';
          }
        }
      });

    } catch (err) {
      console.error(err);
    }
  }

  // ---------- Initialize ----------
  fetchApprovedProperties();
});
