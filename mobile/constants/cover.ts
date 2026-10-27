/**
 * Opening home screen. Therapist photos and names stay empty until the
 * client sends them.
 */
export const coverQuestion = "How can I help my child to communicate?";

export const coverCredit = "written by Speech and Language Therapists";

export type CoverAuthor = {
  name: string;
};

export const coverAuthors: CoverAuthor[] = [];

export const coverBackground = require("../assets/cover-background.jpg");
