export const payoutStats = [
  {
    title: "Next Scheduled",
    value: "Mar 15, 2024",
    description: "Auto weekly transfer",
    status: "primary"
  },
  {
    title: "Total Paid Out",
    value: "$10,440.00",
    description: "Successfully cleared",
    status: "success"
  },
  {
    title: "Pending Payouts",
    value: "$1,560.00",
    description: "Currently processing",
    status: "warning"
  },
  {
    title: "Unpaid Earnings",
    value: "$890.00",
    description: "Below $1,000 threshold",
    status: "muted"
  }
];

export const payouts = [
  { id: "PAY-001", amount: "$1,200.00", date: "Mar 01, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
  { id: "PAY-002", amount: "$850.00", date: "Feb 15, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
  { id: "PAY-003", amount: "$2,100.00", date: "Feb 01, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
  { id: "PAY-004", amount: "$420.00", date: "Jan 15, 2024", method: "Bank Transfer (**** 4567)", status: "Completed" },
];

export const payoutMethod = {
  bankName: "Chase Bank Business",
  accountInfo: "Checking •••• 4567",
  settings: [
    { label: "Minimum Threshold", value: "$100.00" },
    { label: "Payment Frequency", value: "Every Friday" }
  ]
};
