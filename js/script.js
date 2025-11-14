document.addEventListener('DOMContentLoaded', () => {
  // ---------- Config ----------
  const ENV = 'dev'; // 'dev' or 'prod'
  const BASE_URL = ENV === 'dev' ? 'http://localhost:5000/api/review' : 'https://your-production-domain.com/api/review';

  // ---------- Grab DOM elements ----------
  const tableBody = document.querySelector("#reviewsTable tbody");
  const listingFilter = document.getElementById("listingFilter");
  const typeFilter = document.getElementById("typeFilter"); // matches HTML
  const channelFilter = document.getElementById("channelFilter");
  const dateFilter = document.getElementById("dateFilter");
  const ratingFilter = document.getElementById("ratingFilter");
  const ratingValue = document.getElementById("ratingValue");
  const ctx = document.getElementById('performanceChart').getContext('2d');

  let reviews = [];
  let chartInstance = null;

  // ---------- Fetch all reviews ----------
  async function fetchReviews() {
    try {
      const res = await fetch(`${BASE_URL}/hostaway`);
      const data = await res.json();
      reviews = data.result;
      populateFilters();
      renderTable(reviews);
      renderChart(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  // ---------- Populate filters ----------
  function populateFilters() {
    const listings = [...new Set(reviews.map(r => r.listingName))];
    listingFilter.innerHTML = '<option value="">All Listings</option>' +
      listings.map(l => `<option value="${l}">${l}</option>`).join('');

    const types = [...new Set(reviews.map(r => r.type))]; // type filter
    typeFilter.innerHTML = '<option value="">All Types</option>' +
      types.map(t => `<option value="${t}">${t}</option>`).join('');

    const channels = [...new Set(reviews.map(r => r.channel))];
    channelFilter.innerHTML = '<option value="">All Channels</option>' +
      channels.map(ch => `<option value="${ch}">${ch}</option>`).join('');
  }

  // ---------- Render Table ----------
  function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach(r => {
      const catRatings = r.reviewCategory.map(c => `${c.category}: ${c.rating}`).join(', ');
      tableBody.innerHTML += `
        <tr>
          <td>${r.id}</td>
          <td>${r.listingName}</td>
          <td>${r.guestName}</td>
          <td>${r.rating}</td>
          <td>${catRatings}</td>
          <td>${r.publicReview}</td>
          <td>${r.submittedAt}</td>
          <td>${r.status === 'approved' ? 'Yes' : 'No'}</td>
          <td>
            <button class="btn approve" onclick="approve(${r.id})">Approve</button>
            <button class="btn reject" onclick="reject(${r.id})">Reject</button>
          </td>
        </tr>
      `;
    });
  }

  // ---------- Approve / Reject ----------
 async function approve(id) {
  try {
    const res = await fetch(`${BASE_URL}/approve/${id}`, { method: 'POST' }); // store response
    const approvedReview = await res.json(); // parse JSON
    reviews = reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r);
    applyFilters(); 
  } catch (err) {
    console.error(err);
  }
}

 async function reject(id) {
  const reason = prompt("Enter reason for rejection:");
  if (!reason) return; // optional: don't reject if no reason entered

  try {
    const res = await fetch(`${BASE_URL}/reject/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });

    const data = await res.json();

    if (res.ok) {
      // Update local review with the server response
      reviews = reviews.map(r => r.id === id ? { ...r, ...data.result } : r);
      applyFilters();
    } else {
      console.error("Failed to reject review:", data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

  function formatDateForFilter(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ---------- Filters ----------
  async function applyFilters() {
    let filtered = [...reviews];

    if (listingFilter.value) filtered = filtered.filter(r => r.listingName === listingFilter.value);
    if (typeFilter.value) filtered = filtered.filter(r => r.type === typeFilter.value);
    if (channelFilter.value) filtered = filtered.filter(r => r.channel  === channelFilter.value);
    if (dateFilter.value) filtered = filtered.filter(r => formatDateForFilter(r.submittedAt) === dateFilter.value);
    
    const ratingVal = parseInt(ratingFilter.value);
    if (ratingVal) filtered = filtered.filter(r => r.rating >= ratingVal);

    renderTable(filtered);
    renderChart(filtered);
  }

  // ---------- Event Listeners ----------
  listingFilter.addEventListener('change', applyFilters);
  typeFilter.addEventListener('change', applyFilters);
  channelFilter.addEventListener('change', applyFilters);
  dateFilter.addEventListener('change', applyFilters);
  ratingFilter.addEventListener('input', () => {
    ratingValue.textContent = `${ratingFilter.value}+`;
    applyFilters();
  });

  // ---------- Render Chart ----------
  function renderChart(data) {
    const propertyNames = [...new Set(data.map(r => r.listingName))];
    const avgRatings = propertyNames.map(name => {
      const props = data.filter(r => r.listingName === name);
      return (props.reduce((sum, r) => sum + r.rating, 0) / props.length).toFixed(2);
    });

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: propertyNames,
        datasets: [{
          label: 'Average Rating',
          data: avgRatings,
          backgroundColor: '#27ae60'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 10 } }
      }
    });
  }

  // ---------- Initialize ----------
  fetchReviews();

  // Make approve/reject globally accessible
  window.approve = approve;
  window.reject = reject;
});
