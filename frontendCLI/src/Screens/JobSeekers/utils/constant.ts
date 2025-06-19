export const COLUMN_WIDTHS = {
  profileId: 100,
  name: 160,
  email: 200,
  username: 120,
  aadharNumber: 160,
  isActive: 180,
  actions: 80,
};

export const columns = [
    { key: 'profileId', title: 'Seeker Id', width: COLUMN_WIDTHS.profileId },
    { key: 'name', title: 'Name', width: COLUMN_WIDTHS.name },
    { key: 'email', title: 'Email', width: COLUMN_WIDTHS.email },
    { key: 'username', title: 'Mobile No.', width: COLUMN_WIDTHS.username },
    { key: 'aadharNumber', title: 'Aadhar No.', width: COLUMN_WIDTHS.aadharNumber },
    { key: 'isActive', title: 'Verified', width: COLUMN_WIDTHS.isActive },
    { key: 'actions', title: 'Actions', width: COLUMN_WIDTHS.actions },
];