export const loadRazorpaySdk = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      if (window.Razorpay) {
        resolve(true)
      } else {
        reject(new Error('Razorpay SDK loaded but window.Razorpay is not defined'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.head.appendChild(script)
  })
}

export const openRazorpay = async ({ orderId, paymentOrder, name, email, phone, onPaymentSuccess }) => {
  try {
    const scriptLoaded = await loadRazorpaySdk()
    if (!scriptLoaded) {
      throw new Error('Unable to load Razorpay SDK')
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not available')
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: paymentOrder.razorpayKeyId,
        amount: paymentOrder.paymentOrder.amount,
        currency: paymentOrder.paymentOrder.currency,
        name: 'Fresh Bite',
        description: 'Complete your payment',
        order_id: paymentOrder.paymentOrder.id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        notes: {
          orderId,
        },
        theme: {
          color: '#0f172a',
        },
        handler: async (response) => {
          try {
            if (typeof onPaymentSuccess === 'function') {
              await onPaymentSuccess(response)
            }
            resolve(response)
          } catch (error) {
            reject(error)
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled. Please try again.')),
        },
      }

      try {
        const razorpayInstance = new window.Razorpay(options)
        razorpayInstance.open()
      } catch (error) {
        reject(error)
      }
    })
  } catch (error) {
    throw error
  }
}

// UPI Intent Flow Payment
export const openUPIIntentPayment = async ({
  orderId,
  amount,
  currency,
  name,
  email,
  phone,
  vpa,
  razorpayKeyId,
  onPaymentSuccess,
  onPaymentPending,
}) => {
  try {
    const scriptLoaded = await loadRazorpaySdk()
    if (!scriptLoaded) {
      throw new Error('Unable to load Razorpay SDK')
    }

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not available')
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: razorpayKeyId,
        amount: amount,
        currency: currency,
        name: 'Fresh Bite',
        description: 'Complete your payment',
        prefill: {
          name,
          email,
          contact: phone,
        },
        notes: {
          orderId,
          paymentMethod: 'upi',
        },
        theme: {
          color: '#0f172a',
        },
        method: 'upi',
        handler: async (response) => {
          try {
            if (typeof onPaymentSuccess === 'function') {
              await onPaymentSuccess(response)
            }
            resolve(response)
          } catch (error) {
            reject(error)
          }
        },
        modal: {
          ondismiss: () => {
            if (typeof onPaymentPending === 'function') {
              onPaymentPending()
            }
            reject(new Error('Payment pending or cancelled. Please check payment status.'))
          },
        },
      }

      // If VPA is provided, add it to options
      if (vpa) {
        options.vpa = vpa
      }

      try {
        const razorpayInstance = new window.Razorpay(options)
        razorpayInstance.open()
      } catch (error) {
        reject(error)
      }
    })
  } catch (error) {
    throw error
  }
}

// Alternative: Show QR code or short URL for UPI intent payment
export const showUPIPaymentModal = async ({ shortUrl, paymentStatus, onStatusCheck }) => {
  return new Promise((resolve) => {
    // Create a simple modal showing the short URL as QR or clickable link
    const modal = document.createElement('div')
    modal.id = 'upi-payment-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `

    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `

    content.innerHTML = `
      <h2 style="margin-bottom: 1rem; color: #0f172a;">Complete Your UPI Payment</h2>
      <p style="color: #666; margin-bottom: 1rem;">Scan the QR code or click the link below to complete payment</p>
      <div style="background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
        <a href="${shortUrl}" target="_blank" style="color: #0f172a; text-decoration: none; word-break: break-all;">
          ${shortUrl}
        </a>
      </div>
      <div style="margin-bottom: 1rem;">
        <button id="check-payment-status" style="
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        ">
          Check Payment Status
        </button>
      </div>
      <button id="close-upi-modal" style="
        background: #e5e7eb;
        color: #0f172a;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1rem;
      ">
        Close
      </button>
    `

    modal.appendChild(content)
    document.body.appendChild(modal)

    const checkStatusBtn = document.getElementById('check-payment-status')
    const closeBtn = document.getElementById('close-upi-modal')

    checkStatusBtn.addEventListener('click', async () => {
      if (typeof onStatusCheck === 'function') {
        await onStatusCheck()
      }
    })

    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal)
      resolve()
    })
  })
}
