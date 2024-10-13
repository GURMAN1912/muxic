import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";
import { z } from "zod";
// @ts-ignore
import youtubesearchapi from "youtube-search-api";

var YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

// Schema validation for adding a song to the queue
const AddSongSchema = z.object({
  url: z.string(),       // YouTube URL of the song
  userId: z.string(),    // User who adds the song to the queue
});

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
    // Fetch all songs in the stream's queue
    const songs = await prismaClient.song.findMany({
      where: {
        stream: { id: streamId }
      }
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
