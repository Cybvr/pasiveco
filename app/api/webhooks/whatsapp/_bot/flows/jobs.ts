import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { WhatsAppSession, GREETINGS, welcomeMessage } from "../types";
import { sessionDoc, resetWhatsAppJobSession, resetWhatsAppSession } from "../session";

export async function handleWhatsAppJobApplication(
  from: string,
  session: WhatsAppSession,
  textBody: string,
  _normalizedText: string
) {
  const sessionRef = sessionDoc(from);
  const step = session.step || "job_full_name";

  if (GREETINGS.includes(_normalizedText)) {
    if (step === "complete") {
      await resetWhatsAppJobSession(from);
      return "Hi again! Let's get a new application started for you.\n\nWhat's your full name?";
    }
    
    if (step === "job_full_name") {
      return "Let's get your application started. What's your full name?";
    }

    // For other steps, we might want to remind them where they are
    const stepMessages: Record<string, string> = {
      job_portfolio: "Welcome back. Please send your portfolio link or links to continue your application.",
      job_age: "Welcome back. Please send your age.",
      job_location: "Welcome back. Please send your location.",
      job_role: "Welcome back. Which role are you applying for?",
    };
    
    if (stepMessages[step]) {
      return stepMessages[step];
    }
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

  if (["job_portfolio", "job_age", "job_location", "job_role", "job_screening"].includes(step)) {
    if (!textBody || textBody.length < 3) {
      return "Please send your portfolio link or links.";
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
