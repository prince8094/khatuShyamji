const fs = require('fs');
const data = `
export const announcements = [
  { id: 1, text: "Ekadashi rush expected this weekend. Devotees are advised to arrive before **7:00 AM**." },
  { id: 2, text: "Special Aarti on **Purnima**. All devotees are cordially invited." },
  { id: 3, text: "Temple will remain open until **11:00 PM** on Saturdays." },
  { id: 4, text: "VIP Darshan booking will be unavailable due to maintenance." },
  { id: 5, text: "Free Prasad distribution at **12:00 PM** daily." },
]
`;
fs.appendFileSync('lib/data.ts', data);
