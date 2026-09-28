// Browser-safe part of the case status model (no database or Node imports), so client
// components such as the admin status buttons can use the same labels and rules as the server.

/** The statuses staff see, the same for both kinds of case. */
export type CaseStatus = 'new' | 'pending' | 'verified' | 'counterfeit';
export type CaseKind = 'verification' | 'legacy';

export const CASE_STATUS_LABEL: Record<CaseStatus, string> = {
  new: 'New',
  pending: 'Pending review',
  verified: 'Verified',
  counterfeit: 'Counterfeit',
};

/** What staff can set. "New" is only ever the starting status of a submitted case. */
export const SETTABLE_STATUSES: CaseStatus[] = ['pending', 'verified', 'counterfeit'];
