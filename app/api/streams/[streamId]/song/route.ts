import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";
import { z } from "zod";
//@ts-expect-error - Importing a non-TS module
import youtubesearchapi from "youtube-search-api";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

// Schema validation for adding a song to the queue
const AddSongSchema = z.object({
  url: z.string(),       // YouTube URL of the song
  userId: z.string(),    // User who adds the song to the queue
});
interface Song {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  streamId: string;
  upvotes?: number; // Optional property for upvotes
}

export async function POST(req: NextRequest, { params }: { params: { streamId: string } }) {
  const { streamId } = params;
  try {
    // Parse the request body
    const data = AddSongSchema.parse(await req.json());

    // Validate if it's a valid YouTube URL
    const isYT = data.url.match(YT_REGEX); 
    if (!isYT) {
      return NextResponse.json({
        message: "Invalid YouTube URL"
      }, {
        status: 400
      });
    }

    const extractedId = data.url.split("?v=")[1];
    const res = await youtubesearchapi.GetVideoDetails(extractedId);

    const thumbnails = res.thumbnail.thumbnails;
    thumbnails.sort((a: { width: number }, b: { width: number }) => b.width - a.width);
    
    // Create the song in the database
    const song = await prismaClient.song.create({
      data: {
        title: res.title,
        url: data.url,
        thumbnail: thumbnails[0].url,
        stream: {
          connect: { id: streamId }  // Use the connect method to link the song to the stream
        }
      }
    });

    return NextResponse.json({
      message: "Song added to stream",
      song
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to add song to the stream" },
      { status: 500 }
    );
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
