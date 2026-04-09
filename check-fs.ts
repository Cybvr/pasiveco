import { db } from "./lib/firebase-admin";

async function run() {
  try {
    const snaps = await db.collection("managerSessions").orderBy("createdAt", "desc").limit(5).get();
    console.log("Sessions:", snaps.size);
    for (const snap of snaps.docs) {
      console.log("Session:", snap.id, snap.data());
      const msgs = await snap.ref.collection("messages").orderBy("createdAt", "asc").get();
      console.log(`  Messages: ${msgs.size}`);
      for (const m of msgs.docs) {
        console.log(`    Message:`, m.data().role, m.data().content);
      }
    }
  } catch(e) {
    console.error(e);
  }
}
run();
