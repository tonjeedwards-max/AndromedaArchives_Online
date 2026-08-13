export const STORY_STATUS = {
  in_orbit: { label: "IN ORBIT", subtitle: "Completed", badgeClass: "bg-primary/20 text-primary border-primary/30" },
  lost_in_space: { label: "LOST IN SPACE", subtitle: "On hiatus", badgeClass: "bg-muted text-muted-foreground border-border" },
  in_production: { label: "IN PRODUCTION", subtitle: "Ongoing", badgeClass: "bg-accent/20 text-accent border-accent/30" },
};

export function getStatusInfo(status) {
  return STORY_STATUS[status] || STORY_STATUS.in_orbit;
}
