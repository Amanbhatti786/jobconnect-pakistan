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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Current User State
let currentUser = null;
let currentUserProfile = null;
let allJobs = [];

// Safe DOM Selectors Helper
const get = (id) => document.getElementById(id);

// DOM Elements
const authActions = get("authActions");
const userMenu = get("userMenu");
const profileMenuBtn = get("profileMenuBtn");
const profileDropdown = get("profileDropdown");
const userDisplayName = get("userDisplayName");
const menuFullName = get("menuFullName");
const menuEmail = get("menuEmail");
const userRoleBadge = get("userRoleBadge");

const menuEmployerItem = get("menuEmployerItem");
const menuSeekerItem = get("menuSeekerItem");
const menuProfileBtn = get("menuProfileBtn");
const menuPostJobBtn = get("menuPostJobBtn");
const menuApplicationsBtn = get("menuApplicationsBtn");
const menuChangePassBtn = get("menuChangePassBtn");
const logoutBtn = get("logoutBtn");

const employerTabBtn = get("employerTabBtn");
const seekerTabBtn = get("seekerTabBtn");

const authModal = get("authModal");
const openLoginBtn = get("openLoginBtn");
const openSignupBtn = get("openSignupBtn");
const closeAuthModal = get("closeAuthModal");

const profileModal = get("profileModal");
const closeProfileModal = get("closeProfileModal");
const profileForm = get("profileForm");

const loginFormContainer = get("loginFormContainer");
const signupFormContainer = get("signupFormContainer");
const showSignup = get("showSignup");
const showLogin = get("showLogin");

const loginForm = get("loginForm");
const signupForm = get("signupForm");
const postJobForm = get("postJobForm");
const searchForm = get("searchForm");

const jobsList = get("jobsList");
const jobsCountBadge = get("jobsCountBadge");
const applyModal = get("applyModal");
const applyModalBody = get("applyModalBody");
const closeApplyModal = get("closeApplyModal");

// Dropdown Toggle
if (profileMenuBtn && profileDropdown) {
  profileMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
  });
}

// Window clicks for Modals & Dropdown
window.addEventListener("click", (e) => {
  if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== profileMenuBtn) {
    profileDropdown.classList.remove("show");
  }
  if (authModal && e.target === authModal) authModal.style.display = "none";
  if (profileModal && e.target === profileModal) profileModal.style.display = "none";
  if (applyModal && e.target === applyModal) applyModal.style.display = "none";
});

// Profile Modal Open
if (menuProfileBtn && profileModal) {
  menuProfileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (profileDropdown) profileDropdown.classList.remove("show");

    if (!currentUser) {
      alert("Please login first.");
      return;
    }

    profileModal.style.display = "flex";

    if (get("profEmail")) get("profEmail").value = currentUser.email || "";
    if (get("profName")) get("profName").value = currentUserProfile?.name || "";
    if (get("profPhone")) get("profPhone").value = currentUserProfile?.phone || "";
    if (get("profLocation")) get("profLocation").value = currentUserProfile?.location || "";
    if (get("profBio")) get("profBio").value = currentUserProfile?.bio || "";
    if (get("profDegree")) get("profDegree").value = currentUserProfile?.degree || "";
    if (get("profInstitute")) get("profInstitute").value = currentUserProfile?.institute || "";
    if (get("profGradYear")) get("profGradYear").value = currentUserProfile?.gradYear || "";
    if (get("profGrade")) get("profGrade").value = currentUserProfile?.grade || "";
    if (get("profTotalExp")) get("profTotalExp").value = currentUserProfile?.totalExp || "";
    if (get("profLastRole")) get("profLastRole").value = currentUserProfile?.lastRole || "";
    if (get("profLastCompany")) get("profLastCompany").value = currentUserProfile?.lastCompany || "";
    if (get("profSkills")) get("profSkills").value = currentUserProfile?.skills || "";
    if (get("profCerts")) get("profCerts").value = currentUserProfile?.certs || "";
    if (get("profCvLink")) get("profCvLink").value = currentUserProfile?.cvLink || "";
  });
}

if (closeProfileModal && profileModal) {
  closeProfileModal.addEventListener("click", () => {
    profileModal.style.display = "none";
  });
}

// Save Profile
if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedData = {
      name: get("profName") ? get("profName").value.trim() : "",
      phone: get("profPhone") ? get("profPhone").value.trim() : "",
      location: get("profLocation") ? get("profLocation").value.trim() : "",
      bio: get("profBio") ? get("profBio").value.trim() : "",
      degree: get("profDegree") ? get("profDegree").value.trim() : "",
      institute: get("profInstitute") ? get("profInstitute").value.trim() : "",
      gradYear: get("profGradYear") ? get("profGradYear").value.trim() : "",
      grade: get("profGrade") ? get("profGrade").value.trim() : "",
      totalExp: get("profTotalExp") ? get("profTotalExp").value.trim() : "",
      lastRole: get("profLastRole") ? get("profLastRole").value.trim() : "",
      lastCompany: get("profLastCompany") ? get("profLastCompany").value.trim() : "",
      skills: get("profSkills") ? get("profSkills").value.trim() : "",
      certs: get("profCerts") ? get("profCerts").value.trim() : "",
      cvLink: get("profCvLink") ? get("profCvLink").value.trim() : "",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection("users").doc(currentUser.uid).update(updatedData);
      currentUserProfile = { ...currentUserProfile, ...updatedData };
      if (userDisplayName) userDisplayName.textContent = updatedData.name;
      if (menuFullName) menuFullName.textContent = updatedData.name;
      alert("Profile details saved successfully!");
      if (profileModal) profileModal.style.display = "none";
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  });
}

// Reset Password
if (menuChangePassBtn) {
  menuChangePassBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (profileDropdown) profileDropdown.classList.remove("show");
    if (!currentUser?.email) return;
    if (confirm(`Send password reset email to ${currentUser.email}?`)) {
      try {
        await auth.sendPasswordResetEmail(currentUser.email);
        alert("Password reset email sent! Check your inbox.");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  });
}

// Nav links in dropdown
if (menuPostJobBtn) {
  menuPostJobBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (profileDropdown) profileDropdown.classList.remove("show");
    switchTab("employerTab");
  });
}

if (menuApplicationsBtn) {
  menuApplicationsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (profileDropdown) profileDropdown.classList.remove("show");
    switchTab("seekerTab");
  });
}

// Open / Close Auth Modals
if (openLoginBtn && authModal) {
  openLoginBtn.addEventListener("click", () => {
    if (loginFormContainer) loginFormContainer.style.display = "block";
    if (signupFormContainer) signupFormContainer.style.display = "none";
    authModal.style.display = "flex";
  });
}

if (openSignupBtn && authModal) {
  openSignupBtn.addEventListener("click", () => {
    if (loginFormContainer) loginFormContainer.style.display = "none";
    if (signupFormContainer) signupFormContainer.style.display = "block";
    authModal.style.display = "flex";
  });
}

if (closeAuthModal && authModal) {
  closeAuthModal.addEventListener("click", () => {
    authModal.style.display = "none";
  });
}

if (showSignup) {
  showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    if (loginFormContainer) loginFormContainer.style.display = "none";
    if (signupFormContainer) signupFormContainer.style.display = "block";
  });
}

if (showLogin) {
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    if (signupFormContainer) signupFormContainer.style.display = "none";
    if (loginFormContainer) loginFormContainer.style.display = "block";
  });
}

if (closeApplyModal && applyModal) {
  closeApplyModal.addEventListener("click", () => {
    applyModal.style.display = "none";
  });
}

// User Registration
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = get("signupName").value.trim();
    const role = get("signupRole").value;
    const email = get("signupEmail").value.trim();
    const password = get("signupPassword").value;

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection("users").doc(cred.user.uid).set({
        name: name,
        role: role,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert("Account created successfully!");
      if (authModal) authModal.style.display = "none";
      signupForm.reset();
    } catch (error) {
      alert("Signup Error: " + error.message);
    }
  });
}

// User Login
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = get("loginEmail").value.trim();
    const password = get("loginPassword").value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert("Logged in successfully!");
      if (authModal) authModal.style.display = "none";
      loginForm.reset();
    } catch (error) {
      alert("Login Error: " + error.message);
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (profileDropdown) profileDropdown.classList.remove("show");
    auth.signOut().then(() => {
      alert("Logged out successfully.");
      switchTab("jobsTab");
    });
  });
}

// Auth State Listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    try {
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (userDoc.exists) {
        currentUserProfile = userDoc.data();
        if (userDisplayName) userDisplayName.textContent = currentUserProfile.name;
        if (menuFullName) menuFullName.textContent = currentUserProfile.name;
        if (menuEmail) menuEmail.textContent = currentUser.email;

        if (userRoleBadge) {
          userRoleBadge.textContent = currentUserProfile.role === "employer" ? "Employer" : "Job Seeker";
          userRoleBadge.className = "badge " + currentUserProfile.role;
        }

        if (authActions) authActions.style.display = "none";
        if (userMenu) userMenu.style.display = "block";

        if (currentUserProfile.role === "employer") {
          if (employerTabBtn) employerTabBtn.style.display = "inline-flex";
          if (seekerTabBtn) seekerTabBtn.style.display = "none";
          if (menuEmployerItem) menuEmployerItem.style.display = "block";
          if (menuSeekerItem) menuSeekerItem.style.display = "none";
        } else {
          if (employerTabBtn) employerTabBtn.style.display = "none";
          if (seekerTabBtn) seekerTabBtn.style.display = "inline-flex";
          if (menuEmployerItem) menuEmployerItem.style.display = "none";
          if (menuSeekerItem) menuSeekerItem.style.display = "block";
          loadUserApplications();
        }
      }
    } catch (e) {
      console.error("Auth state profile fetch error:", e);
    }
  } else {
    currentUser = null;
    currentUserProfile = null;
    if (authActions) authActions.style.display = "flex";
    if (userMenu) userMenu.style.display = "none";
    if (employerTabBtn) employerTabBtn.style.display = "none";
    if (seekerTabBtn) seekerTabBtn.style.display = "none";
  }
});

// Tab Switcher
document.querySelectorAll(".tab-link").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    switchTab(target);
  });
});

function switchTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab-link").forEach((el) => el.classList.remove("active"));

  const targetTab = get(tabId);
  const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (targetTab) targetTab.classList.add("active");
  if (targetBtn) targetBtn.classList.add("active");
}

// Post Job Form
if (postJobForm) {
  postJobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser || currentUserProfile?.role !== "employer") {
      alert("Only registered employers can post jobs.");
      return;
    }

    const newJob = {
      title: get("jobTitle").value.trim(),
      company: get("jobCompany").value.trim(),
      country: get("jobCountry").value,
      city: get("jobCity").value.trim(),
      category: get("jobCategory").value,
      salary: get("jobSalary").value.trim() || "Negotiable",
      description: get("jobDesc").value.trim(),
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
}

// Fetch Jobs
function listenForJobs() {
  db.collection("jobs")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        allJobs = [];
        snapshot.forEach((doc) => {
          allJobs.push({ id: doc.id, ...doc.data() });
        });
        renderJobs(allJobs);
      },
      (error) => {
        console.error("Firestore read error:", error);
        if (jobsCountBadge) jobsCountBadge.textContent = "Error loading jobs";
      }
    );
}

// Render Jobs
function renderJobs(list) {
  if (jobsCountBadge) jobsCountBadge.textContent = `${list.length} Open Positions`;
  if (!jobsList) return;

  jobsList.innerHTML = "";
  if (list.length === 0) {
    jobsList.innerHTML = `<div class="empty-state">No jobs found matching your criteria.</div>`;
    return;
  }

  list.forEach((job) => {
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

// Open Apply Dialog
window.openApplyDialog = function (jobId) {
  const job = allJobs.find((j) => j.id === jobId);
  if (!job || !applyModalBody || !applyModal) return;

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
        <label>Phone Number</label>
        <input type="tel" id="applicantPhone" value="${currentUserProfile?.phone || ''}">
      </div>
      <div class="form-group">
        <label>Qualifications / Skills</label>
        <input type="text" id="applicantSkills" value="${currentUserProfile?.skills || currentUserProfile?.degree || ''}">
      </div>
      <div class="form-group">
        <label>CV / Portfolio Link</label>
        <input type="url" id="applicantLink" required value="${currentUserProfile?.cvLink || ''}" placeholder="https://drive.google.com/file/... or LinkedIn">
      </div>
      <button type="submit" class="btn btn-primary full-width">Submit Application</button>
    </form>
  `;

  applyModal.style.display = "flex";

  const appForm = get("applyJobForm");
  if (appForm) {
    appForm.addEventListener("submit", async (e) => {
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
        applicantName: get("applicantName").value.trim(),
        applicantEmail: get("applicantEmail").value.trim(),
        applicantPhone: get("applicantPhone").value.trim(),
        applicantSkills: get("applicantSkills").value.trim(),
        applicantLink: get("applicantLink").value.trim(),
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
  }
};

// Seeker Applications
async function loadUserApplications() {
  const container = get("applicationsList");
  if (!currentUser || !container) return;

  try {
    const snap = await db.collection("applications").where("applicantId", "==", currentUser.uid).get();
    if (snap.empty) {
      container.innerHTML = `<p class="empty-state">You have not applied for any jobs yet.</p>`;
      return;
    }

    let html = `<div class="applications-table-wrap"><table class="app-table">
      <thead><tr><th>Job Title</th><th>Company</th><th>CV / Portfolio</th><th>Status</th></tr></thead><tbody>`;

    snap.forEach((doc) => {
      const data = doc.data();
      html += `<tr>
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

// Search
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    applyFilters();
  });
}

document.querySelectorAll(".cat-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    document.querySe
