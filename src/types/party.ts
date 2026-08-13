export type PartyListItem = {
  id: string;
  name: string;
  ideology: "진보" | "보수";
  memberCount: number;
};

export type PartyNewsItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type PartyMemberItem = {
  id: string;
  name: string;
  photoUrl: string | null;
  districtType: "지역구" | "비례";
  districtName: string | null;
};

export type PartyDetail = {
  id: string;
  name: string;
  ideology: "진보" | "보수";
  description: string | null;
  homepageUrl: string | null;
  members: PartyMemberItem[];
  news: PartyNewsItem[];
};
