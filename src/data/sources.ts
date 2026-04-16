// Placeholder for Tamil Nadu datasets — Part 2
// Data sources:
// - HMIS India (Health Management Information System)
// - NHP (National Health Profile)
// - TNHSP (Tamil Nadu Health Systems Project)
// - DME Tamil Nadu (Directorate of Medical Education)

export const DATA_SOURCES = {
  hmis: { name: "HMIS India", url: "https://hmis.nhp.gov.in", type: "Government" },
  nhp: { name: "National Health Profile", url: "https://cbhidghs.nic.in", type: "Government" },
  tnhsp: { name: "TN Health Systems Project", url: "https://www.tnhealth.tn.gov.in", type: "State" },
  dme: { name: "DME Tamil Nadu", url: "https://www.tnmedicalselection.org", type: "State" },
} as const;
