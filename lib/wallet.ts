export const walletStats = [
  {
    title: "Available Balance",
    value: "$2,450.00",
    description: "+12% from last month",
    type: "trend",
    trend: "up"
  },
  {
    title: "Total Earnings",
    value: "$12,890.00",
    description: "Lifetime revenue",
    type: "static"
  },
  {
    title: "Pending Clearance",
    value: "$420.00",
    description: "Expected within 3-5 days",
    type: "italic"
  }
];

export const transactions = [
  { id: "INV001", customer: "John Doe", type: "Sale", amount: "$45.00", date: "Mar 12, 2024", status: "Paid" },
  { id: "INV002", customer: "Jane Smith", type: "Subscription", amount: "$15.00", date: "Mar 11, 2024", status: "Paid" },
  { id: "INV003", customer: "Michael Brown", type: "Sale", amount: "$120.00", date: "Mar 10, 2024", status: "Paid" },
  { id: "INV004", customer: "Sarah Wilson", type: "Sale", amount: "$25.00", date: "Mar 09, 2024", status: "Pending" },
  { id: "INV005", customer: "Chris Evans", type: "Refund", amount: "-$30.00", date: "Mar 08, 2024", status: "Refunded" },
];
