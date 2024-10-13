"use client";
import Appbar from '@/app/components/Appbar';
import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Image from 'next/image';
import { ArrowBigUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ReactPlayer from 'react-player/youtube';
import toast from 'react-hot-toast';

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [inputUrl, setInputUrl] = useState<string>('');
  const [currentSong, setCurrentSong] = useState<any>(null); // Track the currently playing song
  const [songs, setSongs] = useState<any[]>([]);
  const [votedSongs, setVotedSongs] = useState<any[]>([]);
  const [playedSongs, setPlayedSongs] = useState<string[]>([]); // To track played songs
  const [streamData, setStreamData] = useState<any[]>([]);

  const streamId = usePathname().split('/')[2];

  const sortedSongs = useMemo(() => songs.sort((a, b) => b.upvotes - a.upvotes), [songs]);

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

    getStreamDetails();
  }, [streamId]);

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
          const upvotes = res.data.upvotes.filter((vote: any) => vote.songId === song.id).length;
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
      if(streamData[0]?.creatorId !== userId)
      {
          handleUserSongData() // Fetch songs periodically
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleUpvote = async (songId: string) => {
    try {
      const res = await axios.post(`/api/streams/${streamId}/upvote`, { songId, userId });
      if (res.status === 200) {
        toast.success('Upvoted', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        fetchVotes(); // Refresh votes after upvoting
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

  const playNextSong = () => {
    // Mark the current song as played
    try{
        axios.delete(`/api/streams/${streamId}/song/${currentSong.id}`);
    }catch(e){
        console.log(e);
    }
    setPlayedSongs((prevPlayed) => [...prevPlayed, currentSong?.id]);

    // Find the next song with the highest votes that hasn't been played
    const nextSong = sortedSongs.find((song) => !playedSongs.includes(song.id) && song.id !== currentSong?.id);

    if (nextSong) {
      setCurrentSong(nextSong); // Set the next song to play
    } else {
      setCurrentSong(null); // If no more songs, set currentSong to null
    }
  };
  const handleUserSongData = async () => {
    const nextSong = sortedSongs.find((song) => !playedSongs.includes(song.id) && song.id !== currentSong?.id);

    if (nextSong) {
      setCurrentSong(nextSong); // Set the next song to play
    } else {
      setCurrentSong(null); // If no more songs, set currentSong to null
    }
}

  useEffect(() => {
    // If there are songs in the queue but no song is currently playing, start the first song
     
    if (sortedSongs.length > 0 && !currentSong) {
      setCurrentSong(sortedSongs[0]);
    }
  }, [sortedSongs, currentSong]);

  // Filter the queue to remove played songs
  const unplayedSongs = sortedSongs.filter(song => !playedSongs.includes(song.id));

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
                        onEnded={playNextSong} // Trigger when song ends
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
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-400 transition"
                      >
                        <ArrowBigUp className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white">No songs in the queue.</p>
              )}
            </div>
          </div>


          {/* Add to Queue Section */}
          <div className="w-full md:w-1/3 bg-white bg-opacity-10 p-8 rounded-lg shadow-xl transition duration-300 hover:shadow-2xl space-y-4">
            <h1 className="text-4xl text-white font-bold text-center tracking-wide">Add Songs to Queue</h1>
            <form onSubmit={addSong} className="flex flex-col gap-4">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter YouTube URL"
                className="bg-white bg-opacity-10 border border-gray-600 p-4 rounded-lg focus:outline-none focus:border-blue-500 transition"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-500 transition"
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
