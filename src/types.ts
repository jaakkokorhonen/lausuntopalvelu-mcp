// OData-wrapperit
export interface ODataList<T> {
  d: T[];
}

export interface ODataItem<T> {
  d: T;
}

// Proposal-rajapinta
export interface Proposal {
  Id: string;
  Name: string;
  Goals: string | null;
  Deadline: string | null;
  ClosingDate: string | null;
  ApprovalStatus: number;
  ApprovedOn: string | null;
  PublishedOn: string | null;
  RegisterNumber: string | null;
  OrganizationName: string | null;
  OrganizationId: string | null;
}

// Question-rajapinta
export interface Question {
  Id: string;
  Type: string;
  Order: number;
  Header: string | null;
  IsMandatory: boolean;
  ProposalId: string;
}

// Answer-rajapinta
export interface Answer {
  Id: string;
  ProposalId: string;
  ParticipantId: string;
  QuestionID: string;
  QuestionOptionId: string | null;
  QuestionOptionColumnId: string | null;
  TextAnswer: string | null;
  AttachedTextAnswer: string | null;
  RegisterNumber: string | null;
}

// Participant-rajapinta
export interface Participant {
  Id: string;
  ProposalId: string;
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  RespondingStarted: string | null;
  RespondingEnded: string | null;
}

// Organization-rajapinta
export interface Organization {
  Id: string;
  Name: string;
}
