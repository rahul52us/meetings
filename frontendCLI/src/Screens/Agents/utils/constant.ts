export const COLUMN_WIDTHS = {
  profileId: 100,
  name: 160,
  email: 180,
  username: 120,
  aadharNumber: 120,
  agentType: 120,
  isActive: 100,
  actions: 80,
};

export const columns = [
    { key: 'profileId', title: 'Agent ID', width: COLUMN_WIDTHS.profileId },
    { key: 'name', title: 'Name', width: COLUMN_WIDTHS.name },
    { key: 'email', title: 'Email', width: COLUMN_WIDTHS.email },
    { key: 'username', title: 'Mobile No.', width: COLUMN_WIDTHS.username },
    { key: 'aadharNumber', title: 'Aadhar No.', width: COLUMN_WIDTHS.aadharNumber },
    { key: 'agentType', title: 'Agent Type', width: COLUMN_WIDTHS.agentType },
    { key: 'isActive', title: 'Verified', width: COLUMN_WIDTHS.isActive },
    { key: 'actions', title: 'Actions', width: COLUMN_WIDTHS.actions },
];