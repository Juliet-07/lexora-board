// Dummy data for the Board Directory page (mirrors the prototype's pg-directory).

export interface DirectoryRow {
  id: string;
  name: string;
  designation: string;
  committees: string;
  email: string;
  termExpires: string;
  isYou?: boolean;
}

export const directoryRows: DirectoryRow[] = [
  { id: "dir1", name: "Rudo Barbra Sibanda", designation: "Managing Director, Executive", committees: "All (ex officio)", email: "barbra@lexora.rw", termExpires: "28 Feb 2027" },
  { id: "dir2", name: "Claude Mugabo", designation: "Board Chair, Non-Executive", committees: "Nominations (Chair)", email: "cmugabo@lexora.rw", termExpires: "14 Jun 2027" },
  { id: "dir3", name: "Grace Uwimana", designation: "Independent Non-Executive", committees: "Audit & Risk (Chair)", email: "guwimana@lexora.rw", termExpires: "31 Aug 2027", isYou: true },
  { id: "dir4", name: "Jean Pierre Habimana", designation: "Independent Non-Executive", committees: "Remuneration, Nominations", email: "jphabimana@lexora.rw", termExpires: "31 Aug 2027" },
  { id: "dir5", name: "Amina Niyonzima", designation: "Non-Executive", committees: "Audit & Risk, Social & Ethics", email: "aniyonzima@lexora.rw", termExpires: "14 Jan 2028" },
  { id: "dir6", name: "Eric Nsengimana", designation: "Chief Financial Officer, Executive", committees: "Audit & Risk", email: "ensengimana@lexora.rw", termExpires: "28 Feb 2028" },
  { id: "dir7", name: "David Karenzi", designation: "Alternate Director", committees: "—", email: "dkarenzi@lexora.rw", termExpires: "31 Aug 2029" },
];

export const companySecretary = {
  name: "Rudo Barbra Sibanda",
  email: "cosec@lexora.rw",
  phone: "+250 •• ••• ••••",
};
