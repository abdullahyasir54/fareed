import webpush from "web-push";
import { supabase } from "./supabase";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function notifyFareed(title: string, body: string) {
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
