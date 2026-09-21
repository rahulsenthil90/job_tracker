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

export const applications: Application[] = [
  { id: "northwind", role: "Senior Product Designer", company: "Northwind Studio", location: "Remote", date: "2026-09-19", platform: "Referral", status: "Interview", initials: "NS", source: "We’re looking for a Senior Product Designer to lead end-to-end product work across our collaboration platform. Remote role with a cross-functional product team.", notes: "Portfolio review went well. Prepare two systems-thinking examples for the next conversation." },
  { id: "cobalt", role: "Frontend Engineer", company: "Cobalt Labs", location: "Bengaluru", date: "2026-09-17", platform: "LinkedIn", status: "Offer", initials: "CL", source: "Frontend Engineer — React, TypeScript and design systems. Hybrid role based in Bengaluru.", notes: "Offer call scheduled for Friday. Ask about the learning budget and flexible work policy." },
  { id: "meridian", role: "Product Manager", company: "Meridian Health", location: "Remote", date: "2026-09-15", platform: "Company site", status: "Screening", initials: "MH", source: "Product Manager, patient experience. Own discovery and delivery with clinical and engineering partners.", notes: "Recruiter requested availability and current notice period." },
  { id: "lumen", role: "UX Researcher", company: "Lumen & Co", location: "Mumbai", date: "2026-09-12", platform: "Indeed", status: "Applied", initials: "LC", source: "UX Researcher to plan mixed-method studies and make customer evidence accessible to product teams.", notes: "Follow up if there is no response by September 24." },
  { id: "brightpath", role: "Design Systems Lead", company: "Brightpath", location: "Pune", date: "2026-09-08", platform: "Naukri", status: "Interview", initials: "BP", source: "Lead the evolution of a multi-brand design system and mentor a small platform team.", notes: "Take-home exercise submitted." },
  { id: "atlas", role: "Product Designer", company: "Atlas Works", location: "Hyderabad", date: "2026-08-29", platform: "LinkedIn", status: "Applied", initials: "AW", source: "Product Designer for workflow automation products used by operations teams.", notes: "Connection at Atlas shared the hiring manager’s profile." },
];

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