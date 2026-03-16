export const billingStats = [
  {
    title: "Active Subscribers",
    value: "1,284",
    description: "+4.5% vs last month",
    type: "trend",
    trend: "up"
  },
  {
    title: "Monthly Recurring",
    value: "$14,560.00",
    description: "Projected MRR",
    type: "static"
  },
  {
    title: "Avr. Revenue/User",
    value: "$32.50",
    description: "Up from $31.00",
    type: "static"
  },
  {
    title: "Churn Rate",
    value: "2.4%",
    description: "Increased slightly",
    type: "danger"
  }
];

export const subscribers = [
  {
    id: "SUB-001",
    name: "Alex Johnson",
    email: "alex@example.com",
    plan: "Pro Monthly",
    amount: "$29/mo",
    status: "Active",
    joined: "Jan 12, 2024",
    renewalDate: "Apr 12, 2024",
    paymentMethod: "Visa •••• 2445",
  },
  {
    id: "SUB-002",
    name: "Maria Garcia",
    email: "m.garcia@test.io",
    plan: "Basic Annual",
    amount: "$199/yr",
    status: "Active",
    joined: "Feb 05, 2024",
    renewalDate: "Feb 05, 2025",
    paymentMethod: "Mastercard •••• 1021",
  },
  {
    id: "SUB-003",
    name: "Kevin Lee",
    email: "klee@hq.com",
    plan: "Pro Monthly",
    amount: "$29/mo",
    status: "Canceled",
    joined: "Nov 20, 2023",
    renewalDate: "Canceled",
    paymentMethod: "Visa •••• 4451",
  },
  {
    id: "SUB-004",
    name: "Emma Davis",
    email: "emma.d@web.com",
    plan: "Business",
    amount: "$99/mo",
    status: "Active",
    joined: "Mar 01, 2024",
    renewalDate: "Apr 01, 2024",
    paymentMethod: "Amex •••• 9001",
  },
  {
    id: "SUB-005",
    name: "Robert Chen",
    email: "r.chen@tech.com",
    plan: "Pro Monthly",
    amount: "$29/mo",
    status: "Retrying",
    joined: "Dec 15, 2023",
    renewalDate: "Mar 20, 2024",
    paymentMethod: "Visa •••• 2088",
  },
];

export const subscriptionTimeline = {
  "SUB-001": ["Subscription started on Jan 12, 2024", "Renewed on Mar 12, 2024", "Payment succeeded"],
  "SUB-002": ["Annual plan started on Feb 05, 2024", "Welcome discount applied", "Payment succeeded"],
  "SUB-003": ["Subscription started on Nov 20, 2023", "Cancellation requested on Feb 18, 2024", "Canceled on Mar 01, 2024"],
  "SUB-004": ["Subscription started on Mar 01, 2024", "Seat add-on purchased on Mar 08, 2024", "Payment succeeded"],
  "SUB-005": ["Subscription started on Dec 15, 2023", "Payment retry in progress", "Customer notified"],
} as const;
