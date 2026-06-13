/**
 * Razorpay payment flow
 */
import { getBookById } from '../data/catalog.js';
import { setState, generateSessionId } from '../state/store.js';
import { RAZORPAY_KEY_ID, STORE_NAME } from '../config.js';

let overlay = null;
let currentBook = null;

export function openPayment(bookId) {
  currentBook = getBookById(bookId);
  if (!currentBook || !currentBook.premium) return;

  overlay = createPaymentModal();
  document.getElementById('modal-root').appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('modal-overlay--active'));
}

function createPaymentModal() {
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="modal glass payment-modal">

    <button class="modal-close" type="button" aria-label="Close">
        ✕
    </button>

    <div class="payment-header">
        <span class="payment-badge">🔒 Secure Payment</span>
        <h3 class="modal-title">Complete Your Purchase</h3>
        <p class="payment-subtitle">
            Instant access after successful payment
        </p>
    </div>

    <div class="payment-book-info">

        <div class="payment-cover-wrapper">
            <img
                class="payment-book-cover"
                src="${currentBook.cover}"
                alt="${currentBook.title}"
            />
        </div>

        <div class="payment-book-details">
            <h4>${currentBook.title}</h4>

            <p class="payment-author">
                ${currentBook.author}
            </p>

            <div class="payment-price-box">
                <span class="price-label">Total Amount</span>
                <span class="payment-price">
                    ₹${currentBook.price}
                </span>
            </div>
        </div>

    </div>

    <div class="payment-features">

        <div class="feature-item">
            ⚡ Instant Download
        </div>

        <div class="feature-item">
            🔐 Secure Checkout
        </div>

        <div class="feature-item">
            📱 Read On Any Device
        </div>

    </div>

    <div class="payment-note">
        Powered by Razorpay Secure Gateway
    </div>

    <button
        class="btn payment-btn"
        id="payment-checkout"
        type="button"
    >
        <span class="btn-glow"></span>
        <span class="btn-text">
            Pay ₹${currentBook.price}
        </span>
    </button>

</div>
  `;

  el.querySelector('.modal-close').addEventListener('click', closePayment);
  el.addEventListener('click', (e) => { if (e.target === el) closePayment(); });
  el.querySelector('#payment-checkout').addEventListener('click', launchRazorpay);

  return el;
}

function launchRazorpay() {

  console.log('Razorpay Key:', RAZORPAY_KEY_ID);

  if (typeof Razorpay === 'undefined') {
    alert('Razorpay checkout failed to load. Check your connection and try again.');
    return;
  }

  if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes('PASTE_HERE')) {
    alert('Razorpay key not configured. Set RAZORPAY_KEY_ID in js/config.js');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: currentBook.price * 100,
    currency: 'INR',
    name: STORE_NAME,
    description: currentBook.title,
    image: currentBook.cover,
    handler(response) {
      completePayment(response.razorpay_payment_id);
    },
    modal: {
      ondismiss() {
        closePayment();
      }
    },
    theme: { color: '#7C3AED' }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', () => {
    closePayment();
  });
  rzp.open();
}
function completePayment(paymentId) {
  setState({
    purchase: {
      book_id: currentBook.id,
      book_title: currentBook.title,
      payment_id: paymentId,
      status: 'success'
    },
    timestamp: new Date().toISOString(),
    session_id: generateSessionId()
  }, 'purchase.complete');

  closePayment();
  window.dispatchEvent(new CustomEvent('iqra:user-form', { detail: { bookId: currentBook.id } }));
}

function closePayment() {
  if (!overlay) return;
  overlay.classList.remove('modal-overlay--active');
  setTimeout(() => {
    overlay?.remove();
    overlay = null;
  }, 400);
}
