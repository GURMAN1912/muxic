import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";
import { z } from "zod";
import { google } from "googleapis"; // Import Google APIs

const youtube = google.youtube({ version: "v3", auth: process.env.YOUTUBE_API_KEY });
interface Song {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  upvotes?: number;
}

// Schema validation for adding a song to the queue
const AddSongSchema = z.object({
  url: z.string(),       // YouTube URL of the song
  userId: z.string(),    // User who adds the song to the queue
});
export async function POST(req: NextRequest, { params }: { params: { streamId: string } }) {
  const { streamId } = params;
  try {
    const data = AddSongSchema.parse(await req.json());

    // Validate if it's a valid YouTube URL and extract video ID
    const videoIdMatch = data.url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return NextResponse.json({ message: "Invalid YouTube URL" }, { status: 400 });
    }

    const videoId = videoIdMatch[1]; // Extracted video ID

    // Fetch video details using Google API
    const res = await youtube.videos.list({
      part: ["snippet"], // Ensure this is an array of strings
      id: [videoId],     // Pass videoId as an array of strings
    });
    console.log("Video details:", res.data);

    // Check if items are defined and not empty
    const videoDetails = res.data.items?.[0];
    if (!videoDetails) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    const thumbnails = videoDetails?.snippet?.thumbnails;
    if (!thumbnails || Object.keys(thumbnails).length === 0) {
      return NextResponse.json({ message: "No thumbnails found" }, { status: 400 });
    }

    // Sort thumbnails by width
    const sortedThumbnails = Object.values(thumbnails).sort((a, b) => b.width - a.width);
    
    // Create the song in the database
    const song = await prismaClient.song.create({
      data: {
        title: videoDetails?.snippet?.title ?? "Unknown title",
        url: data.url,
        thumbnail: sortedThumbnails[0].url,
        stream: {
          connect: { id: streamId },
        },
      },
    });

    return NextResponse.json({ message: "Song added to stream", song });
  } catch (error) {
    console.error("Error adding song:", error);
    return NextResponse.json({ message: "Failed to add song", error: error instanceof Error ? error.message : error }, { status: 500 });
  }
}


export async function GET(req: NextRequest, { params }: { params: { streamId: string } }) {
  const { streamId } = params;

  try {
    // Fetch songs for the specific stream
    const songs:Song[] = await prismaClient.song.findMany({
      where: {
        stream: { id: streamId }
      }
    });

    // Fetch upvotes for the songs in the stream
    const upvotes = await prismaClient.upvote.findMany({
      where: {
        song: {
          streamId: streamId, // Ensure the song belongs to the stream
        },
      },
    });

    // Calculate upvotes for each song
    songs.forEach(song => {
      song.upvotes = upvotes.filter(upvote => upvote.songId === song.id).length;
    });

    // Sort songs based on upvotes in descending order
    // Sort songs based on upvotes in descending order, using default value if undefined
const sortedSongs = songs.sort((a, b) => {
  const upvotesA = a.upvotes ?? 0; // Default to 0 if undefined
  const upvotesB = b.upvotes ?? 0; // Default to 0 if undefined
  return upvotesB - upvotesA; // Sort in descending order
});

    return NextResponse.json({
      message: "Songs fetched and sorted by upvotes successfully",
      songs: sortedSongs,
    });
    
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { message: "Failed to fetch songs", error },
      { status: 500 }
    );
  }
}
