const jobs = [...document.querySelectorAll('.job-card')];
const filterButtons = [...document.querySelectorAll('.filter-chip')];
const keywordInput = document.getElementById('keywordInput');
const locationInput = document.getElementById('locationInput');
const emptyState = document.getElementById('emptyState');
let activeCategory = 'All';

function applyFilters() {
  const keyword = keywordInput.value.trim().toLowerCase();
  const location = locationInput.value.trim().toLowerCase();
  let visible = 0;
  jobs.forEach(job => {
    const title = (job.dataset.title + ' ' + job.innerText).toLowerCase();
    const jobLocation = job.dataset.location.toLowerCase();
    const categoryMatch = activeCategory === 'All' || job.dataset.category === activeCategory;
    const keywordMatch = !keyword || title.includes(keyword);
    const locationMatch = !location || jobLocation === location;
    const show = categoryMatch && keywordMatch && locationMatch;
    job.hidden = !show;
    if (show) visible++;
  });
  emptyState.hidden = visible !== 0;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle('selected', item === button));
    applyFilters();
    document.getElementById('jobs').scrollIntoView({behavior:'smooth'});
  });
});

document.querySelectorAll('.category-card').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.filter;
    const matching = filterButtons.find(item => item.dataset.filter === target);
    if (matching) matching.click();
  });
});

document.getElementById('searchForm').addEventListener('submit', event => {
  event.preventDefault();
  activeCategory = 'All';
  filterButtons.forEach(item => item.classList.toggle('selected', item.dataset.filter === 'All'));
  applyFilters();
  document.getElementById('jobs').scrollIntoView({behavior:'smooth'});
});

document.querySelectorAll('.popular-searches button').forEach(button => {
  button.addEventListener('click', () => {
    keywordInput.value = button.dataset.keyword;
    document.getElementById('searchForm').requestSubmit();
  });
});

document.getElementById('resetSearch').addEventListener('click', () => {
  keywordInput.value = '';
  locationInput.value = '';
  activeCategory = 'All';
  filterButtons.forEach(item => item.classList.toggle('selected', item.dataset.filter === 'All'));
  applyFilters();
});

const modal = document.getElementById('jobModal');
const modalTitle = document.getElementById('modalTitle');
const modalLocation = document.getElementById('modalLocation');
document.querySelectorAll('.apply-btn').forEach(button => {
  button.addEventListener('click', () => {
    const job = button.closest('.job-card');
    modalTitle.textContent = job.dataset.title;
    modalLocation.textContent = 'Sample listing • ' + job.dataset.location;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
});
function closeModal() { modal.hidden = true; document.body.style.overflow = ''; }
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOk').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('open');
});
document.querySelectorAll('#mainNav a').forEach(link => link.addEventListener('click', () => {
  document.getElementById('mainNav').classList.remove('open');
}));
document.getElementById('year').textContent = new Date().getFullYear();
