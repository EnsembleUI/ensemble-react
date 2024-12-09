import {
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore/lite";
import { CollectionsName } from "./firebase";
import type { ApplicationDTO } from "./dto";

export const getCloudApps = async (
  db: Firestore,
  userId: string,
): Promise<Partial<ApplicationDTO>[]> => {
  const q = query(
    collection(db, CollectionsName.Apps),
    where("isArchived", "==", false),
    where(`collaborators.users_${userId}`, "in", ["read", "write", "owner"]),
  );

  const result = await getDocs(q);
  return result.docs.map((doc) => doc.data());
};
