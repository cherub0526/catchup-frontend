// 資料儲存
let currentBilling = "monthly";
let currentPlan = "free";
let creditCards = [];

// DOM 元素
const navItems = document.querySelectorAll(".nav-item");
const contentSections = document.querySelectorAll(".content-section");
const backBtn = document.getElementById("back-btn");

// 表單元素
const profileForm = document.getElementById("profile-form");
const passwordForm = document.getElementById("password-form");
const addCardBtn = document.getElementById("add-card-btn");
const addCardModal = document.getElementById("add-card-modal");
const closeAddCard = document.getElementById("close-add-card");
const cancelAddCard = document.getElementById("cancel-add-card");
const addCardForm = document.getElementById("add-card-form");
const creditCardsList = document.getElementById("credit-cards-list");

// 訂閱相關
const pricingToggleBtns = document.querySelectorAll(".pricing-toggle button");
const plansGrid = document.getElementById("plans-grid");

// 初始化
function init() {
  // 載入資料
  loadData();

  // 渲染信用卡列表
  renderCreditCards();

  // 更新訂閱方案顯示
  updateCurrentPlan();
  updatePricing();

  // 綁定事件
  bindEvents();
}

// 綁定事件
function bindEvents() {
  // 側邊欄導航
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;
      switchSection(section);
    });
  });

  // 返回按鈕
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // 基本資訊表單
  profileForm.addEventListener("submit", handleProfileSubmit);
  document.getElementById("cancel-profile").addEventListener("click", () => {
    profileForm.reset();
  });

  // 密碼表單
  passwordForm.addEventListener("submit", handlePasswordSubmit);
  document.getElementById("cancel-password").addEventListener("click", () => {
    passwordForm.reset();
  });

  // 新增信用卡
  addCardBtn.addEventListener("click", openAddCardModal);
  closeAddCard.addEventListener("click", closeAddCardModal);
  cancelAddCard.addEventListener("click", closeAddCardModal);
  addCardModal.addEventListener("click", (e) => {
    if (e.target === addCardModal) {
      closeAddCardModal();
    }
  });
  addCardForm.addEventListener("submit", handleAddCard);

  // 卡號格式化
  document.getElementById("card-number").addEventListener("input", formatCardNumber);
  document.getElementById("card-expiry").addEventListener("input", formatExpiry);
  document.getElementById("card-cvv").addEventListener("input", formatCVV);

  // 定價切換
  pricingToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const billing = btn.dataset.billing;
      switchBilling(billing);
    });
  });

  // 訂閱方案按鈕
  document.querySelectorAll(".btn-subscribe").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const planCard = e.target.closest(".plan-card");
      const plan = planCard.dataset.plan;
      handleSubscribe(plan);
    });
  });

  // 聯絡我們按鈕
  document.querySelectorAll(".btn-contact").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("請聯絡我們的業務團隊：\n\n電話：02-1234-5678\n郵件：sales@videoassistant.com");
    });
  });
}

// 切換區段
function switchSection(section) {
  // 更新導航狀態
  navItems.forEach((item) => {
    if (item.dataset.section === section) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // 更新內容區域
  contentSections.forEach((content) => {
    if (content.id === `${section}-section`) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}

// 處理基本資訊提交
function handleProfileSubmit(e) {
  e.preventDefault();

  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const phone = document.getElementById("phone").value;
  const language = document.getElementById("language").value;

  // 儲存資料
  const profileData = { firstName, lastName, phone, language };
  localStorage.setItem("userProfile", JSON.stringify(profileData));

  showNotification("基本資訊已更新", "success");
}

// 處理密碼提交
function handlePasswordSubmit(e) {
  e.preventDefault();

  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // 驗證
  if (newPassword !== confirmPassword) {
    showNotification("新密碼與確認密碼不符", "error");
    return;
  }

  if (newPassword.length < 8) {
    showNotification("密碼長度至少需要 8 個字元", "error");
    return;
  }

  // 模擬更新密碼
  showNotification("密碼已更新", "success");
  passwordForm.reset();
}

// 開啟新增信用卡模態視窗
function openAddCardModal() {
  addCardModal.classList.add("show");
}

// 關閉新增信用卡模態視窗
function closeAddCardModal() {
  addCardModal.classList.remove("show");
  addCardForm.reset();
}

// 處理新增信用卡
function handleAddCard(e) {
  e.preventDefault();

  const cardNumber = document.getElementById("card-number").value;
  const cardHolder = document.getElementById("card-holder").value;
  const cardExpiry = document.getElementById("card-expiry").value;
  const cardCvv = document.getElementById("card-cvv").value;

  // 驗證
  if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
    showNotification("請填寫所有欄位", "error");
    return;
  }

  // 新增卡片
  const newCard = {
    id: Date.now(),
    number: cardNumber,
    holder: cardHolder,
    expiry: cardExpiry,
    isPrimary: creditCards.length === 0, // 第一張卡設為主要卡片
  };

  creditCards.push(newCard);
  saveData();
  renderCreditCards();
  closeAddCardModal();
  showNotification("信用卡已新增", "success");
}

// 渲染信用卡列表
function renderCreditCards() {
  if (creditCards.length === 0) {
    creditCardsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px">尚未新增付款方式</p>';
    return;
  }

  creditCardsList.innerHTML = creditCards
    .map(
      (card) => `
    <div class="credit-card-item ${card.isPrimary ? "primary" : ""}">
      <div class="card-info">
        <div class="card-icon">💳</div>
        <div class="card-details">
          <div class="card-number">•••• •••• •••• ${card.number.slice(-4)}</div>
          <div class="card-expiry">到期日：${card.expiry}</div>
        </div>
        ${card.isPrimary ? '<span class="card-badge">主要卡片</span>' : ""}
      </div>
      <div class="card-actions">
        ${!card.isPrimary ? `<button onclick="setPrimaryCard(${card.id})">設為主要</button>` : ""}
        <button class="btn-delete" onclick="deleteCard(${card.id})">刪除</button>
      </div>
    </div>
  `
    )
    .join("");
}

// 設定主要卡片
function setPrimaryCard(cardId) {
  creditCards.forEach((card) => {
    card.isPrimary = card.id === cardId;
  });
  saveData();
  renderCreditCards();
  showNotification("主要卡片已更新", "success");
}

// 刪除卡片
function deleteCard(cardId) {
  if (confirm("確定要刪除此信用卡嗎？")) {
    const cardIndex = creditCards.findIndex((card) => card.id === cardId);
    const wasPrimary = creditCards[cardIndex].isPrimary;

    creditCards.splice(cardIndex, 1);

    // 如果刪除的是主要卡片，將第一張卡設為主要
    if (wasPrimary && creditCards.length > 0) {
      creditCards[0].isPrimary = true;
    }

    saveData();
    renderCreditCards();
    showNotification("信用卡已刪除", "success");
  }
}

// 切換付款週期
function switchBilling(billing) {
  currentBilling = billing;

  // 更新按鈕狀態
  pricingToggleBtns.forEach((btn) => {
    if (btn.dataset.billing === billing) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 更新價格顯示
  updatePricing();
}

// 更新價格顯示
function updatePricing() {
  const isYearly = currentBilling === "yearly";

  document.querySelectorAll(".plan-card").forEach((card) => {
    const plan = card.dataset.plan;
    if (plan === "free" || plan === "enterprise") return;

    const priceAmount = card.querySelector(".price-amount");
    const pricePeriod = card.querySelector(".price-period");
    const originalPrice = card.querySelector(".plan-original-price");
    const originalAmount = card.querySelector(".original-amount");

    if (isYearly) {
      const monthlyPrice = parseInt(priceAmount.dataset.monthly);
      const yearlyPrice = parseInt(priceAmount.dataset.yearly);

      priceAmount.textContent = yearlyPrice;
      pricePeriod.textContent = "/月";
      originalPrice.style.display = "block";
      originalAmount.textContent = monthlyPrice;
    } else {
      const monthlyPrice = priceAmount.dataset.monthly;
      priceAmount.textContent = monthlyPrice;
      pricePeriod.textContent = "/月";
      originalPrice.style.display = "none";
    }
  });
}

// 更新目前方案顯示
function updateCurrentPlan() {
  const planNames = {
    free: "免費方案",
    basic: "基本方案",
    pro: "進階方案",
    enterprise: "客製化方案",
  };

  document.getElementById("current-plan-name").textContent = planNames[currentPlan] || "免費方案";

  if (currentPlan === "free") {
    document.getElementById("current-billing-cycle").textContent = "無需付款";
    document.getElementById("current-renewal-date").textContent = "永久有效";
  } else {
    const cycle = currentBilling === "monthly" ? "月付款" : "年付款";
    document.getElementById("current-billing-cycle").textContent = cycle;
    document.getElementById("current-renewal-date").textContent = "下次續約：2025/11/20";
  }

  // 更新方案卡片狀態
  document.querySelectorAll(".plan-card").forEach((card) => {
    const plan = card.dataset.plan;
    const btn = card.querySelector("button");

    if (plan === currentPlan) {
      card.classList.add("current");
      btn.className = "btn-current";
      btn.textContent = "目前方案";
      btn.disabled = true;
    } else {
      card.classList.remove("current");
      if (plan === "enterprise") {
        btn.className = "btn-contact";
        btn.textContent = "聯絡我們";
        btn.disabled = false;
      } else {
        btn.className = "btn-subscribe";
        btn.textContent = "選擇方案";
        btn.disabled = false;
      }
    }
  });
}

// 處理訂閱
function handleSubscribe(plan) {
  if (creditCards.length === 0) {
    if (confirm("尚未新增付款方式。是否要立即新增信用卡？")) {
      switchSection("payment");
      setTimeout(() => {
        openAddCardModal();
      }, 300);
    }
    return;
  }

  const planNames = {
    basic: "基本方案",
    pro: "進階方案",
  };

  const planPrices = {
    basic: currentBilling === "monthly" ? 299 : 239,
    pro: currentBilling === "monthly" ? 599 : 479,
  };

  const cycle = currentBilling === "monthly" ? "月付款" : "年付款";
  const message = `確定要訂閱「${planNames[plan]}」嗎？\n\n費用：NT$ ${planPrices[plan]}/月（${cycle}）`;

  if (confirm(message)) {
    currentPlan = plan;
    saveData();
    updateCurrentPlan();
    showNotification("訂閱成功！感謝您的支持", "success");
  }
}

// 卡號格式化
function formatCardNumber(e) {
  let value = e.target.value.replace(/\s/g, "");
  let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
  e.target.value = formattedValue;
}

// 有效期限格式化
function formatExpiry(e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4);
  }
  e.target.value = value;
}

// CVV 格式化
function formatCVV(e) {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
}

// 顯示通知
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 30px;
    background: ${type === "success" ? "#10b981" : "#e74c3c"};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// 儲存資料
function saveData() {
  localStorage.setItem("creditCards", JSON.stringify(creditCards));
  localStorage.setItem("currentPlan", currentPlan);
  localStorage.setItem("currentBilling", currentBilling);
}

// 載入資料
function loadData() {
  const savedCards = localStorage.getItem("creditCards");
  const savedPlan = localStorage.getItem("currentPlan");
  const savedBilling = localStorage.getItem("currentBilling");

  if (savedCards) {
    creditCards = JSON.parse(savedCards);
  }

  if (savedPlan) {
    currentPlan = savedPlan;
  }

  if (savedBilling) {
    currentBilling = savedBilling;
  }
}

// 動畫樣式
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// 讓函數在全局可用
window.setPrimaryCard = setPrimaryCard;
window.deleteCard = deleteCard;

// 頁面載入完成後初始化
document.addEventListener("DOMContentLoaded", init);
