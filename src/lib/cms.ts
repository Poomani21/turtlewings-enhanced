import {
  addDoc,
  collection,
  deleteDoc as fsDeleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getDb, getFirebase } from "./firebase";
import type {
  BlogDoc,
  EnquiryDoc,
  MemberDoc,
  ProgramDoc,
  SiteSettings,
  VideoDoc,
} from "./cms-types";

export type CollectionName = "programs" | "members" | "blogs" | "videos" | "enquiries";

function normalise<T>(id: string, data: Record<string, unknown>): T {
  const out: Record<string, unknown> = { id };
  for (const [key, value] of Object.entries(data)) {
    out[key] =
      value && typeof value === "object" && "toDate" in (value as object)
        ? (value as { toDate: () => Date }).toDate().toISOString()
        : value;
  }
  return out as T;
}

async function readAll<T>(name: CollectionName, filter?: [string, unknown]): Promise<T[]> {
  const db = await getDb();
  const base = collection(db, name);
  const snap = await getDocs(filter ? query(base, where(filter[0], "==", filter[1])) : base);
  return snap.docs.map((d) => normalise<T>(d.id, d.data()));
}

/* ---------------------------------- public --------------------------------- */

export async function fetchActivePrograms(): Promise<ProgramDoc[]> {
  const rows = await readAll<ProgramDoc>("programs", ["status", "active"]);
  return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));
}

export async function fetchPublishedBlogs(): Promise<BlogDoc[]> {
  const rows = await readAll<BlogDoc>("blogs", ["isPublished", true]);
  return rows.sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));
}

export async function fetchPublishedVideos(): Promise<VideoDoc[]> {
  const rows = await readAll<VideoDoc>("videos", ["isPublished", true]);
  return rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/** Members are sensitive: only entries explicitly marked public are ever returned. */
export async function fetchPublicMembers(): Promise<MemberDoc[]> {
  return readAll<MemberDoc>("members", ["isPublic", true]);
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const db = await getDb();
  const snap = await getDoc(doc(db, "settings", "site"));
  return snap.exists() ? (snap.data() as SiteSettings) : {};
}

export async function submitEnquiry(
  data: Omit<EnquiryDoc, "id" | "status" | "createdAt">,
): Promise<void> {
  const db = await getDb();
  await addDoc(collection(db, "enquiries"), {
    ...data,
    status: "new",
    createdAt: serverTimestamp(),
  });
}

/* ---------------------------------- admin ---------------------------------- */

export async function adminList<T>(name: CollectionName): Promise<T[]> {
  const rows = await readAll<T & { createdAt?: string; title?: string; name?: string }>(name);
  return rows.sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  ) as unknown as T[];
}

export async function adminSave(
  name: CollectionName,
  id: string | null,
  data: Record<string, unknown>,
): Promise<void> {
  const db = await getDb();
  if (id) {
    await updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, name), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function adminDelete(name: CollectionName, id: string): Promise<void> {
  const db = await getDb();
  await fsDeleteDoc(doc(db, name, id));
}

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  const db = await getDb();
  await setDoc(doc(db, "settings", "site"), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/** Uploads to Firebase Storage and returns the public download URL. */
export async function uploadFile(folder: string, file: File): Promise<string> {
  const { storage } = await getFirebase();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${safe}`;
  const snap = await uploadBytes(ref(storage, path), file);
  return getDownloadURL(snap.ref);
}
