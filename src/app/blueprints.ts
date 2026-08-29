export const blueprints = {
  standardCheckout: {
    plan: "Instantly deployed Standard Checkout blueprint.",
    files: [
      {
        name: "frontend/Checkout.tsx",
        content: `import React from 'react';\n\nexport default function Checkout() {\n  return (\n    <button onClick={() => alert('Razorpay Standard Checkout')}>Pay Now</button>\n  );\n}`
      },
      {
        name: "backend/order.ts",
        content: `import Razorpay from 'razorpay';\n\nconst rzp = new Razorpay({ key_id: '...', key_secret: '...' });\n\nexport const createOrder = async () => {\n  return await rzp.orders.create({ amount: 50000, currency: 'INR' });\n};`
      },
      {
        name: "webhook/handler.ts",
        content: `import crypto from 'crypto';\n\nexport const verifyWebhook = (body, signature, secret) => {\n  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');\n  return expected === signature;\n};`
      }
    ],
    simulatedError: "Missing crypto.createHmac verification",
    healedFiles: [
      {
        name: "frontend/Checkout.tsx",
        content: `import React from 'react';\n\nexport default function Checkout() {\n  return (\n    <button onClick={() => alert('Razorpay Standard Checkout')}>Pay Now</button>\n  );\n}`
      },
      {
        name: "backend/order.ts",
        content: `import Razorpay from 'razorpay';\n\nconst rzp = new Razorpay({ key_id: '...', key_secret: '...' });\n\nexport const createOrder = async () => {\n  return await rzp.orders.create({ amount: 50000, currency: 'INR' });\n};`
      },
      {
        name: "webhook/handler.ts",
        content: `import crypto from 'crypto';\n\nexport const verifyWebhook = (body, signature, secret) => {\n  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');\n  if(expected !== signature) throw new Error('Invalid Signature');\n  return true;\n};`
      }
    ]
  },
  mobileSubscription: {
    plan: "Instantly deployed Mobile Subscription blueprint.",
    files: [
      {
        name: "mobile/SubscriptionScreen.tsx",
        content: `import React from 'react';\nimport { View, Button } from 'react-native';\n\nexport default function Subscription() {\n  return <View><Button title="Subscribe" onPress={() => {}} /></View>;\n}`
      },
      {
        name: "backend/subscription.ts",
        content: `import Razorpay from 'razorpay';\n\nexport const createSubscription = async () => {\n  // Implementation for recurring billing\n};`
      },
      {
        name: "webhook/idempotency.ts",
        content: `export const handleWebhook = (payload, headers) => {\n  // Webhook handler logic\n};`
      }
    ],
    simulatedError: "Duplicate Order Created. Missing Idempotency Key.",
    healedFiles: [
      {
        name: "mobile/SubscriptionScreen.tsx",
        content: `import React from 'react';\nimport { View, Button } from 'react-native';\n\nexport default function Subscription() {\n  return <View><Button title="Subscribe" onPress={() => {}} /></View>;\n}`
      },
      {
        name: "backend/subscription.ts",
        content: `import Razorpay from 'razorpay';\n\nexport const createSubscription = async () => {\n  // Implementation for recurring billing\n};`
      },
      {
        name: "webhook/idempotency.ts",
        content: `export const handleWebhook = (payload, headers) => {\n  const idempotencyKey = headers['x-idempotency-key'];\n  if(!idempotencyKey) throw new Error('Missing key');\n};`
      }
    ]
  },
  b2bLinks: {
    plan: "Instantly deployed B2B Payment Links blueprint.",
    files: [
      {
        name: "python/create_link.py",
        content: `import razorpay\n\nclient = razorpay.Client(auth=("...", "..."))\n\ndef create_payment_link():\n    return client.payment_link.create({"amount": 500, "currency": "INR"})`
      },
      {
        name: "python/webhook.py",
        content: `def handle_webhook(request):\n    # Process payment link success\n    pass`
      }
    ],
    simulatedError: "Invalid amount. Razorpay expects integer paise.",
    healedFiles: [
      {
        name: "python/create_link.py",
        content: `import razorpay\nimport math\n\nclient = razorpay.Client(auth=("...", "..."))\n\ndef create_payment_link(amount):\n    # Enforce integer paise\n    paise = math.round(amount * 100)\n    return client.payment_link.create({"amount": paise, "currency": "INR"})`
      },
      {
        name: "python/webhook.py",
        content: `def handle_webhook(request):\n    # Process payment link success\n    pass`
      }
    ]
  }
};
