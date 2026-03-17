export const earningsStats = [
  { title: "Last Month", value: "$500" },
  { title: "This Month", value: "$250" },
  { title: "Total", value: "$15,750" },
]

export const earningsTransactions = [
  { id: "abc123", amount: "+$100", date: "2025-01-15", customer: "Alice", type: "Booking", status: "Paid" },
  { id: "def456", amount: "+$200", date: "2025-01-17", customer: "Bob", type: "Session", status: "Pending" },
  { id: "ghi789", amount: "-$50", date: "2025-01-20", customer: "Refund", type: "Refund", status: "Failed" },
]

export const getEarningById = (id: string) => earningsTransactions.find((item) => item.id === id)
