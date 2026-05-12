import { supabase } from "./supabase";

export type RequestType = "tea" | "coffee" | "food" | "custom";
export type RequestStatus = "pending" | "done";

export interface StoreRequest {
  id: string;
  type: RequestType;
  user_id: string;
  username: string;
  instructions?: string | null;
  status: RequestStatus;
  created_at: string;
}

export async function getRequests(): Promise<StoreRequest[]> {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as StoreRequest[];
}

export async function addRequest(req: {
  type: RequestType;
  username: string;
  instructions?: string;
}): Promise<StoreRequest> {
  const { data: user } = await supabase
    .from("app_users")
    .select("id")
    .eq("username", req.username)
    .single();

  const { data, error } = await supabase
    .from("requests")
    .insert({
      type: req.type,
      user_id: user?.id,
      username: req.username,
      instructions: req.instructions ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as StoreRequest;
}

export async function getUserPendingRequests(username: string): Promise<StoreRequest[]> {
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("username", username)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as StoreRequest[];
}

export async function markRequestDone(id: string): Promise<void> {
  const { error } = await supabase
    .from("requests")
    .update({ status: "done" })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
