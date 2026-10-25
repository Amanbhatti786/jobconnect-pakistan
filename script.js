// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYMzWCT9K3ZkephaCaLyiegAgo3Mwiz_4",
  authDomain: "jobconnect-pakistan.firebaseapp.com",
  projectId: "jobconnect-pakistan",
  storageBucket: "jobconnect-pakistan.firebasestorage.app",
  messagingSenderId: "939137633662",
  appId: "1:939137633662:web:a52f45ee3938b7e846f72f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Current User State
let currentUser = null;
let currentUserProfile = null;
let allJobs = [];

// DOM Elements
const authActions = document.getElementById("authActions");
const userMenu = document.getElementById("userMenu");
const userDisplayName = document.getElementById("userDisplayName");
const userRoleBadge = document.getElementById("userRoleBadge");
const logoutBtn = document.getElementById("logoutBtn");

const employerTabBtn = document.getElementById("employerTabBtn");
const seekerTabBtn = document.getElementById("seekerTabBtn");

const authModal = document.getElementById("authModal");
const openLoginBtn = document.getElementById("openLoginBtn");
const openSignupBtn = document.getElementById("openSignupBtn");
const closeAuthModal = document.getElementById("closeAuthModal");

const loginFormContainer = document.getElementById("loginFormContainer");
const signupFormContainer = document.getElementById("signupFormContainer");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const postJobForm = document.getElementById("postJobForm");
const searchForm = document.getElementById("searchForm");

const jobsList = document.getElementById("jobsList");
const jobsCountBadge = document.getElementById("jobsCountBadge");
const applyModal = document.getElementById("applyModal");
const applyModalBody = document.getElementById("applyModalBody");
const closeApplyModal = document.getElementById("closeApplyModal");

// Auth Modal Open/Close
openLoginBtn.addEventListener("click", () => {
  loginFormContainer.style.display = "block";
  signupFormContainer.style.display = "none";
  authModal.style.display = "flex";
});

openSignupBtn.addEventListener("click", () => {
  loginFormContainer.style.display = "none";
  signupFormContainer.style.display = "block";
  authModal.style.display = "flex";
});

closeAuthModal.addEventListener("click", () => {
  authModal.style.display = "none";
});

showSignup.addEventListener("click", (e) => {
  e.preventDefault();
  loginFormContainer.style.display = "none";
  signupFormContainer.style.display = "block";
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  signupFormContainer.style.display = "none";
  loginFormContainer.style.display = "block";
});

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.style.display = "none";
  if (e.target === applyModal) applyModal.style.display = "none";
});

if (closeApplyModal) {
  closeApplyModal.addEventListener("click", () => {
    applyModal.style.display = "none";
  });
}

// User Registration
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const role = document.getElementById("signupRole").value;
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("users").doc(cred.user.uid).set({
      name: name,
      role: role,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Account created successfully!");
    authModal.style.display = "none";
    signupForm.reset();
  } catch (error) {
    alert("Signup Error: " + error.message);
  }
});

// User Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("Logged in successfully!");
    authModal.style.display = "none";
    loginForm.reset();
  } catch (error) {
    alert("Login Error: " + error.message);
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    alert("Logged out successfully.");
    switchTab("jobsTab");
  });
});

// Listen to Auth State
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (userDoc.exists) {
      currentUserProfile = userDoc.data();
      userDisplayName.textContent = currentUserProfile.name;
      userRoleBadge.textContent = currentUserProfile.role === "employer" ? "Employer" : "Job Seeker";
      userRoleBadge.className = "badge " + currentUserProfile.role;

      authActions.style.display = "none";
      userMenu.style.display = "flex";

      if (currentUserProfile.role === "employer") {
        employerTabBtn.style.display = "inline-flex";
        seekerTabBtn.style.display = "none";
      } else {
        employerTabBtn.style.display = "none";
        seekerTabBtn.style.display = "inline-flex";
        loadUserApplications();
      }
    }
  } else {
    currentUser = null;
    currentUserProfile = null;
    authActions.style.display = "flex";
    userMenu.style.display = "none";
    employerTabBtn.style.display = "none";
    seekerTabBtn.style.display = "none";
  }
});

// Tab Switching
document.querySelectorAll(".tab-link").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    switchTab(target);
  });
});

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-link").forEach(el => el.classList.remove("active"));

  const targetTab = document.getElementById(tabId);
  const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (targetTab) targetTab.classList.add("active");
  if (targetBtn) targetBtn.classList.add("active");
}

// Post a Job (Employer)
postJobForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser || currentUserProfile?.role !== "employer") {
    alert("Only registered employers can post jobs.");
    return;
  }

  const newJob = {
    title: document.getElementById("jobTitle").value.trim(),
    company: document.getElementById("jobCompany").value.trim(),
    country: document.getElementById("jobCountry").value,
    city: document.getElementById("jobCity").value.trim(),
    category: document.getElementById("jobCategory").value,
    salary: document.getElementById("jobSalary").value.trim() || "Negotiable",
    description: document.getElementById("jobDesc").value.trim(),
    postedBy: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("jobs").add(newJob);
    alert("Job listing posted successfully!");
    postJobForm.reset();
    switchTab("jobsTab");
  } catch (error) {
    alert("Error posting job: " + error.message);
  }
});

// Fetch Real Jobs from Firestore
function listenForJobs() {
  db.collection("jobs").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    allJobs = [];
    snapshot.forEach(doc => {
      allJobs.push({ id: doc.id, ...doc.data() });
    });
    renderJobs(allJobs);
  }, error => {
    console.error("Firestore read error:", error);
    jobsCountBadge.textContent = "Error loading jobs";
  });
}

// Render Jobs
function renderJobs(list) {
  jobsCountBadge.textContent = `${list.length} Open Positions`;
  jobsList.innerHTML = "";

  if (list.length === 0) {
    jobsList.innerHTML = `<div class="empty-state">No jobs found matching your criteria.</div>`;
    return;
  }

  list.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.innerHTML = `
      <div class="job-card-header">
        <div>
          <h3>${escapeHtml(job.title)}</h3>
          <p class="company-name"><i class="fa fa-building"></i> ${escapeHtml(job.company)}</p>
        </div>
        <span class="location-badge"><i class="fa fa-map-marker-alt"></i> ${escapeHtml(job.city)}, ${escapeHtml(job.country)}</span>
      </div>
      <div class="job-card-tags">
        <span class="tag"><i class="fa fa-tag"></i> ${escapeHtml(job.category)}</span>
        <span class="tag"><i class="fa fa-money-bill-wave"></i> ${escapeHtml(job.salary)}</span>
      </div>
      <p class="job-desc-preview">${escapeHtml(job.description.substring(0, 130))}...</p>
      <button class="btn btn-primary btn-sm" onclick="openApplyDialog('${job.id}')">View Details & Apply</button>
    `;
    jobsList.appendChild(card);
  });
}

// Open Apply & Details Modal
window.openApplyDialog = function(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  applyModalBody.innerHTML = `
    <h2>${escapeHtml(job.title)}</h2>
    <p class="company-meta"><strong>${escapeHtml(job.company)}</strong> &bull; ${escapeHtml(job.city)}, ${escapeHtml(job.country)}</p>
    <div class="job-modal-tags">
      <span class="tag">${escapeHtml(job.category)}</span>
      <span class="tag">${escapeHtml(job.salary)}</span>
    </div>
    <hr>
    <h4>Job Description:</h4>
    <p class="full-desc">${escapeHtml(job.description).replace(/\n/g, "<br>")}</p>
    <hr>
    <form id="applyJobForm">
      <h4>Apply for this role</h4>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="applicantName" required value="${currentUserProfile?.name || ''}">
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" id="applicantEmail" required value="${currentUser?.email || ''}">
      </div>
      <div class="form-group">
        <label>LinkedIn or Portfolio / CV Link</label>
        <input type="url" id="applicantLink" required placeholder="https://linkedin.com/in/username or Google Drive CV link">
      </div>
      <button type="submit" class="btn btn-primary full-width">Submit Application</button>
    </form>
  `;

  applyModal.style.display = "flex";

  document.getElementById("applyJobForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login or create an account to apply.");
      return;
    }

    const application = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      applicantId: currentUser.uid,
      applicantName: document.getElementById("applicantName").value.trim(),
      applicantEmail: document.getElementById("applicantEmail").value.trim(),
      applicantLink: document.getElementById("applicantLink").value.trim(),
      appliedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection("applications").add(application);
      alert("Application submitted successfully!");
      applyModal.style.display = "none";
      if (currentUserProfile?.role === "seeker") loadUserApplications();
    } catch (err) {
      alert("Error submitting application: " + err.message);
    }
  });
};

// Seeker Applications
async function loadUserApplications() {
  const container = document.getElementById("applicationsList");
  if (!currentUser) return;

  try {
    const snap = await db.collection("applications")
      .where("applicantId", "==", currentUser.uid)
      .get();

    if (snap.empty) {
      container.innerHTML = `<p class="empty-state">You have not applied for any jobs yet.</p>`;
      return;
    }

    let html = `<div class="applications-table-wrap"><table class="app-table">
      <thead>
        <tr>
          <th>Job Title</th>
          <th>Company</th>
          <th>CV / Portfolio Link</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>`;

    snap.forEach(doc => {
      const data = doc.data();
      html += `
        <tr>
          <td><strong>${escapeHtml(data.jobTitle)}</strong></td>
          <td>${escapeHtml(data.company)}</td>
          <td><a href="${escapeHtml(data.applicantLink)}" target="_blank">View Link</a></td>
          <td><span class="badge info">Submitted</span></td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  } catch (error) {
    console.error("Error loading applications:", error);
  }
}

// Search & Filter
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  applyFilters();
});

document.querySelectorAll(".cat-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    applyFilters();
  });
});

function applyFilters() {
  const query = document.getElementById("keyword").value.toLowerCase().trim();
  const country = document.getElementById("countryFilter").value;
  const activeCat = document.querySelector(".cat-pill.active")?.getAttribute("data-cat") || "all";

  const filtered = allJobs.filter(job => {
    const matchesKeyword = !query || 
      job.title.toLowerCase().includes(query) || 
      job.company.toLowerCase().includes(query) || 
      job.description.toLowerCase().includes(query);

    const matchesCountry = country === "all" || 
      (country === "Remote" ? (job.country === "Remote" || job.city.toLowerCase().includes("remote")) : job.country === country);

    const matchesCat = activeCat === "all" || job.category === activeCat;

    return matchesKeyword && matchesCountry && matchesCat;
  });

  renderJobs(filtered);
}

// Security Helper to avoid XSS
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Start listener
listenForJobs();
          
