import axios from 'axios';

/**
 * Helper to load Razorpay script dynamically
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Main function to handle the Razorpay payment flow
 * @param {Object} options - { bookingId, amount, userEmail, userPhone, paymentMethod, onSuccess, onError }
 */
export const handlePayment = async ({ bookingId, amount, userEmail, userPhone, paymentMethod, onSuccess, onError }) => {
  const token = localStorage.getItem('token');
  
  try {
    // 1. Load Razorpay Script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      onError('Razorpay SDK failed to load. Are you online?');
      return;
    }

    // 2. Get Razorpay Config (Key ID)
    const configRes = await axios.get('http://localhost:8080/api/payments/config', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const keyId = configRes.data.data.keyId;

    // 3. Create Razorpay Order in Backend
    const orderRes = await axios.post('http://localhost:8080/api/payments/create-order', {
      bookingId: bookingId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orderData = orderRes.data.data;

    // 4. Open Razorpay Checkout Modal
    const options = {
      key: keyId,
      amount: Math.round(orderData.amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      name: "Blue Bus Booking",
      description: `Payment for Booking #${bookingId}`,
      image: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", // Demo logo
      order_id: orderData.razorpayOrderId,
      handler: async (response) => {
        // Payment successful - Verify with backend
        try {
          const verifyRes = await axios.post('http://localhost:8080/api/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentMethod: paymentMethod || "UPI"
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (verifyRes.data.success) {
            onSuccess(verifyRes.data.data);
          } else {
            onError('Payment verification failed.');
          }
        } catch (err) {
          console.error('Verification Error:', err);
          onError('Error verifying payment.');
        }
      },
      prefill: {
        name: localStorage.getItem('userName') || "Passenger",
        email: userEmail,
        contact: userPhone
      },
      notes: {
        bookingId: bookingId
      },
      theme: {
        color: "#2563eb" // Blue-600
      },
      modal: {
        ondismiss: async () => {
          // Handle payment cancellation
          try {
             await axios.post('http://localhost:8080/api/payments/failed', {
                razorpayOrderId: orderData.razorpayOrderId
             }, {
                headers: { Authorization: `Bearer ${token}` }
             });
          } catch (e) {
             console.error('Failed call error:', e);
          }
          onError('Payment cancelled by user.');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', async (response) => {
      // Payment failed
      try {
        await axios.post('http://localhost:8080/api/payments/failed', {
          razorpayOrderId: response.error.metadata.order_id,
          razorpayPaymentId: response.error.metadata.payment_id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Error marking failed payment:', err);
      }
      onError(`Payment failed: ${response.error.description}`);
    });

    rzp.open();

  } catch (err) {
    console.error('Payment Initialization Error:', err);
    onError(err.response?.data?.message || 'Failed to initialize payment.');
  }
};
