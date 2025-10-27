// lib/categories.ts
export const categoryMap: Record<string, string[]> = {
  "Legal": [
    "Lease Agreements",
    "Vacating Notice",
    "Letter to tenants",
    "Employees letters",
    "Contract reviews",
    "New Contracts Binding",
    "Legal documents",
    "Verification of documents"
  ],
  "Customer Service": [
    "Complaints/Issues",
    "Repairs",
    "Follow-up on late payments"
  ],
  "Accounts": [
    "Payment Reconciliation",
    "Payment to Suppliers",
    "Payment to Contractors",
    "Petty Cash Reconciliation",
    "Sales Reconciliation (Jatflora) ETR",
    "Mumbu ETR Jatflora",
    "Data Entry in QuickBooks (Jatflora)",
    "Office Supplies",
    "Accounting Activities"
  ],
  "Security": [
    "Access update",
    "Emergency updates",
    "Incident Reports",
    "Security notifications"
  ],
  "Potential Tenants": [
    "Scheduling Appointments",
    "Follow-up with the potential client",
    "Processing Documents",
    "Onboarding process"
  ],
  "HR": [
    "Onboarding Staff",
    "Annual Leave",
    "Staff Welfare",
    "Sick Leave",
    "Staff Request",
    "Staff Occupation equipments"
  ],
  "Suppliers": [
    "Receiving Invoices",
    "Processing Invoices",
    "Scheduling Services",
    "Addressing concerns",
    "Quotation review & Examination"
  ],
  "Contractors": [
    "Scheduling Assessment",
    "Scheduling Repairs",
    "Follow-up for Invoices and Quotations",
    "Follow-up on repairs",
    "Verification of the job done",
    "Report to Director"
  ]
};

export const statusNames = ["To Do", "Pending", "Done", "On Hold"];

export const statusColors = {
  1: { bg: "#7c3aed", text: "#ffffff" },
  2: { bg: "#f59e0b", text: "#0b0b0b" },
  3: { bg: "#10b981", text: "#ffffff" },
  4: { bg: "#2563eb", text: "#ffffff" }
};