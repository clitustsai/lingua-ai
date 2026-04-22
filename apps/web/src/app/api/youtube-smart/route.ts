import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, minDuration = 60, maxDuration = 600 } = await req.json();
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
    }

    // Search for videos with captions
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCaption=closedCaption&maxResults=10&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items?.length) {
      return NextResponse.json({ error: "No videos found" }, { status: 404 });
    }

    // Get video details to check duration and embeddable
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${videoIds}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();

    // Filter: embeddable + duration in range
    const validVideos = detailsData.items?.filter((v: any) => {
      const duration = parseDuration(v.contentDetails.duration);
      return v.status.embeddable && duration >= minDuration && duration <= maxDuration;
    });

    if (!validVideos?.length) {
      return NextResponse.json({ error: "No suitable videos found" }, { status: 404 });
    }

    // Return first valid video
    const video = validVideos[0];
    const searchItem = searchData.items.find((item: any) => item.id.videoId === video.id);
    
    return NextResponse.json({
      videoId: video.id,
      title: searchItem.snippet.title,
      thumbnail: searchItem.snippet.thumbnails.medium.url,
      duration: parseDuration(video.contentDetails.duration),
    });
  } catch (error) {
    console.error("YouTube smart search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

// Parse ISO 8601 duration (PT1M30S -> 90)
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  return h * 3600 + m * 60 + s;
}
