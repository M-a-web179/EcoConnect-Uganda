// Sample data for opportunities
const opportunities = [
  {
    id: 1,
    title: "MasterCard Foundation Scholarship",
    type: "scholarship",
    description: "Full scholarship for undergraduate studies at Makerere University",
    deadline: "2025-12-31",
    eligibility: "High school graduates with outstanding academic records"
  },
  {
    id: 2,
    type: "internship",
    title: "UNICEF Uganda Internship Program",
    description: "6-month internship program in various departments",
    deadline: "2025-11-30",
    eligibility: "Current university students or recent graduates"
  },
  {
    id: 3,
    type: "training",
    title: "Digital Skills Bootcamp",
    description: "Free 3-month intensive training in web development and digital marketing",
    deadline: "2025-12-15",
    eligibility: "Ages 18-25, basic computer knowledge required"
  },
  {
    id: 4,
    type: "scholarship",
    title: "Government Scholarship Scheme",
    description: "Partial scholarships for STEM students",
    deadline: "2025-11-20",
    eligibility: "Ugandan citizens pursuing science-related courses"
  }
];

// User state
let currentUser = null;
let applications = JSON.parse(localStorage.getItem('applications')) || [];

// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const authBtn = document.getElementById('authBtn');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const opportunitiesContainer = document.getElementById('opportunitiesContainer');
const filterBtns = document.querySelectorAll('.filter-btn');
const contactForm = document.getElementById('contactForm');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  loadOpportunities();
  setupEventListeners();
  updateStats();
});

// Event Listeners
function setupEventListeners() {
  // Auth button
  authBtn.addEventListener('click', showLoginModal);
  logoutBtn.addEventListener('click', logout);
  
  // Modal controls
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModals);
  });
  
  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', filterOpportunities);
  });
  
  // Form submissions
  contactForm.addEventListener('submit', handleContactSubmit);
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  
  // Modal switches
  document.getElementById('showRegister').addEventListener('click', showRegisterModal);
  
  // Get started button
  document.getElementById('getStartedBtn').addEventListener('click', showRegisterModal);
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === loginModal) closeModals();
    if (event.target === registerModal) closeModals();
  });
}

// Authentication Functions
function checkAuthStatus() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI();
  }
}

function updateAuthUI() {
  if (currentUser) {
    authBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    userName.textContent = currentUser.name;
  } else {
    authBtn.style.display = 'block';
    userMenu.style.display = 'none';
  }
}

function showLoginModal() {
  loginModal.style.display = 'block';
}

function showRegisterModal() {
  loginModal.style.display = 'none';
  registerModal.style.display = 'block';
}

function closeModals() {
  loginModal.style.display = 'none';
  registerModal.style.display = 'none';
}

function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  // Simple validation (in real app, this would call an API)
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateAuthUI();
    closeModals();
    showSuccess('Login successful!');
  } else {
    alert('Invalid credentials. Please try again.');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const user = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    education: formData.get('education'),
    id: Date.now()
  };
  
  // Save user (in real app, this would call an API)
  const users = JSON.parse(localStorage.getItem('users')) || [];
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  updateAuthUI();
  closeModals();
  showSuccess('Registration successful! Welcome to EcoConnect!');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI();
  showSuccess('Logged out successfully.');
}

// Opportunities Functions
function loadOpportunities(filter = 'all') {
  opportunitiesContainer.innerHTML = '';
  
  const filteredOps = filter === 'all' 
    ? opportunities 
    : opportunities.filter(op => op.type === filter);
  
  filteredOps.forEach(opportunity => {
    const opportunityElement = createOpportunityElement(opportunity);
    opportunitiesContainer.appendChild(opportunityElement);
  });
}

function createOpportunityElement(opportunity) {
  const div = document.createElement('div');
  div.className = 'opportunity-card';
  div.innerHTML = `
    <span class="opportunity-type">${opportunity.type.toUpperCase()}</span>
    <h3>${opportunity.title}</h3>
    <p>${opportunity.description}</p>
    <p><strong>Deadline:</strong> ${new Date(opportunity.deadline).toLocaleDateString()}</p>
    <p><strong>Eligibility:</strong> ${opportunity.eligibility}</p>
    ${currentUser ? `<button class="apply-btn" onclick="applyForOpportunity(${opportunity.id})">Apply Now</button>` : ''}
  `;
  return div;
}

function filterOpportunities(e) {
  const filter = e.target.dataset.filter;
  
  // Update active button
  filterBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  
  loadOpportunities(filter);
}

function applyForOpportunity(opportunityId) {
  if (!currentUser) {
    showLoginModal();
    return;
  }
  
  const application = {
    id: Date.now(),
    userId: currentUser.id,
    opportunityId: opportunityId,
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  applications.push(application);
  localStorage.setItem('applications', JSON.stringify(applications));
  showSuccess('Application submitted successfully!');
}

// Contact Form with Formspree
function handleContactSubmit(e) {
  e.preventDefault();
  
  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  fetch(e.target.action, {
    method: 'POST',
    body: new FormData(e.target),
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      showSuccess('Message sent successfully! We will get back to you soon.');
      e.target.reset();
    } else {
      throw new Error('Failed to send message');
    }
  })
  .catch(error => {
    showSuccess('Sorry, there was an error sending your message. Please try again.');
  })
  .finally(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

// Stats Update
function updateStats() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const studentCount = Math.min(500 + users.length * 10, 1000);
  document.getElementById('studentsCount').textContent = studentCount + '+';
}

// Success Message
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Smooth scroll and fade-in animation
const faders = document.querySelectorAll('.fade-in');
const appearOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    appearOnScroll.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});