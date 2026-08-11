export type MemberListItem = {
  id: string;
  name: string;
  partyName: string | null;
  ideology: "진보" | "보수" | null;
  districtType: "지역구" | "비례";
  districtName: string | null;
  photoUrl: string | null;
};

export type MemberBill = {
  id: string;
  title: string;
  status: string;
  proposedDate: string;
  role: "대표발의" | "공동발의";
  assemblyBillId: string | null;
};

export type MemberVote = {
  id: string;
  billId: string;
  billTitle: string;
  result: string;
  votedAt: string;
  assemblyBillId: string | null;
};

export type MemberDetail = MemberListItem & {
  bills: MemberBill[];
  votes: MemberVote[];
};
