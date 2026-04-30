import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { WhatsAppSession, GREETINGS, welcomeMessage } from "../types";
import { sessionDoc, resetWhatsAppJobSession, resetWhatsAppSession } from "../session";
import { hasPortfolioReference } from "../utils";

export async function handleWhatsAppJobApplication(
  from: string,
  session: WhatsAppSession,
  textBody: string,
  normalizedText: string // renamed from _normalizedText — it IS used throughout
) {
  const sessionRef = sessionDoc(from);
  const step = session.step || "job_full_name";

  if (GREETINGS.includes(normalizedText)) {
    if (step === "complete") {
      await resetWhatsAppSession(from, "welcome");
      return welcomeMessage;
    }

    if (step === "job_full_name") {
      return "Let's get your application started. What's your full name?";
    }

    if (step === "job_portfolio") {
      return "Welcome back. Please send your portfolio link or links to continue your application.";
    }

    // Any other step: fall through to normal handling below.
    // Returning here avoids silent fallthrough if new steps are added later.
    return "Welcome back. Please continue your application.";
  }

  if (step === "job_full_name") {
    if (!textBody || textBody.length < 2) {
      return "Please send your full name.";
    }

    await sessionRef.set(
      {
        flow: "jobs",
        step: "job_portfolio",
        candidateFullName: textBody,
        candidatePhone: from,
        candidateAge: FieldValue.delete(),
        candidateLocation: FieldValue.delete(),
        jobRole: FieldValue.delete(),
        jobId: FieldValue.delete(),
        screeningQuestionIndex: FieldValue.delete(),
        screeningAnswers: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return "Thanks. Send your portfolio link or links.";
  }

  // Only job_portfolio is a real reachable step here. The previous code
  // also included job_age, job_location, job_role, job_screening in this
  // array, but those are ghost states — the flow never routes there naturally
  // after job_full_name. Keeping them would silently accept any input on
  // those steps as a portfolio submission, masking bugs when the step chain
  // is extended. They are removed until the full multi-step flow is built.
  if (step === "job_portfolio") {
    if (!textBody || !hasPortfolioReference(textBody)) {
      return "Please send a portfolio link or social handle, like https://yourportfolio.com or @yourhandle.";
    }

    const applicationId = await createWhatsAppJobApplication(from, {
      ...session,
      candidatePortfolioLinks: textBody,
    });

    await sessionRef.set(
      {
        step: "complete",
        flow: "jobs",
        candidatePortfolioLinks: textBody,
        jobApplicationId: applicationId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return "Done. Your application has been received.\n\nOur team will review it and contact you here on WhatsApp if you're shortlisted.";
  }

  if (step === "complete") {
    return "Your job application has already been received. Reply jobs if you want to start a new application.";
  }

  // Unrecognised step — reset to the start of the job flow.
  await resetWhatsAppJobSession(from);
  return "Let's get your application started.\n\nWhat's your full name?";
}

export async function createWhatsAppJobApplication(from: string, session: WhatsAppSession) {
  const portfolioLinks = session.candidatePortfolioLinks || "";
  const message = portfolioLinks ? `Portfolio links:\n${portfolioLinks}` : "";

  const applicationRef = await db.collection("job_applications").add({
    jobId: session.jobId || "whatsapp-job-application",
    jobTitle: session.jobRole || "WhatsApp Job Application",
    fullName: session.candidateFullName || "WhatsApp Candidate",
    email: "",
    phoneNumber: session.candidatePhone || from,
    age: null,
    location: "",
    portfolioUrl: portfolioLinks,
    message,
    source: "whatsapp",
    whatsappId: from,
    screeningAnswers: [],
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return applicationRef.id;
}
