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

export type PledgeItem = {
  id: string;
  content: string;
  status: PledgeStatus;
  sourceUrl: string | null;
  displayOrder: number;
};

export type Pledge = {
  id: string;
  title: string;
  category: string | null;
  sourceUrl: string | null;
  displayOrder: number;
  items: PledgeItem[];
  completionPercent: number | null;
};

export type PledgeItemNews = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type PledgeItemDetail = {
  id: string;
  content: string;
  status: PledgeStatus;
  sourceUrl: string | null;
  pledgeId: string;
  pledgeTitle: string;
  category: string | null;
  news: PledgeItemNews[];
};
