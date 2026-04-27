import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { WhatsAppSession, JOB_ROLE_ALIASES, JOB_ROLES, jobRoleMessage } from "../types";
import { sessionDoc, resetWhatsAppJobSession } from "../session";

export async function handleWhatsAppJobApplication(
  from: string,
  session: WhatsAppSession,
  textBody: string,
  normalizedText: string
) {
  const sessionRef = sessionDoc(from);
  const step = session.step || "job_full_name";

  if (step === "job_full_name") {
    if (!textBody || textBody.length < 2) {
      return "Please send your full name.";
    }

    await sessionRef.set(
      {
        flow: "jobs",
        step: "job_age",
        candidateFullName: textBody,
        candidatePhone: from,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return "Thanks. How old are you?";
  }

  if (step === "job_age") {
    const age = Number(textBody.replace(/[^\d]/g, ""));
    if (!Number.isFinite(age) || age < 16 || age > 80) {
      return "Please send a valid age as a number. For example: 24";
    }

    await sessionRef.set(
      {
        step: "job_location",
        candidateAge: age,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return "Where are you based? City and state is fine. For example: Lekki, Lagos";
  }

  if (step === "job_location") {
    if (!textBody || textBody.length < 2) {
      return "Please send your location. For example: Abuja or Yaba, Lagos";
    }

    await sessionRef.set(
      {
        step: "job_role",
        candidateLocation: textBody,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return jobRoleMessage;
  }

  if (step === "job_role") {
    const roleKey = JOB_ROLE_ALIASES[normalizedText];
    const role = roleKey ? JOB_ROLES[roleKey] : null;

    if (!role) {
      return `${jobRoleMessage}\n\nPlease reply with 1, 2, or 3.`;
    }

    await sessionRef.set(
      {
        step: "job_screening",
        jobRole: role.title,
        jobId: role.id,
        screeningQuestionIndex: 0,
        screeningAnswers: [],
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return `Great. ${role.questions[0]}`;
  }

  if (step === "job_screening") {
    const role = Object.values(JOB_ROLES).find(
      (item) => item.id === session.jobId || item.title === session.jobRole
    );
    if (!role) {
      await sessionRef.set(
        { step: "job_role", updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      return jobRoleMessage;
    }

    const questionIndex = session.screeningQuestionIndex ?? 0;
    const currentQuestion = role.questions[questionIndex];

    if (!textBody || textBody.length < 2) {
      return "Please send a short answer so we can continue your application.";
    }

    const answers = [
      ...(Array.isArray(session.screeningAnswers) ? session.screeningAnswers : []),
      {
        question: currentQuestion,
        answer: textBody,
      },
    ];

    const nextQuestionIndex = questionIndex + 1;
    if (nextQuestionIndex < role.questions.length) {
      await sessionRef.set(
        {
          screeningQuestionIndex: nextQuestionIndex,
          screeningAnswers: answers,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return role.questions[nextQuestionIndex];
    }

    const applicationId = await createWhatsAppJobApplication(from, {
      ...session,
      jobId: role.id,
      jobRole: role.title,
      screeningAnswers: answers,
    });

    await sessionRef.set(
      {
        step: "complete",
        flow: "jobs",
        jobApplicationId: applicationId,
        screeningAnswers: answers,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return `Done. Your application for ${role.title} has been received.\n\nOur team will review it and contact you here on WhatsApp if you're shortlisted.`;
  }

  if (step === "complete") {
    return "Your job application has already been received. Reply jobs if you want to start a new application.";
  }

  await resetWhatsAppJobSession(from);
  return "Let's get your application started.\n\nWhat's your full name?";
}

export async function createWhatsAppJobApplication(from: string, session: WhatsAppSession) {
  const screeningAnswers = Array.isArray(session.screeningAnswers) ? session.screeningAnswers : [];
  const message = screeningAnswers
    .map((item, index) => `${index + 1}. ${item.question}\n${item.answer}`)
    .join("\n\n");

  const applicationRef = await db.collection("job_applications").add({
    jobId: session.jobId || "whatsapp-job-application",
    jobTitle: session.jobRole || "WhatsApp Job Application",
    fullName: session.candidateFullName || "WhatsApp Candidate",
    email: "",
    phoneNumber: session.candidatePhone || from,
    age: session.candidateAge || null,
    location: session.candidateLocation || "",
    portfolioUrl: "",
    message,
    source: "whatsapp",
    whatsappId: from,
    screeningAnswers,
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return applicationRef.id;
}
