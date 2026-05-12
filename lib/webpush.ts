import webpush from "web-push";
import { supabase } from "./supabase";

function init() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function notifyFareed(title: string, body: string) {
  if (!init()) return;

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("username", "fareed");

  if (!subs?.length) return;

  await Promise.allSettled(
    subs.map((row) =>
      webpush.sendNotification(
        row.subscription as webpush.PushSubscription,
        JSON.stringify({ title, body, url: "/fareed" })
      )
    )
  );
}
