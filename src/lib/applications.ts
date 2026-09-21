export type Application = {
  id: string;
  role: string;
  company: string;
  location: string;
  date: string;
  platform: "LinkedIn" | "Naukri" | "Indeed" | "Company site" | "Referral";
  status: "Applied" | "Screening" | "Interview" | "Offer";
  initials: string;
  source: string;
  notes: string;
};



export const platformTone: Record<Application["platform"], string> = {
  LinkedIn: "bg-platform-linkedin text-platform-linkedin-foreground",
  Naukri: "bg-platform-naukri text-platform-naukri-foreground",
  Indeed: "bg-platform-indeed text-platform-indeed-foreground",
  "Company site": "bg-secondary text-secondary-foreground",
  Referral: "bg-highlight text-primary",
};

export const statusTone: Record<Application["status"], string> = {
  Applied: "bg-secondary text-muted-foreground",
  Screening: "bg-highlight text-primary",
  Interview: "bg-highlight text-primary",
  Offer: "bg-success-soft text-success",
};