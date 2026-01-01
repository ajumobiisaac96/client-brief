// ===== STATE MANAGEMENT =====
let currentStep = 1;
const totalSteps = 6;
const formData = {};
let logoFile = null;

const WEBFORMS_ACCESS_KEY = "d54d0b93-d2d5-45d4-9ec2-78d4e7cf2c15";
const WEBFORMS_EMAIL = "vheevidhub@gmail.com";
const WEBFORMS_API_URL = "https://api.web3forms.com/submit";

// ===== DOM ELEMENTS =====
const welcomeScreen = document.getElementById("welcomeScreen");
const questionnaireScreen = document.getElementById("questionnaireScreen");
const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const nextBtnText = document.getElementById("nextBtnText");
const stepCounter = document.getElementById("stepCounter");
const stepPercentage = document.getElementById("stepPercentage");
const progressFill = document.getElementById("progressFill");
const formSteps = document.querySelectorAll(".form-step");
const successModal = document.getElementById("successModal");
const emailModal = document.getElementById("emailModal");
const errorModal = document.getElementById("errorModal");
const submitBtn = document.getElementById("submitBtn");

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    welcomeScreen.classList.add("hidden");
    questionnaireScreen.style.display = "flex";
    setTimeout(() => {
      questionnaireScreen.style.opacity = "1";
    }, 50);
  }, 3000);

  setupEventListeners();
  setupLogoUpload();
  updateProgress();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  closeBtn.addEventListener("click", () => {
    if (
      confirm("Are you sure you want to close? Your progress will be lost.")
    ) {
      location.reload();
    }
  });

  prevBtn.addEventListener("click", previousStep);
  nextBtn.addEventListener("click", nextStep);

  // Form inputs for data collection
  const inputFields = [
    "fullName",
    "email",
    "phone",
    "company",
    "websiteType",
    "otherWebsiteType",
    "businessDescription",
    "websiteGoal",
    "currentWebsite",
    "pageCount",
    "additionalFeatures",
    "brandColors",
    "referenceWebsites",
    "additionalInfo",
    "referralSource",
    "timeline",
    "budget",
  ];

  inputFields.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", (e) => {
        formData[id] = e.target.value;
        clearFieldError(id);
      });
      element.addEventListener("input", (e) => {
        formData[id] = e.target.value;
        clearFieldError(id);
      });
    }
  });

  // Radio buttons
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      formData[e.target.name] = e.target.value;
      clearFieldError(e.target.name);
    });
  });

  // Checkboxes for features
  document.querySelectorAll('input[name="features"]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selected = Array.from(
        document.querySelectorAll('input[name="features"]:checked')
      ).map((c) => c.value);
      formData.features = selected;
    });
  });

  // Handle conditional display for "other" website type
  const websiteTypeSelect = document.getElementById("websiteType");
  if (websiteTypeSelect) {
    websiteTypeSelect.addEventListener("change", (e) => {
      const otherGroup = document.getElementById("otherWebsiteTypeGroup");
      const otherInput = document.getElementById("otherWebsiteType");
      if (e.target.value === "other") {
        otherGroup.style.display = "block";
        otherInput.required = true;
      } else {
        otherGroup.style.display = "none";
        otherInput.required = false;
        otherInput.value = "";
        formData.otherWebsiteType = "";
      }
    });
  }
}

// ===== LOGO UPLOAD =====
function displayLogoInHeader() {
  const welcomeLogo = document.getElementById("logoPlaceholder");
  if (welcomeLogo) {
    welcomeLogo.innerHTML =
      '<img src="logo.png" alt="Vheevid Hub Logo" style="max-width: 100%; height: 100%; object-fit: contain;">';
  }

  const headerLogo = document.querySelector(".header-logo");
  if (headerLogo) {
    headerLogo.innerHTML =
      '<img src="logo.png" alt="Vheevid Hub Logo" style="max-width: 100%; height: 100%; object-fit: contain;">';
  }

  const mobileLogoArea = document.getElementById("mobileLogoArea");
  if (mobileLogoArea) {
    mobileLogoArea.innerHTML =
      '<img src="logo.png" alt="Vheevid Hub Logo" style="max-width: 100%; height: 100%; object-fit: contain;">';
  }
}

function setupLogoUpload() {
  const logoInput = document.getElementById("logoFile");
  const logoUpload = document.querySelector(".logo-upload");
  const logoPreview = document.getElementById("logoPreview");

  displayLogoInHeader();

  logoInput.addEventListener("change", handleLogoSelect);

  logoUpload.addEventListener("dragover", (e) => {
    e.preventDefault();
    logoUpload.classList.add("dragover");
  });

  logoUpload.addEventListener("dragleave", () => {
    logoUpload.classList.remove("dragover");
  });

  logoUpload.addEventListener("drop", (e) => {
    e.preventDefault();
    logoUpload.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      logoInput.files = files;
      handleLogoSelect({ target: logoInput });
    }
  });
}

function handleLogoSelect(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) {
    logoFile = file;
    formData.logoFile = file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = document.getElementById("logoPreview");
      preview.innerHTML = `<img src="${event.target.result}" alt="Logo preview" style="max-width: 150px; border-radius: 8px;">`;
    };
    reader.readAsDataURL(file);
  }
}

// ===== NAVIGATION =====
function nextStep() {
  if (!validateCurrentStep()) {
    return;
  }

  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
    updateProgress();
    document.querySelector(".form-content-wrapper").scrollTop = 0;
  } else {
    showEmailModal();
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
    updateProgress();
    document.querySelector(".form-content-wrapper").scrollTop = 0;
  }
}

function showStep(step) {
  formSteps.forEach((el) => el.classList.remove("active"));
  document.querySelector(`[data-step="${step}"]`).classList.add("active");

  prevBtn.disabled = step === 1;
  nextBtnText.textContent =
    step === totalSteps ? "Review & Submit" : "Next Step";
}

// ===== VALIDATION =====
function validateCurrentStep() {
  const currentStepElement = document.querySelector(".form-step.active");
  const requiredInputs = currentStepElement.querySelectorAll("[required]");
  const errors = [];
  let isValid = true;

  requiredInputs.forEach((input) => {
    const fieldName = input.id || input.name;
    const formGroup = input.closest(".form-group");

    if (input.type === "radio" || input.type === "checkbox") {
      const groupName = input.name;
      const isChecked = currentStepElement.querySelector(
        `input[name="${groupName}"]:checked`
      );
      if (!isChecked) {
        formGroup?.classList.add("error");
        errors.push(`${getFieldLabel(groupName)} is required`);
        isValid = false;
      } else {
        formGroup?.classList.remove("error");
      }
    } else {
      if (!input.value.trim()) {
        formGroup?.classList.add("error");
        errors.push(`${getFieldLabel(fieldName)} is required`);
        isValid = false;
      } else {
        formGroup?.classList.remove("error");
      }
    }
  });

  if (!isValid) {
    showErrorModal(errors);
  }

  return isValid;
}

function getFieldLabel(fieldName) {
  const labels = {
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    websiteType: "Website Type",
    businessDescription: "Business Description",
    websiteGoal: "Website Goal",
    pageCount: "Page Count",
    timeline: "Timeline",
  };
  return labels[fieldName] || fieldName.replace(/([A-Z])/g, " $1").trim();
}

function clearFieldError(fieldId) {
  const element = document.getElementById(fieldId);
  if (element) {
    const formGroup = element.closest(".form-group");
    if (formGroup) {
      formGroup.classList.remove("error");
    }
  }
}

// ===== ERROR MODAL =====
function showErrorModal(errors) {
  const errorList = errors.map((error) => `• ${error}`).join("<br>");
  document.getElementById("errorModalMessage").innerHTML = errorList;
  errorModal.classList.add("active");
}

function closeErrorModal() {
  errorModal.classList.remove("active");
}

// ===== PROGRESS UPDATE =====
function updateProgress() {
  const percentage = (currentStep / totalSteps) * 100;
  stepCounter.textContent = `Step ${currentStep} of ${totalSteps}`;
  stepPercentage.textContent = `${Math.round(percentage)}%`;
  progressFill.style.width = `${percentage}%`;
}

// ===== EMAIL PREVIEW =====
function showEmailModal() {
  emailModal.classList.add("active");
  const previewContent = generatePlainTextPreview();
  document.getElementById("emailPreview").innerHTML = previewContent;
}

function generatePlainTextPreview() {
  let html = "";

  // Contact Information
  if (
    formData.fullName ||
    formData.email ||
    formData.phone ||
    formData.company
  ) {
    html += `
      <div class="email-section">
        <h3>👤 Contact Information</h3>
        ${
          formData.fullName
            ? `<div class="email-item"><span class="email-item-label">Full Name</span><span class="email-item-value">${escapeHtml(
                formData.fullName
              )}</span></div>`
            : ""
        }
        ${
          formData.email
            ? `<div class="email-item"><span class="email-item-label">Email Address</span><span class="email-item-value">${escapeHtml(
                formData.email
              )}</span></div>`
            : ""
        }
        ${
          formData.phone
            ? `<div class="email-item"><span class="email-item-label">Phone Number</span><span class="email-item-value">${escapeHtml(
                formData.phone
              )}</span></div>`
            : ""
        }
        ${
          formData.company
            ? `<div class="email-item"><span class="email-item-label">Company/Business</span><span class="email-item-value">${escapeHtml(
                formData.company
              )}</span></div>`
            : ""
        }
      </div>
    `;
  }

  // Project Overview
  if (
    formData.websiteType ||
    formData.businessDescription ||
    formData.websiteGoal
  ) {
    html += `
      <div class="email-section">
        <h3>🎯 Project Overview</h3>
        ${
          formData.websiteType
            ? `<div class="email-item"><span class="email-item-label">Type of Website</span><span class="email-item-value">${formatWebsiteType(
                formData.websiteType
              )}</span></div>`
            : ""
        }
        ${
          formData.otherWebsiteType
            ? `<div class="email-item"><span class="email-item-label">Website Type (Other)</span><span class="email-item-value">${escapeHtml(
                formData.otherWebsiteType
              )}</span></div>`
            : ""
        }
        ${
          formData.businessDescription
            ? `<div class="email-item"><span class="email-item-label">Business Description</span><span class="email-item-value">${escapeHtml(
                formData.businessDescription
              )}</span></div>`
            : ""
        }
        ${
          formData.websiteGoal
            ? `<div class="email-item"><span class="email-item-label">Main Goal</span><span class="email-item-value">${escapeHtml(
                formData.websiteGoal
              )}</span></div>`
            : ""
        }
      </div>
    `;
  }

  // Website Requirements
  if (
    formData.existingWebsite ||
    formData.currentWebsite ||
    formData.pageCount ||
    formData.features ||
    formData.additionalFeatures
  ) {
    html += `
      <div class="email-section">
        <h3>📄 Website Requirements</h3>
        ${
          formData.existingWebsite
            ? `<div class="email-item"><span class="email-item-label">Existing Website</span><span class="email-item-value">${
                formData.existingWebsite === "yes"
                  ? "Yes (Redesign/Revamp)"
                  : "No (New Website)"
              }</span></div>`
            : ""
        }
        ${
          formData.currentWebsite
            ? `<div class="email-item"><span class="email-item-label">Current Website URL</span><span class="email-item-value"><a href="${escapeHtml(
                formData.currentWebsite
              )}" target="_blank">${escapeHtml(
                formData.currentWebsite
              )}</a></span></div>`
            : ""
        }
        ${
          formData.pageCount
            ? `<div class="email-item"><span class="email-item-label">Estimated Pages</span><span class="email-item-value">${escapeHtml(
                formData.pageCount
              )}</span></div>`
            : ""
        }
        ${
          formData.features && formData.features.length > 0
            ? `<div class="email-item"><span class="email-item-label">Features Required</span><span class="email-item-value">${formatFeaturesList(
                formData.features
              )}</span></div>`
            : ""
        }
        ${
          formData.additionalFeatures
            ? `<div class="email-item"><span class="email-item-label">Additional Features</span><span class="email-item-value">${escapeHtml(
                formData.additionalFeatures
              )}</span></div>`
            : ""
        }
      </div>
    `;
  }

  // Design & Content
  if (
    formData.hasLogo ||
    formData.brandColors ||
    formData.referenceWebsites ||
    formData.contentStatus
  ) {
    html += `
      <div class="email-section">
        <h3>🎨 Design & Content</h3>
        ${
          formData.hasLogo
            ? `<div class="email-item"><span class="email-item-label">Logo Status</span><span class="email-item-value">${
                formData.hasLogo === "yes"
                  ? "Yes (Has Logo)"
                  : "No (Need Logo Design)"
              }</span></div>`
            : ""
        }
        ${
          formData.brandColors
            ? `<div class="email-item"><span class="email-item-label">Brand Colors/Style</span><span class="email-item-value">${escapeHtml(
                formData.brandColors
              )}</span></div>`
            : ""
        }
        ${
          formData.referenceWebsites
            ? `<div class="email-item"><span class="email-item-label">Reference Websites</span><span class="email-item-value">${escapeHtml(
                formData.referenceWebsites
              )}</span></div>`
            : ""
        }
        ${
          formData.contentStatus
            ? `<div class="email-item"><span class="email-item-label">Content Status</span><span class="email-item-value">${formatContentStatus(
                formData.contentStatus
              )}</span></div>`
            : ""
        }
      </div>
    `;
  }

  // Timeline & Budget
  if (formData.timeline || formData.budget) {
    html += `
      <div class="email-section">
        <h3>⏰ Timeline & Budget</h3>
        ${
          formData.timeline
            ? `<div class="email-item"><span class="email-item-label">Desired Launch Date</span><span class="email-item-value">${formatTimeline(
                formData.timeline
              )}</span></div>`
            : ""
        }
        ${
          formData.budget
            ? `<div class="email-item"><span class="email-item-label">Budget Range</span><span class="email-item-value">${formatBudget(
                formData.budget
              )}</span></div>`
            : ""
        }
      </div>
    `;
  }

  // Additional Information
  if (formData.referralSource || formData.additionalInfo) {
    html += `
      <div class="email-section">
        <h3>💬 Additional Information</h3>
        ${
          formData.referralSource
            ? `<div class="email-item"><span class="email-item-label">How did you hear about us</span><span class="email-item-value">${formatReferral(
                formData.referralSource
              )}</span></div>`
            : ""
        }
        ${
          formData.additionalInfo
            ? `<div class="email-item"><span class="email-item-label">Additional Notes</span><span class="email-item-value">${escapeHtml(
                formData.additionalInfo
              )}</span></div>`
            : ""
        }
      </div>
    `;
  }

  return html;
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ===== FORMATTING HELPERS =====
function formatWebsiteType(type) {
  const types = {
    business: "Business/Corporate Website",
    ecommerce: "E-commerce/Online Store",
    portfolio: "Portfolio/Personal Website",
    blog: "Blog/News Website",
    landing: "Landing Page",
    nonprofit: "Non-profit/NGO Website",
    educational: "Educational/Learning Platform",
    booking: "Booking/Reservation System",
    other: "Other",
  };
  return types[type] || type;
}

function formatFeaturesList(features) {
  const featureMap = {
    contactForm: "Contact Form",
    blog: "Blog Section",
    ecommerce: "E-commerce/Cart",
    gallery: "Photo/Video Gallery",
    userLogin: "User Login/Registration",
    payment: "Payment Integration",
    booking: "Booking System",
    newsletter: "Newsletter Signup",
    search: "Search Functionality",
    multilingual: "Multi-language",
  };

  return features.map((f) => featureMap[f] || f).join(", ");
}

function formatTimeline(timeline) {
  const timelines = {
    asap: "As soon as possible",
    "1month": "Within 1 month",
    "2-3months": "2-3 months",
    "3+months": "3+ months",
    flexible: "Flexible",
  };
  return timelines[timeline] || timeline;
}

function formatBudget(budget) {
  const budgets = {
    under500: "Under $500",
    "500-1500": "$500 - $1,500",
    "1500-3000": "$1,500 - $3,000",
    "3000-5000": "$3,000 - $5,000",
    "5000+": "$5,000+",
  };
  return budgets[budget] || "Prefer not to say";
}

function formatContentStatus(status) {
  const statuses = {
    ready: "Yes, content is ready",
    partial: "Partially ready",
    need: "Need help with content creation",
  };
  return statuses[status] || status;
}

function formatReferral(referral) {
  const referrals = {
    google: "Google Search",
    social: "Social Media",
    referral: "Referral from friend/colleague",
    portfolio: "Saw your portfolio work",
    other: "Other",
  };
  return referrals[referral] || referral;
}

function closeEmailModal() {
  emailModal.classList.remove("active");
}

// ===== FORM SUBMISSION =====
function submitForm() {
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";

  const plainTextEmail = generateEmailHTML();

  const formDataToSubmit = {
    access_key: WEBFORMS_ACCESS_KEY,
    email: WEBFORMS_EMAIL,
    subject: formData.fullName
      ? `New Project Questionnaire - ${formData.fullName}`
      : "New Project Questionnaire",
    message: plainTextEmail, // Use message field for plain text
  };

  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formDataToSubmit),
  })
    .then((response) => response.json())
    .then((data) => {
      emailModal.classList.remove("active");
      successModal.classList.add("active");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Questionnaire";
    })
    .catch((error) => {
      console.log("[v0] Webforms submission error:", error.message);
      emailModal.classList.remove("active");
      successModal.classList.add("active");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Questionnaire";
    });
}

function closeSuccessModal() {
  successModal.classList.remove("active");
  location.reload();
}

function generateEmailHTML() {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let emailText =
    "Hello,\n\nA new form has been submitted on your website. Details below.\n\n";
  emailText += "═══════════════════════════════════════\n\n";

  // Contact Information
  if (
    formData.fullName ||
    formData.email ||
    formData.phone ||
    formData.company
  ) {
    emailText += "👤 CONTACT INFORMATION\n";
    emailText += "─────────────────────────────────────\n";
    if (formData.fullName) emailText += `Full Name: ${formData.fullName}\n`;
    if (formData.email) emailText += `Email Address: ${formData.email}\n`;
    if (formData.phone) emailText += `Phone Number: ${formData.phone}\n`;
    if (formData.company)
      emailText += `Company/Business: ${formData.company}\n`;
    emailText += "\n";
  }

  // Project Overview
  if (
    formData.websiteType ||
    formData.businessDescription ||
    formData.websiteGoal
  ) {
    emailText += "🎯 PROJECT OVERVIEW\n";
    emailText += "─────────────────────────────────────\n";
    if (formData.websiteType)
      emailText += `Type of Website: ${formatWebsiteType(
        formData.websiteType
      )}\n`;
    if (formData.otherWebsiteType)
      emailText += `Website Type (Other): ${formData.otherWebsiteType}\n`;
    if (formData.businessDescription)
      emailText += `Business Description: ${formData.businessDescription}\n`;
    if (formData.websiteGoal)
      emailText += `Main Goal: ${formData.websiteGoal}\n`;
    emailText += "\n";
  }

  // Website Requirements
  if (
    formData.existingWebsite ||
    formData.currentWebsite ||
    formData.pageCount ||
    formData.features ||
    formData.additionalFeatures
  ) {
    emailText += "📄 WEBSITE REQUIREMENTS\n";
    emailText += "─────────────────────────────────────\n";
    if (formData.existingWebsite)
      emailText += `Existing Website: ${
        formData.existingWebsite === "yes"
          ? "Yes (Redesign/Revamp)"
          : "No (New Website)"
      }\n`;
    if (formData.currentWebsite)
      emailText += `Current Website URL: ${formData.currentWebsite}\n`;
    if (formData.pageCount)
      emailText += `Estimated Pages: ${formData.pageCount}\n`;
    if (formData.features && formData.features.length > 0)
      emailText += `Features Required: ${formatFeaturesList(
        formData.features
      )}\n`;
    if (formData.additionalFeatures)
      emailText += `Additional Features: ${formData.additionalFeatures}\n`;
    emailText += "\n";
  }

  // Design & Content
  if (
    formData.hasLogo ||
    formData.brandColors ||
    formData.referenceWebsites ||
    formData.contentStatus
  ) {
    emailText += "🎨 DESIGN & CONTENT\n";
    emailText += "─────────────────────────────────────\n";
    if (formData.hasLogo)
      emailText += `Logo Status: ${
        formData.hasLogo === "yes" ? "Yes (Has Logo)" : "No (Need Logo Design)"
      }\n`;
    if (formData.brandColors)
      emailText += `Brand Colors/Style: ${formData.brandColors}\n`;
    if (formData.referenceWebsites)
      emailText += `Reference Websites: ${formData.referenceWebsites}\n`;
    if (formData.contentStatus)
      emailText += `Content Status: ${formatContentStatus(
        formData.contentStatus
      )}\n`;
    emailText += "\n";
  }

  // Timeline & Budget
  if (formData.timeline || formData.budget) {
    emailText += "⏰ TIMELINE & BUDGET\n";
    emailText += "─────────────────────────────────────\n";
    if (formData.timeline)
      emailText += `Desired Launch Date: ${formatTimeline(
        formData.timeline
      )}\n`;
    if (formData.budget)
      emailText += `Budget Range: ${formatBudget(formData.budget)}\n`;
    emailText += "\n";
  }

  // Additional Information
  if (formData.referralSource || formData.additionalInfo) {
    emailText += "💬 ADDITIONAL INFORMATION\n";
    emailText += "─────────────────────────────────────\n";
    if (formData.referralSource)
      emailText += `How did you hear about us: ${formatReferral(
        formData.referralSource
      )}\n`;
    if (formData.additionalInfo)
      emailText += `Additional Notes: ${formData.additionalInfo}\n`;
    emailText += "\n";
  }

  emailText += "═══════════════════════════════════════\n\n";
  emailText += `Submitted on: ${date}\n`;
  emailText += "This questionnaire was submitted through Vheevid Hub";

  return emailText;
}
