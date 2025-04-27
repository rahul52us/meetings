// services/organisationService.ts

const predefinedData = [
    { value: "invoices", label: "Invoices" },
    { value: "receipt", label: "Receipt" },
    { value: "bills", label: "Bills" },
    { value: "certificates", label: "Certificates" },
    { value: "reports", label: "Reports" },
    { value: "letters", label: "Letters" },
    { value: "contracts", label: "Contracts" },
    { value: "statements", label: "Statements" },
    { value: "memos", label: "Memos" },
    { value: "agreements", label: "Agreements" },
    { value: "manuals", label: "Manuals" },
    { value: "proposals", label: "Proposals" },
    { value: "budgets", label: "Budgets" },
    { value: "plans", label: "Plans" },
    { value: "schedules", label: "Schedules" },
    { value: "notices", label: "Notices" },
    { value: "licenses", label: "Licenses" },
    { value: "permits", label: "Permits" },
    { value: "applications", label: "Applications" },
    { value: "forms", label: "Forms" },
  ];
  
  export const getChooseInputService = (): { value: string; label: string }[] => {
    return predefinedData;
  };
  