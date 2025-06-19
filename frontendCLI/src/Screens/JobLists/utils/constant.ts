export const COLUMN_WIDTHS = {
  jobType: 140,
  jobTitle: 180,
  jobScope: 180,
  employerName: 160,
  agentName: 160,
  createdBy: 160,
  actions: 80,
};

export const columns = [
    { key: 'profileId', title: 'Job Type', width: COLUMN_WIDTHS.jobType },
    { key: 'JobTitle', title: 'Job Title', width: COLUMN_WIDTHS.jobTitle },
    { key: 'Job Scope', title: 'jobScope', width: COLUMN_WIDTHS.jobScope },
    { key: 'Employer Name', title: 'employerName', width: COLUMN_WIDTHS.employerName },
    { key: 'Agent Name', title: 'agentName', width: COLUMN_WIDTHS.agentName },
    { key: 'createdBy', title: 'Created By', width: COLUMN_WIDTHS.createdBy },
    { key: 'actions', title: 'Actions', width: COLUMN_WIDTHS.actions },
];