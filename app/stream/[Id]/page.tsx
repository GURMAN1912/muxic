"use client";
import Appbar from '@/app/components/Appbar';
import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import { ArrowBigUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import ReactPlayer from 'react-player/youtube';
import toast from 'react-hot-toast';

// Define proper interfaces for Song, Vote, and Stream
interface Song {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  upvotes: number;
}

interface Vote {
  songId: string;
  userId: string;
}

interface Stream {
  creatorId: string;
  streams: Stream[];
}

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [inputUrl, setInputUrl] = useState<string>('');
  const [currentSong, setCurrentSong] = useState<Song | null>(null); // Track the currently playing song
  const [songs, setSongs] = useState<Song[]>([]);
  const [votedSongs, setVotedSongs] = useState<Vote[]>([]);
  const [playedSongs, setPlayedSongs] = useState<string[]>([]); // To track played songs
  const [streamData, setStreamData] = useState<Stream[]>([]);

  const streamId = usePathname().split('/')[2];
  const router = useRouter();

  // Sort songs based on upvotes
  const sortedSongs = useMemo(() => songs.sort((a, b) => b.upvotes - a.upvotes), [songs]);
  if(!session?.user.id) {
    router.push('/');
  }
  

  useEffect(() => {
    const getStreamDetails = async () => {
      try {
        const res = await axios.get(`/api/streams/user/getStream/${streamId}`);
        if (res.status === 200) {
          setStreamData(res.data.streams);
        }
      } catch (e) {
        console.log(e);
      }
    };
    if (session && userId) {
      getStreamDetails();
    }
  }, [session, userId, streamId]);

  const addSong = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/streams/${streamId}/song`, { url: inputUrl, userId });
      if (res.status === 200) {
        setInputUrl('');
        toast.success('Song added to queue', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        fetchSongs(); // Fetch songs after adding a new song
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSongs = async () => {
    try {
      const res = await axios.get(`/api/streams/${streamId}/song`);
      setSongs(res.data.songs);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchVotes = async () => {
    try {
      const res = await axios.get(`/api/streams/${streamId}/upvote`);
      setVotedSongs(res.data.upvotes);
      setSongs((prevSongs) =>
        prevSongs.map((song) => {
          const upvotes = res.data.upvotes.filter((vote: Vote) => vote.songId === song.id).length;
          return { ...song, upvotes };
        })
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchVotes();

    const interval = setInterval(() => {
      fetchVotes(); // Fetch votes periodically
      fetchSongs();
      if (streamData[0]?.creatorId !== userId) {
        handleUserSongData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [streamData, userId, streamId]);

  const handleUpvote = async (songId: string) => {
    try {
      if (!userId) {
        return;
      }
      if(votedSongs.some((vote) => vote.songId === songId && vote.userId === userId)) {
        toast.error('Already upvoted', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }
      const res = await axios.post(`/api/streams/${streamId}/upvote`, { songId, userId });
      if (res.status === 200) {
        toast.success('Upvoted', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } else {
        toast.error('Already upvoted', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const countVotes = (songId: string) => {
    return votedSongs?.filter((vote) => vote.songId === songId).length;
  };

  const playNextSong = async () => {
    try {
      // Remove the current song from the stream's queue
      if (currentSong) {
        await axios.delete(`/api/streams/${streamId}/song/${currentSong.id}`);
      }
  
      // Add the current song to played songs
      setPlayedSongs((prevPlayed) => [...prevPlayed, currentSong?.id || '']);
  
      // Find the next song to play from the sorted list of unplayed songs
      const nextSong = sortedSongs.find(
        (song) => !playedSongs.includes(song.id) && song.id !== currentSong?.id
      );
  
      if (nextSong) {
        setCurrentSong(nextSong);  // Update state with the new current song
        
        // Update the current song in the backend
        await axios.put(`/api/streams/${streamId}/song/${nextSong.id}`, );
      } else {
        setCurrentSong(null); // No more songs in the queue
      }
  
    } catch (error) {
      console.error("Error playing the next song:", error);
    }
  };

  
  const handleUserSongData = async () => {
    try {
      // Fetch the current song from the backend
      const res = await axios.get(`/api/streams/${streamId}/currentSong`);
  
      if (res.status === 200) {
        const currentSongId = res.data.currentSong.id;
  
        // Find the song in the songs list by currentSongId
        const currentSongData = songs.find((song) => song.id === currentSongId);
  
        if (currentSongData) {
          setCurrentSong(currentSongData);  // Set the current song for non-creator
        } else {
          setCurrentSong(null); // No current song found
        }
      }
    } catch (error) {
      console.error("Error fetching current song for non-creator:", error);
    }
  };
  

  useEffect(() => {
    if (sortedSongs.length > 0 && !currentSong) {
      setCurrentSong(sortedSongs[0]);
    }
  }, [currentSong, sortedSongs]);

  const unplayedSongs = sortedSongs.filter((song) => !playedSongs.includes(song.id));

  return (
    <div className="bg-gradient-to-br from-dark-gradient-from via-dark-gradient-via to-dark-gradient-to min-h-screen flex flex-col">
      <Appbar />
      
      <h1 className="text-white text-center text-3xl font-semibold mt-28">Stream ID: {streamId}</h1>
      <div className="flex flex-grow items-center justify-center py-4 px-4">
        <div className="flex flex-col gap-8 md:flex-row items-start justify-between w-full max-w-6xl space-y-8 md:space-y-0">
          {/* Player Section */}
          <div className="w-full md:w-1/3 bg-white bg-opacity-10 p-8 rounded-lg shadow-xl transition duration-300 hover:shadow-2xl space-y-4">
            <h1 className="text-4xl text-white font-bold text-center tracking-wide">Now Playing</h1>
            <div className="flex flex-col items-center">
              {currentSong ? (
                <>
                  <Image
                    src={currentSong.thumbnail}
                    alt={currentSong.title}
                    width={150}
                    height={150}
                    className="rounded-lg shadow-md"
                  />
                  <p className="text-xl text-white mt-4 font-semibold">{currentSong.title}</p>
                  {streamData[0]?.creatorId === userId && (
                    <div className="w-full mt-4">
                      <ReactPlayer
                        key={currentSong.id}
                        url={currentSong.url}
                        playing={true}
                        controls={true}
                        width="100%"
                        height="360px"
                        onEnded={playNextSong}
                        className="rounded-lg overflow-hidden shadow-md"
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-lg text-white">No songs in the queue</p>
              )}
            </div>
          </div>

          {/* Queue Section */}
          <div className="w-full md:w-1/3 bg-white bg-opacity-10 p-8 rounded-lg shadow-xl transition duration-300 hover:shadow-2xl space-y-4">
            <h1 className="text-4xl text-white font-bold text-center tracking-wide">Queue</h1>
            <div className="flex flex-col gap-4">
              {unplayedSongs.length > 0 ? (
                unplayedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="flex justify-between items-center bg-gray-800 bg-opacity-70 p-4 rounded-lg hover:bg-gray-700 transition duration-200"
                  >
                    <div className="flex gap-4 items-center">
                      <Image
                        src={song.thumbnail}
                        alt={song.title}
                        width={80}
                        height={80}
                        className="rounded-lg shadow-sm"
                      />
                      <p className="text-lg text-white">
                        {song.title.length > 30 ? `${song.title.slice(0, 30)}...` : song.title}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-lg font-bold text-red-800">{countVotes(song.id)}</span>
                      <button
                        onClick={() => handleUpvote(song.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded-full shadow-md hover:bg-green-600 transition"
                      >
                        <ArrowBigUp className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-lg text-white">No songs in the queue</p>
              )}
            </div>
          </div>

          {/* Add Song Section */}
            <div className="w-full md:w-1/3 bg-white bg-opacity-10 p-8 rounded-lg shadow-xl transition duration-300 hover:shadow-2xl space-y-4">
              <h1 className="text-4xl text-white font-bold text-center tracking-wide">Add Song</h1>
              <form onSubmit={addSong} className="flex flex-col gap-4">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Enter YouTube URL"
                  required
                  className="p-4 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
                >
                  Add Song
                </button>
              </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
