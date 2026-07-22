import { NextResponse } from "next/server";
import { requireCvStudioUser } from "../../cv-studio/auth";

export const dynamic = "force-dynamic";
const owner = "jacobchalif";
const repo = "jacobchalif.github.io";
const branch = "main";
const api = "https://api.github.com";

function token() {
  return process.env.GITHUB_CV_TOKEN;
}

async function github(path: string, init: RequestInit = {}) {
  const secret = token();
  if (!secret) throw new Error("CV Studio publishing has not been connected to GitHub yet.");
  const response = await fetch(`${api}${path}`, { ...init, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${secret}`, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "jacob-chalif-cv-studio", ...init.headers } });
  if (!response.ok) throw new Error(`GitHub rejected the request (${response.status}).`);
  return response.json();
}

async function readJson(path: string) {
  const file = await github(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`) as { content: string };
  return JSON.parse(Buffer.from(file.content.replace(/\n/g, ""), "base64").toString("utf8"));
}

export async function GET() {
  const user = await requireCvStudioUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const [cv, publications] = await Promise.all([readJson("content/cv.json"), readJson("content/publications.json")]);
    return NextResponse.json({ cv, publications, email: user.email });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load CV" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await requireCvStudioUser();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { cv, publications } = await request.json() as { cv: unknown; publications: unknown };
    if (!cv || !Array.isArray(publications)) return NextResponse.json({ error: "Invalid CV data" }, { status: 400 });
    const ref = await github(`/repos/${owner}/${repo}/git/ref/heads/${branch}`) as { object: { sha: string } };
    const commit = await github(`/repos/${owner}/${repo}/git/commits/${ref.object.sha}`) as { tree: { sha: string } };
    const blobs = await Promise.all([cv, publications].map(content => github(`/repos/${owner}/${repo}/git/blobs`, { method: "POST", body: JSON.stringify({ content: `${JSON.stringify(content, null, 2)}\n`, encoding: "utf-8" }) }) as Promise<{ sha: string }>));
    const tree = await github(`/repos/${owner}/${repo}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree: [
      { path: "content/cv.json", mode: "100644", type: "blob", sha: blobs[0].sha },
      { path: "content/publications.json", mode: "100644", type: "blob", sha: blobs[1].sha },
    ] }) }) as { sha: string };
    const nextCommit = await github(`/repos/${owner}/${repo}/git/commits`, { method: "POST", body: JSON.stringify({ message: `Update CV from online Studio (${user.email})`, tree: tree.sha, parents: [ref.object.sha] }) }) as { sha: string };
    await github(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: nextCommit.sha, force: false }) });
    return NextResponse.json({ ok: true, commit: nextCommit.sha });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save CV" }, { status: 500 });
  }
}
