import { NextRequest, NextResponse } from "next/server";

const YT_API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "No query" }, { status: 400 });

  if (!YT_API_KEY) {
    return NextResponse.json({ error: "No YouTube API key" }, { status: 500 });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoEmbeddable=true&maxResults=1&key=${YT_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    if (!videoId) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ videoId });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
