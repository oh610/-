export type PresidentProfile = {
  id: string;
  name: string;
  photoUrl: string | null;
  termStart: string | null;
  bio: string | null;
  updatedAt: string;
};

export type ApprovalRating = {
  id: string;
  surveyDate: string;
  agency: string;
  approvalPercent: number;
  disapprovalPercent: number | null;
  sourceUrl: string | null;
};

export type PledgeStatus = "추진 전" | "추진 중" | "이행 완료";

export type Pledge = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  status: PledgeStatus;
  sourceUrl: string | null;
  displayOrder: number;
};
