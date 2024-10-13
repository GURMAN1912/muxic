"use client";
import React, { useEffect } from 'react';
import axios from 'axios';
import Appbar from '../components/Appbar';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const Page = () => {
  const [inputTitle, setInputTitle] = React.useState<String>("");
  const [inputId, setInputId] = React.useState<String>("");
  const [userStream, setUserStream] = React.useState<any[]>([]);

  const router = useRouter();
  const session = useSession();
  const handleNewSubmit = async (e: any) => {
    e.preventDefault();
    if (!inputTitle) {
      toast.error("Please enter a title", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }
    try {
      const res = await axios.post(`/api/streams/user/${session.data?.user.id}`, { title: inputTitle });
      if(res.status === 200){
        toast.success("Stream created", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
      router.push(`/stream/${res.data.stream.id}`);
    } catch (e) {
      console.log(e);

    }
  };

  const handleJoinSubmit = async (e: any) => {
    e.preventDefault();
    if (!inputId) {
      toast.error("Please enter a stream ID", {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }
    try {
      const res = await axios.get(`/api/streams/user/getStream/${inputId}`);
      if (res.status !== 200) {
        toast.error("Stream not found", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
        
      }
      else{
        toast.success("Stream found", {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
      router.push(`/stream/${inputId}`);

    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const UserStream = async () => {
      try {
        const res = await axios.get(`/api/streams/user/${session.data?.user.id}`);
        if (res.data.streams) {
          setUserStream(res.data.streams);
        }
      } catch (e) {
        console.log(e);
      }
    };
    UserStream();
  }, [session]);

  return (
    <div className="bg-gradient-to-br from-dark-gradient-from via-dark-gradient-via to-dark-gradient-to min-h-screen flex flex-col items-center">
      <Appbar />
      <div className="flex flex-col gap-8 items-center justify-center py-12 w-full max-w-3xl">
        <div className="flex flex-col items-center bg-gray-900 bg-opacity-75 p-10 rounded-lg shadow-lg w-full">
          <h1 className="text-white text-4xl font-extrabold mb-6">Create or Join a Stream</h1>
          <form onSubmit={handleNewSubmit} className="w-full">
            <input
              onChange={(e) => setInputTitle(e.target.value)}
              type="text"
              placeholder="Enter Stream Name"
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-rose-500 mb-6"
            />
            <button type="submit" className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-400 transition font-semibold">
              Start a New Stream
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col bg-gray-900 bg-opacity-75 p-10 rounded-lg shadow-lg w-full">
            <h2 className="text-white text-3xl font-semibold mb-4">Join a Stream</h2>
            <form onSubmit={handleJoinSubmit} className="flex space-x-4 w-full">
              <input
                type="text"
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Enter Stream ID"
                className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-rose-500"
              />
              <button type="submit" className="bg-rose-500 text-white py-3 px-6 rounded-lg hover:bg-rose-400 transition font-semibold">
                Join
              </button>
            </form>
          </div>
        </div>

        {userStream.length > 0 && (
          <div className="flex flex-col items-center bg-gray-900 bg-opacity-75 p-10 rounded-lg shadow-lg w-full">
            <h1 className="text-white text-3xl font-semibold mb-6">Your Streams</h1>
            {userStream.map((stream) => (
              <div key={stream.id} className="flex items-center justify-between w-full p-4 bg-gray-800 rounded-lg mb-4">
                <p className="text-white">{stream.title}</p>
                <div className='flex gap-3'>

                <button
                  onClick={() => router.push(`/stream/${stream.id}`)}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-400 transition font-semibold"
                  >
                  Join
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axios.delete(`/api/streams/user/getStream/${stream.id}`);
                      setUserStream(userStream.filter((s) => s.id !== stream.id));
                      toast.success("Stream deleted", {
                        style: {
                          borderRadius: '10px',
                          background: '#333',
                          color: '#fff',
                        },
                      });
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-black/80 transition font-semibold"
                  >
                  Delete
                </button>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
