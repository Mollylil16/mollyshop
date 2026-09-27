/**
 * MOLLYSHOP ABIDJAN — LOGIQUE FRONTEND & MONGODB
 * Gestion du catalogue en FCFA, WhatsApp 0789886013 et paiements Wave/Orange/Visa
 */

const WHATSAPP_PHONE = '2250789886013';

// ==========================================
// ÉTAT DE L'APPLICATION
// ==========================================
const state = {
  products: [],
  categories: [],
  brands: [],
  filters: {
    category: 'Tous',
    brand: 'Toutes',
    search: '',
    sort: 'newest'
  },
  cart: JSON.parse(localStorage.getItem('molly_cart_ci')) || [],
  promo: {
    code: null,
    discountRate: 0
  },
  selectedQuickViewProduct: null,
  selectedSize: null
};

// ==========================================
// UTILITAIRE DE FORMATAGE FCFA
// ==========================================
function formatFCFA(amount) {
  if (isNaN(amount)) return '0 FCFA';
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

// ==========================================
// ÉLÉMENTS DU DOM
// ==========================================
const elements = {
  productsGrid: document.getElementById('products-grid'),
  categoryPills: document.getElementById('category-pills'),
  brandFilter: document.getElementById('brand-filter'),
  sortFilter: document.getElementById('sort-filter'),
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search'),
  emptyState: document.getElementById('empty-state'),
  emptyResetBtn: document.getElementById('empty-reset-btn'),
  activeFiltersBar: document.getElementById('active-filters-bar'),
  filterTags: document.getElementById('filter-tags'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),

  // Panier
  cartTrigger: document.getElementById('cart-trigger'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartBackdrop: document.getElementById('cart-backdrop'),
  closeCartBtn: document.getElementById('close-cart-btn'),
  cartCounter: document.getElementById('cart-counter'),
  cartNavTotal: document.getElementById('cart-nav-total'),
  cartItemsCount: document.getElementById('cart-items-count'),
  cartItemsList: document.getElementById('cart-items-list'),
  cartEmptyView: document.getElementById('cart-empty-view'),
  cartFooter: document.getElementById('cart-footer'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartDiscount: document.getElementById('cart-discount'),
  discountRow: document.getElementById('discount-row'),
  cartShipping: document.getElementById('cart-shipping'),
  cartGrandTotal: document.getElementById('cart-grand-total'),
  shippingProgressBar: document.getElementById('shipping-progress-bar'),
  shippingProgressText: document.getElementById('shipping-progress-text'),
  promoInput: document.getElementById('promo-input'),
  applyPromoBtn: document.getElementById('apply-promo-btn'),
  promoMessage: document.getElementById('promo-message'),
  startShoppingBtn: document.getElementById('start-shopping-btn'),
  cartWaCheckoutBtn: document.getElementById('cart-wa-checkout-btn'),

  // Modals
  quickViewBackdrop: document.getElementById('quick-view-backdrop'),
  quickViewContent: document.getElementById('quick-view-content'),
  closeQuickViewBtn: document.getElementById('close-quick-view-btn'),

  checkoutTriggerBtn: document.getElementById('checkout-trigger-btn'),
  checkoutBackdrop: document.getElementById('checkout-backdrop'),
  closeCheckoutBtn: document.getElementById('close-checkout-btn'),
  checkoutForm: document.getElementById('checkout-form'),
  checkoutItemsSummary: document.getElementById('checkout-items-summary'),
  checkoutTotalSummary: document.getElementById('checkout-total-summary'),

  successBackdrop: document.getElementById('success-backdrop'),
  confirmedOrderNumber: document.getElementById('confirmed-order-number'),
  confirmedOrderDetails: document.getElementById('confirmed-order-details'),
  successWaShareBtn: document.getElementById('success-wa-share-btn'),
  successContinueBtn: document.getElementById('success-continue-btn'),

  ordersBtn: document.getElementById('orders-btn'),
  ordersHistoryBackdrop: document.getElementById('orders-history-backdrop'),
  closeHistoryBtn: document.getElementById('close-history-btn'),
  ordersHistoryList: document.getElementById('orders-history-list'),

  // Hero
  heroBuyBtn: document.getElementById('hero-buy-btn'),

  // Toasts
  toastContainer: document.getElementById('toast-container')
};

// ==========================================
// INITIALISATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  fetchMetadata();
  fetchProducts();
  updateCartUI();
  setupEventListeners();
});

// ==========================================
// APPELS API MONGODB
// ==========================================
async function fetchMetadata() {
  try {
    const res = await fetch('/api/metadata');
    const data = await res.json();
    if (data.success) {
      state.brands = data.brands || [];
      populateBrandFilter();
    }
  } catch (err) {
    console.error('Erreur chargement metadata :', err);
  }
}

function populateBrandFilter() {
  elements.brandFilter.innerHTML = '<option value="Toutes">Toutes les Marques</option>';
  state.brands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    elements.brandFilter.appendChild(option);
  });
}

async function fetchProducts() {
  try {
    const params = new URLSearchParams();
    if (state.filters.category && state.filters.category !== 'Tous') {
      params.append('category', state.filters.category);
    }
    if (state.filters.brand && state.filters.brand !== 'Toutes') {
      params.append('brand', state.filters.brand);
    }
    if (state.filters.search) {
      params.append('search', state.filters.search);
    }
    if (state.filters.sort) {
      params.append('sort', state.filters.sort);
    }

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      state.products = data.data;
      renderProducts(data.data);
      updateFilterTagsUI();
    }
  } catch (err) {
    console.error('Erreur produits MongoDB :', err);
    showToast('Erreur de connexion avec MongoDB', 'error');
  }
}

// ==========================================
// RENDU DU CATALOGUE
// ==========================================
function renderProducts(products) {
  if (products.length === 0) {
    elements.productsGrid.innerHTML = '';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  elements.productsGrid.innerHTML = products.map(product => {
    const badgeHtml = product.badge ? `<span class="card-badge">${product.badge}</span>` : '<span></span>';
    const oldPriceHtml = product.oldPrice ? `<span class="card-old-price">${formatFCFA(product.oldPrice)}</span>` : '';
    const displaySizes = (product.sizes || [40, 41, 42, 43]).slice(0, 5);

    const sizesHtml = displaySizes.map((s, idx) => `
      <button class="size-pill ${idx === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
    `).join('');

    // Lien WhatsApp direct pour ce modèle
    const waText = encodeURIComponent(`Bonjour mollyShop, je souhaite commander le modèle "${product.name}" au prix de ${formatFCFA(product.price)}.`);
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${waText}`;

    return `
      <div class="product-card" data-id="${product._id}">
        <div class="card-top">
          ${badgeHtml}
          <button class="card-quick-view-btn" data-id="${product._id}" title="Détails du modèle">
            <i class="fa-solid fa-eye"></i>
          </button>
        </div>

        <div class="card-img-box" data-id="${product._id}">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>

        <span class="card-brand">${product.brand}</span>
        <h3 class="card-title" data-id="${product._id}">${product.name}</h3>
        <span class="card-category-tag">${product.category}</span>

        <div class="card-sizes-row">
          ${sizesHtml}
        </div>

        <div class="card-bottom">
          <div class="price-col">
            ${oldPriceHtml}
            <span class="card-price">${formatFCFA(product.price)}</span>
          </div>

          <div class="card-actions-group">
            <a href="${waUrl}" target="_blank" class="card-wa-btn" title="Commander directement sur WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <button class="card-cart-btn" data-id="${product._id}" title="Ajouter au Panier">
              <i class="fa-solid fa-bag-shopping"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateFilterTagsUI() {
  const activeTags = [];
  if (state.filters.category !== 'Tous') {
    activeTags.push({ type: 'category', label: `Catégorie : ${state.filters.category}` });
  }
  if (state.filters.brand !== 'Toutes') {
    activeTags.push({ type: 'brand', label: `Marque : ${state.filters.brand}` });
  }
  if (state.filters.search) {
    activeTags.push({ type: 'search', label: `Recherche : "${state.filters.search}"` });
  }

  if (activeTags.length > 0) {
    elements.activeFiltersBar.style.display = 'flex';
    elements.filterTags.innerHTML = activeTags.map(tag => `
      <div class="active-tag">
        <span>${tag.label}</span>
        <i class="fa-solid fa-xmark" data-remove-tag="${tag.type}"></i>
      </div>
    `).join('');
  } else {
    elements.activeFiltersBar.style.display = 'none';
  }
}

// ==========================================
// GESTION DU PANIER & FCFA
// ==========================================
function addToCart(productId, size = null) {
  const product = state.products.find(p => p._id === productId);
  if (!product) return;

  const chosenSize = size || (product.sizes && product.sizes[0]) || 42;

  const existingIndex = state.cart.findIndex(
    item => item.id === productId && item.size === chosenSize
  );

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += 1;
  } else {
    state.cart.push({
      id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      size: chosenSize,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} (Taille ${chosenSize}) ajouté au panier`);
  openCartDrawer();
}

function updateQuantity(index, change) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += change;

  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }

  saveCart();
  updateCartUI();
}

function removeItem(index) {
  if (!state.cart[index]) return;
  const name = state.cart[index].name;
  state.cart.splice(index, 1);
  saveCart();
  updateCartUI();
  showToast(`${name} retiré du panier`);
}

function saveCart() {
  localStorage.setItem('molly_cart_ci', JSON.stringify(state.cart));
}

function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  elements.cartCounter.textContent = totalItems;
  elements.cartItemsCount.textContent = totalItems;
  elements.cartNavTotal.textContent = formatFCFA(subtotal);

  if (state.cart.length === 0) {
    elements.cartEmptyView.style.display = 'flex';
    elements.cartItemsList.style.display = 'none';
    elements.cartFooter.style.display = 'none';
  } else {
    elements.cartEmptyView.style.display = 'none';
    elements.cartItemsList.style.display = 'flex';
    elements.cartFooter.style.display = 'block';

    elements.cartItemsList.innerHTML = state.cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-size">Pointure : ${item.size}</span>
          <div class="stepper-wrap">
            <button class="cart-step-btn" onclick="updateQuantity(${idx}, -1)">-</button>
            <span class="cart-step-qty">${item.quantity}</span>
            <button class="cart-step-btn" onclick="updateQuantity(${idx}, 1)">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <button class="cart-item-del" onclick="removeItem(${idx})" title="Retirer">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          <span class="cart-item-price">${formatFCFA(item.price * item.quantity)}</span>
        </div>
      </div>
    `).join('');
  }

  // Livraison offerte dès 250 000 FCFA
  const threshold = 250000;
  const shippingPercent = Math.min((subtotal / threshold) * 100, 100);
  elements.shippingProgressBar.style.width = `${shippingPercent}%`;

  let shippingCost = 2500;
  if (subtotal >= threshold || subtotal === 0) {
    shippingCost = 0;
    elements.shippingProgressText.innerHTML = `<i class="fa-solid fa-circle-check text-gold"></i> <strong>Livraison Express Abidjan OFFERTE !</strong>`;
    elements.cartShipping.textContent = '0 FCFA (Offerte)';
  } else {
    const diff = threshold - subtotal;
    elements.shippingProgressText.innerHTML = `<i class="fa-solid fa-truck"></i> Ajoutez <strong>${formatFCFA(diff)}</strong> pour la livraison offerte`;
    elements.cartShipping.textContent = '2 500 FCFA';
  }

  const discountAmount = subtotal * state.promo.discountRate;
  if (state.promo.discountRate > 0) {
    elements.discountRow.style.display = 'flex';
    elements.cartDiscount.textContent = `-${formatFCFA(discountAmount)} (${state.promo.discountRate * 100}%)`;
  } else {
    elements.discountRow.style.display = 'none';
  }

  const grandTotal = Math.max(subtotal - discountAmount + shippingCost, 0);
  elements.cartSubtotal.textContent = formatFCFA(subtotal);
  elements.cartGrandTotal.textContent = formatFCFA(grandTotal);

  // Lien WhatsApp direct pour le panier entier
  if (state.cart.length > 0) {
    let orderSummaryText = `*NOUVELLE COMMANDE MOLLYSHOP ABIDJAN*\n\n`;
    state.cart.forEach((it, i) => {
      orderSummaryText += `${i + 1}. ${it.name} (Taille ${it.size}) x${it.quantity} = ${formatFCFA(it.price * it.quantity)}\n`;
    });
    orderSummaryText += `\n*Total : ${formatFCFA(grandTotal)}*`;
    orderSummaryText += `\nLivraison : ${shippingCost === 0 ? 'Offerte' : '2 500 FCFA (Abidjan)'}`;
    orderSummaryText += `\n\nMerci de me confirmer la disponibilité et le délai de livraison.`;

    elements.cartWaCheckoutBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(orderSummaryText)}`;
    elements.cartWaCheckoutBtn.style.display = 'flex';
  } else {
    elements.cartWaCheckoutBtn.style.display = 'none';
  }
}

function applyPromoCode() {
  const code = elements.promoInput.value.trim().toUpperCase();
  if (code === 'MOLLY10') {
    state.promo = { code: 'MOLLY10', discountRate: 0.10 };
    elements.promoMessage.innerHTML = '<span class="text-gold"><i class="fa-solid fa-check"></i> Code MOLLY10 validé (-10%)</span>';
    showToast('Code privilège -10% activé');
  } else {
    state.promo = { code: null, discountRate: 0 };
    elements.promoMessage.innerHTML = '<span style="color: #ef4444;"><i class="fa-solid fa-xmark"></i> Code promotionnel invalide</span>';
  }
  updateCartUI();
}

function openCartDrawer() {
  elements.cartDrawer.classList.add('open');
  elements.cartBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  elements.cartDrawer.classList.remove('open');
  elements.cartBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// ==========================================
// MODAL DÉTAILS SOULIER (QUICK VIEW)
// ==========================================
async function openQuickView(productId) {
  try {
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();
    if (!data.success) return;

    const product = data.data;
    state.selectedQuickViewProduct = product;
    state.selectedSize = product.sizes[0] || 42;

    const sizesHtml = product.sizes.map(s => `
      <button class="qv-size-btn ${s === state.selectedSize ? 'active' : ''}" data-qv-size="${s}">${s}</button>
    `).join('');

    const waText = encodeURIComponent(`Bonjour mollyShop, je souhaite commander "${product.name}" en pointure ${state.selectedSize} au prix de ${formatFCFA(product.price)}.`);
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${waText}`;

    elements.quickViewContent.innerHTML = `
      <div class="quick-view-grid">
        <div class="qv-image-side">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="qv-details">
          <span class="qv-brand">${product.brand} • ${product.category}</span>
          <h2 class="qv-title">${product.name}</h2>

          <div class="qv-price-line">
            <span class="qv-current-price">${formatFCFA(product.price)}</span>
            ${product.oldPrice ? `<span class="card-old-price">${formatFCFA(product.oldPrice)}</span>` : ''}
          </div>

          <p class="qv-desc">${product.description}</p>

          <span class="qv-label">Pointures disponibles (EU) :</span>
          <div class="qv-sizes-row">
            ${sizesHtml}
          </div>

          <div class="qv-actions">
            <button class="btn btn-gold btn-full" id="qv-add-cart-btn">
              <i class="fa-solid fa-bag-shopping"></i>
              <span>Ajouter au Panier (${formatFCFA(product.price)})</span>
            </button>
            <a href="${waUrl}" target="_blank" class="btn btn-whatsapp-direct btn-full" id="qv-wa-btn">
              <i class="fa-brands fa-whatsapp"></i>
              <span>Commander via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('[data-qv-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-qv-size]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedSize = Number(btn.dataset.qvSize);

        // Mettre à jour le lien WhatsApp avec la pointure choisie
        const newWaText = encodeURIComponent(`Bonjour mollyShop, je souhaite commander "${product.name}" en pointure ${state.selectedSize} au prix de ${formatFCFA(product.price)}.`);
        document.getElementById('qv-wa-btn').href = `https://wa.me/${WHATSAPP_PHONE}?text=${newWaText}`;
      });
    });

    document.getElementById('qv-add-cart-btn').addEventListener('click', () => {
      addToCart(product._id, state.selectedSize);
      closeQuickView();
    });

    elements.quickViewBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    console.error('Erreur modal :', err);
  }
}

function closeQuickView() {
  elements.quickViewBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// ==========================================
// VALIDATION DE COMMANDE MONGODB
// ==========================================
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Votre panier est vide');
    return;
  }

  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 250000 ? 0 : 2500;
  const discount = subtotal * state.promo.discountRate;
  const total = Math.max(subtotal - discount + shipping, 0);

  elements.checkoutItemsSummary.textContent = `${totalItems} paire${totalItems > 1 ? 's' : ''}`;
  elements.checkoutTotalSummary.textContent = formatFCFA(total);

  closeCartDrawer();
  elements.checkoutBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  elements.checkoutBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

async function handleOrderSubmission(e) {
  e.preventDefault();

  const customer = {
    name: document.getElementById('cust-name').value.trim(),
    phone: document.getElementById('cust-phone').value.trim(),
    email: document.getElementById('cust-email').value.trim() || 'contact@mollyshop.ci',
    city: document.getElementById('cust-city').value.trim(),
    address: document.getElementById('cust-address').value.trim(),
    postalCode: '01'
  };

  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'Wave Mobile Money';

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 250000 ? 0 : 2500;
  const discount = subtotal * state.promo.discountRate;
  const total = Math.max(subtotal - discount + shipping, 0);

  const payload = {
    customer,
    items: state.cart.map(item => ({
      product: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      size: item.size,
      quantity: item.quantity,
      image: item.image
    })),
    subtotal,
    shipping,
    discount,
    total,
    paymentMethod
  };

  try {
    const submitBtn = document.getElementById('submit-order-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enregistrement dans MongoDB...';

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      const order = data.order;
      state.cart = [];
      saveCart();
      updateCartUI();
      closeCheckoutModal();

      // Afficher le récapitulatif
      elements.confirmedOrderNumber.textContent = order.orderNumber;
      elements.confirmedOrderDetails.innerHTML = `
        <div><strong>Client :</strong> ${order.customer.name} (Tél: ${order.customer.phone})</div>
        <div><strong>Livraison :</strong> ${order.customer.city} (${order.customer.address})</div>
        <div><strong>Articles :</strong> ${order.items.map(it => `${it.name} - Pointure ${it.size}`).join(', ')}</div>
        <div><strong>Moyen de Règlement :</strong> ${order.paymentMethod}</div>
        <div><strong>Total Réglé :</strong> <span class="text-gold font-bold">${formatFCFA(order.total)}</span></div>
      `;

      // Lien WhatsApp de suivi
      const waMsg = encodeURIComponent(`Bonjour mollyShop, je viens de valider ma commande référence ${order.orderNumber} d'un montant de ${formatFCFA(order.total)}. Mon nom est ${order.customer.name} (Tél: ${order.customer.phone}).`);
      elements.successWaShareBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${waMsg}`;

      elements.successBackdrop.classList.add('open');
    }
  } catch (err) {
    console.error('Erreur commande :', err);
    showToast('Erreur serveur lors de la commande', 'error');
  } finally {
    const submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> <span>Confirmer et Valider la Commande</span>';
    }
  }
}

// ==========================================
// HISTORIQUE DES COMMANDES MONGODB
// ==========================================
async function openOrdersHistory() {
  elements.ordersHistoryBackdrop.classList.add('open');
  elements.ordersHistoryList.innerHTML = '<p style="text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Chargement depuis MongoDB...</p>';

  try {
    const res = await fetch('/api/orders');
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      elements.ordersHistoryList.innerHTML = data.data.map(order => `
        <div class="history-card-item">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <strong class="text-gold">${order.orderNumber}</strong>
            <span class="badge-gold">${order.status}</span>
          </div>
          <div style="color: var(--text-muted); font-size: 0.76rem; margin-bottom: 6px;">
            ${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • ${order.customer.name} (${order.customer.city})
          </div>
          <div style="color: var(--text-secondary); margin-bottom: 6px;">
            ${order.items.map(i => `${i.name} (P.${i.size}) x${i.quantity}`).join(', ')}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 6px;">
            <span style="font-size: 0.76rem; color: var(--text-muted);">Paiement : ${order.paymentMethod}</span>
            <strong class="gold-price">${formatFCFA(order.total)}</strong>
          </div>
        </div>
      `).join('');
    } else {
      elements.ordersHistoryList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune commande enregistrée pour le moment.</p>';
    }
  } catch (err) {
    elements.ordersHistoryList.innerHTML = '<p style="color: #ef4444;">Impossible de joindre le serveur MongoDB.</p>';
  }
}

// ==========================================
// NOTIFICATIONS TOAST
// ==========================================
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-check text-gold"></i>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// CONFIGURATION DES EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Filtres par catégorie
  elements.categoryPills.addEventListener('click', e => {
    if (e.target.classList.contains('cat-pill')) {
      document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      state.filters.category = e.target.dataset.category;
      fetchProducts();
    }
  });

  // Liens de navigation
  document.querySelectorAll('.nav-link[data-filter], .footer-list a[data-filter]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const cat = link.dataset.filter;
      state.filters.category = cat;

      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      document.querySelectorAll('.cat-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === cat);
      });

      fetchProducts();
      document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Marque et Tri
  elements.brandFilter.addEventListener('change', e => {
    state.filters.brand = e.target.value;
    fetchProducts();
  });

  elements.sortFilter.addEventListener('change', e => {
    state.filters.sort = e.target.value;
    fetchProducts();
  });

  // Recherche
  let searchTimeout;
  elements.searchInput.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    elements.clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
    searchTimeout = setTimeout(() => {
      state.filters.search = e.target.value.trim();
      fetchProducts();
    }, 280);
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.clearSearchBtn.style.display = 'none';
    state.filters.search = '';
    fetchProducts();
  });

  // Suppression d'un filtre actif
  elements.filterTags.addEventListener('click', e => {
    const removeType = e.target.dataset.removeTag;
    if (removeType === 'category') {
      state.filters.category = 'Tous';
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.toggle('active', b.dataset.category === 'Tous'));
    } else if (removeType === 'brand') {
      state.filters.brand = 'Toutes';
      elements.brandFilter.value = 'Toutes';
    } else if (removeType === 'search') {
      state.filters.search = '';
      elements.searchInput.value = '';
      elements.clearSearchBtn.style.display = 'none';
    }
    fetchProducts();
  });

  elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
  elements.emptyResetBtn.addEventListener('click', resetAllFilters);

  function resetAllFilters() {
    state.filters = { category: 'Tous', brand: 'Toutes', search: '', sort: 'newest' };
    elements.searchInput.value = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.brandFilter.value = 'Toutes';
    elements.sortFilter.value = 'newest';
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.toggle('active', b.dataset.category === 'Tous'));
    fetchProducts();
  }

  // Clics sur les cartes (pointures, ajout panier, modal)
  elements.productsGrid.addEventListener('click', e => {
    const sizeBtn = e.target.closest('.size-pill');
    if (sizeBtn) {
      const parent = sizeBtn.parentElement;
      parent.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
      sizeBtn.classList.add('active');
      return;
    }

    const addBtn = e.target.closest('.card-cart-btn');
    if (addBtn) {
      const card = addBtn.closest('.product-card');
      const activeSizeBtn = card.querySelector('.size-pill.active');
      const chosenSize = activeSizeBtn ? Number(activeSizeBtn.dataset.size) : null;
      addToCart(addBtn.dataset.id, chosenSize);
      return;
    }

    const qvBtn = e.target.closest('.card-quick-view-btn') || e.target.closest('.card-img-box') || e.target.closest('.card-title');
    if (qvBtn) {
      openQuickView(qvBtn.dataset.id);
    }
  });

  // Panier actions
  elements.cartTrigger.addEventListener('click', openCartDrawer);
  elements.closeCartBtn.addEventListener('click', closeCartDrawer);
  elements.cartBackdrop.addEventListener('click', closeCartDrawer);
  elements.startShoppingBtn.addEventListener('click', () => {
    closeCartDrawer();
    document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
  });

  elements.applyPromoBtn.addEventListener('click', applyPromoCode);
  elements.promoInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyPromoCode();
    }
  });

  // Commande actions
  elements.checkoutTriggerBtn.addEventListener('click', openCheckoutModal);
  elements.closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
  elements.checkoutBackdrop.addEventListener('click', e => {
    if (e.target === elements.checkoutBackdrop) closeCheckoutModal();
  });
  elements.checkoutForm.addEventListener('submit', handleOrderSubmission);

  // Cartes de paiement sélection
  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Modals close
  elements.closeQuickViewBtn.addEventListener('click', closeQuickView);
  elements.quickViewBackdrop.addEventListener('click', e => {
    if (e.target === elements.quickViewBackdrop) closeQuickView();
  });

  elements.successContinueBtn.addEventListener('click', () => {
    elements.successBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  });

  elements.ordersBtn.addEventListener('click', openOrdersHistory);
  elements.closeHistoryBtn.addEventListener('click', () => {
    elements.ordersHistoryBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  });

  // Hero achat rapide
  elements.heroBuyBtn.addEventListener('click', () => {
    if (state.products.length > 0) {
      const heroProd = state.products.find(p => p.brand === 'Berluti') || state.products[0];
      addToCart(heroProd._id);
    }
  });
}

// Global functions for inline html
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
