import { useRef, useEffect, useState, useContext } from "react";
import cn from "classnames";
import axios from "axios";
import { Drawer } from "vaul";
import ReactPlayer from "react-player";
import { Slider } from "@/components/ui/slider";
import { SongIdsContext } from "./SongIdsContext";
import site from "@/lib/site.config";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button } from "../ui/button";
import { LoopIcon, ShuffleIcon } from "@radix-ui/react-icons";
import { Card } from "../ui/card";

const Player = () => {
  const [lyrics, setLyrics] = useState([]);
  const [highlightedLine, setHighlightedLine] = useState("");
  const [highlightedLineTimestamp, setHighlightedLineTimestamp] = useState("");
  const {
    isPlaying,
    setIsPlaying,
    songIds,
    currentSongIndex,
    setCurrentSongIndex,
  } = useContext(SongIdsContext);
  const [playMode, setPlayMode] = useState("default"); // 默认为顺序播放模式
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [songInfo, setSongInfo] = useState([]);
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const [played, setPlayed] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => {
    const storedCurrentTime = localStorage.getItem("playedTime");
    return storedCurrentTime !== 0 ? parseFloat(storedCurrentTime) : 0;
  });
  const [remainingTime, setRemainingTime] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [display, setDisplay] = useState(() => {
    const storedDisplay = localStorage.getItem("display");
    return storedDisplay !== null ? JSON.parse(storedDisplay) : true; // 设置默认值为true
  });
  const [playlistDetails, setPlaylistDetails] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [hasLoadedPlaybackTime, setHasLoadedPlaybackTime] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");

  useEffect(() => {
    const storedCurrentTime = localStorage.getItem("playedTime");
    setCurrentTime(
      storedCurrentTime !== null ? parseFloat(storedCurrentTime) : 0
    );
    // 将hasLoadedPlaybackTime设置为true，表示已经从localStorage中读取了播放时间
    setHasLoadedPlaybackTime(true);
  }, []);

  useEffect(() => {
    // 判断是否已经从localStorage中读取了播放时间
    if (hasLoadedPlaybackTime) {
      audioRef.current.seekTo(currentTime);
    }
  }, [hasLoadedPlaybackTime]);

  useEffect(() => {
    const storedIsPlaying = localStorage.getItem("isPlaying");
    const storedCurrentTime = localStorage.getItem("playedTime");

    setIsPlaying(storedIsPlaying ? JSON.parse(storedIsPlaying) : false);

    setCurrentTime(storedCurrentTime ? parseFloat(storedCurrentTime) : 0);

    localStorage.setItem("currentSongIndex", JSON.stringify(currentSongIndex));

    return () => {
      localStorage.setItem("playedTime", currentTime.toString());
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("isPlaying", JSON.stringify(isPlaying));
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem("playedTime", currentTime.toString());
  }, [currentTime]);

  useEffect(() => {
    audioRef.current.seekTo(currentTime);
  }, []);

  useEffect(() => {
    const savedPlayedTime = localStorage.getItem("playedTime");
    if (savedPlayedTime) {
      const parsedTime = parseFloat(savedPlayedTime);
      setPlayed(parsedTime);
      setCurrentTime(parsedTime);
      audioRef.current.seekTo(parsedTime);
    }
  }, []);

  useEffect(() => {
    if (currentSongIndex >= songIds.length) {
      setCurrentSongIndex(0);
    }
  }, [songIds]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 766) {
        setDisplay(false);
      } else {
        setDisplay(true);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const currentSongId = songIds[currentSongIndex];

        const [
          songResponse,
          lyricsResponse,
          translatedLyricsResponse,
          musicUrlDataResponse,
        ] = await Promise.all([
          axios.get(`${site.api}/song/detail?ids=${currentSongId}`),
          axios.get(`${site.api}/lyric?id=${currentSongId}`),
          axios.get(`${site.api}/lyric/translate?id=${currentSongId}`),
          axios.get(
            `${site.api}/song/url/v1?id=${currentSongId}&level=exhigh&cookie=${cookie}`
          ),
        ]);

        const songData = songResponse.data;
        const songDetail = songData.songs;
        setSongInfo(songDetail);

        const lyricsData = lyricsResponse.data;
        const lyricsText = lyricsData.lrc.lyric;
        const parsedLyrics = parseLyrics(lyricsText);
        setLyrics(parsedLyrics);

        const translatedLyricsData = translatedLyricsResponse.data;
        const translatedLyricsText = translatedLyricsData.tlyric.lyric;
        const parsedTranslatedLyrics = parseLyrics(translatedLyricsText);
        setTranslatedLyrics(parsedTranslatedLyrics);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSongData();
  }, [songIds, currentSongIndex]);

  const parseLyrics = (lyricsText) => {
    const lines = lyricsText.split("\n");
    const parsedLyrics = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.length > 0) {
        const regex = /\[(\d+):(\d+)\.\d+\]/;
        const match = line.match(regex);

        if (match) {
          const [, minutes, seconds] = match;
          const currentTimeInSeconds =
            parseInt(minutes) * 60 + parseInt(seconds);

          parsedLyrics.push({
            timestamp: currentTimeInSeconds,
            text: line.replace(regex, "").trim(),
          });
        }
      }
    }

    return parsedLyrics;
  };

  const handleTimeUpdate = ({ playedSeconds }) => {
    if (!lyrics.length || !audioRef.current || !lyricsContainerRef.current) {
      return;
    }

    const matchingLines = [];

    for (let i = 0; i < lyrics.length; i++) {
      const { timestamp, text } = lyrics[i];
      const diff = Math.abs(playedSeconds - timestamp);

      if (playedSeconds >= timestamp) {
        matchingLines.push({
          text,
          diff,
          timestamp,
        });
      }
    }

    matchingLines.sort((a, b) => a.diff - b.diff);
    const currentHighlightedLine = matchingLines[0]?.text || null;
    const currentHighlightedLineTimestamp = matchingLines[0]?.timestamp || null;

    setHighlightedLine(currentHighlightedLine);
    setHighlightedLineTimestamp(currentHighlightedLineTimestamp);
  };

  useEffect(() => {
    if (
      typeof highlightedLineTimestamp === "number" &&
      lyricsContainerRef.current
    ) {
      const targetElement = lyricsContainerRef.current.querySelector(
        `p[data-text="${String(highlightedLineTimestamp)}"]`
      );

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [highlightedLineTimestamp]);

  const handleProgress = (progress) => {
    const playedTime = progress.playedSeconds;
    setPlayed(progress.played);
    setCurrentTime(playedTime);
    setRemainingTime(audioRef.current.getDuration() - playedTime);
    localStorage.setItem("playedTime", playedTime.toString());
  };

  useEffect(() => {
    const storedCurrentTime = localStorage.getItem("playedTime");
    setCurrentTime(
      storedCurrentTime !== null ? parseFloat(storedCurrentTime) : 0
    );
  }, []);

  useEffect(() => {
    audioRef.current.seekTo(currentTime);
  }, []);

  const handleSeekChange = (newValue) => {
    setSeekValue(parseFloat(newValue));
  };

  const handleSeek = () => {
    audioRef.current.seekTo(seekValue);
  };

  useEffect(() => {
    if (audioRef.current && audioRef.current.getDuration() && played === 1) {
      setPlayed(0);
      setIsPlaying(false);
    }
  }, [played]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleVolumeChange = (newValue) => {
    const newVolume = parseFloat(newValue);
    setVolume(newVolume);
  };

  function shuffleArray(array) {
    const newArray = [...array]; // 创建一个新数组，并复制原始数组的元素

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // 交换位置
    }

    return newArray;
  }

  const handleEnded = () => {
    if (playMode === "default") {
      // 播放下一首音频
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songIds.length);
      setIsPlaying(true);
    } else if (playMode === "loop") {
      // 继续播放当前音频
      audioRef.current.seekTo(0);
      setIsPlaying(true);
    } else if (playMode === "shuffle") {
      // 创建一个随机排列的数组
      const shuffledIndexes = shuffleArray(
        Array.from({ length: songIds.length }, (_, i) => i)
      );
      // 获取当前音频索引
      const currentIndex = shuffledIndexes.findIndex(
        (index) => index === currentSongIndex
      );
      // 播放下一首随机音频
      setCurrentSongIndex(
        shuffledIndexes[(currentIndex + 1) % shuffledIndexes.length]
      );
      setIsPlaying(true);
    }
  };

  const { getAllSongIds } = useContext(SongIdsContext);
  const songId = songIds[currentSongIndex];
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  const cookie = localStorage.getItem("cookie");

  useEffect(() => {
    if (userData) {
      checkLikedMusic(userData.data.account.id, songId);
    }
  }, [songId]);

  useEffect(() => {
    localStorage.setItem("isLiked", isLiked); // 每次 isLiked 更新后保存到本地存储
  }, [isLiked]);

  const checkLikedMusic = async (userId, songId) => {
    try {
      const response = await axios.get(
        `${site.api}/likelist?uid=${userId}&cookie=${cookie}`
      );

      if (response.data.code === 200) {
        const likedMusicIds = response.data.ids;
        const isLiked = likedMusicIds.includes(songId);
        setIsLiked(isLiked);
      } else {
        console.log("获取喜欢音乐列表失败");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  const toggleLikeMusic = async () => {
    try {
      setIsLiked(!isLiked); // 直接更新喜欢状态，不等待服务器响应

      const response = await axios.get(`${site.api}/like`, {
        params: {
          id: songId,
          like: !isLiked, // 反转当前的喜欢状态
          cookie: cookie,
        },
      });

      if (response.data.code !== 200) {
        alert("喜欢失败");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  if ("mediaSession" in navigator) {
    useEffect(() => {
      if (songInfo) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: `${songInfo.map((song) => song.name)}`,
          artist: `${songInfo.map((song) =>
            song.ar.map((artist) => artist.name).join(" / ")
          )}`,
          artwork: [
            {
              src: `${songInfo.map((song) => song.al.picUrl)}`,
              sizes: "300x300",
              type: "image/jpeg",
            },
          ],
        });
      }

      navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () =>
        setIsPlaying(false)
      );
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        setCurrentSongIndex(
          (currentSongIndex - 1 + songIds.length) % songIds.length
        )
      );
      navigator.mediaSession.setActionHandler("nexttrack", () =>
        setCurrentSongIndex((currentSongIndex + 1) % songIds.length)
      );
    }, [currentSongIndex, songInfo]);
  }
  return (
    <div>
      <div>
        <ReactPlayer
          ref={audioRef}
          playing={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(error) => {
            setCurrentSongIndex(currentSongIndex + 1);
          }}
          volume={volume}
          url={`https://music.163.com/song/media/outer/url?id=${songIds[currentSongIndex]}.mp3`}
          onProgress={(progress) => {
            handleTimeUpdate(progress);
            handleProgress(progress);
          }}
          onEnded={handleEnded}
          className="fixed top-0 hidden"
        />
      </div>
      <Drawer.Root shouldScaleBackground>
        <Drawer.Trigger asChild>
          <Card className="px-1 cursor-pointer w-96">
            <div className="flex flex-row space-x-2 w-full">
              <div>
                <div className="flex flex-row py-1">
                  <>
                    {songInfo &&
                      songInfo.map((song) => (
                        <LazyLoadImage
                          effect="blur"
                          src={`${song.al.picUrl}?param=512y512`}
                          className="size-12 rounded-xl"
                        />
                      ))}
                    {songInfo &&
                      songInfo.map((song) => (
                        <div className="flex flex-col px-2 text-left">
                          <p className="font-medium text-base leading-6 truncate w-24 md:w-32 sm:w-36 mt-1">
                            {song.name}
                          </p>
                          <p className="text-sm opacity-75 truncate w-24 md:w-32 sm:w-36 my-0">
                            {song.ar.map((artist) => artist.name).join(" / ")}
                          </p>
                        </div>
                      ))}
                    {!songInfo.length && (
                      <>
                        <div className="animate-pulse flex flex-row">
                          <div className="bg-neutral-200 dark:bg-neutral-800 rounded-lg w-12 h-12" />
                          <div className="flex flex-col px-2 text-left">
                            <div className="bg-neutral-200 dark:bg-neutral-800 rounded-lg w-24 md:w-32 sm:w-36 mt-1 h-6" />
                            <div className="bg-neutral-200 dark:bg-neutral-800 rounded-lg w-24 md:w-32 sm:w-36 mt-2 h-2" />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex flex-row space-x-1 max-w-[30rem]">
                      <div className="flex flex-row">
                        <Button
                          className="h-full"
                          variant="ghost"
                          onClick={(event) => {
                            setCurrentSongIndex(
                              (currentSongIndex - 1 + songIds.length) %
                                songIds.length
                            );
                            event.stopPropagation();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                          >
                            <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                          </svg>
                        </Button>
                        <Button
                          className="h-full"
                          variant="ghost"
                          onClick={(event) => {
                            setIsPlaying(!isPlaying);
                            event.stopPropagation();
                          }}
                        >
                          {isPlaying === true ? (
                             <svg
                             t="1692268156116"
                             fill="currentColor"
                             className="size-6"
                             viewBox="0 0 1024 1024"
                             version="1.1"
                             xmlns="http://www.w3.org/2000/svg"
                             p-id="4153"
                           >
                             <path
                               d="M298.666667 196.266667c0-23.893333 0-35.84 4.650666-44.970667a42.666667 42.666667 0 0 1 18.645334-18.645333C331.093333 128 343.04 128 366.933333 128h34.133334c23.893333 0 35.84 0 44.970666 4.650667a42.666667 42.666667 0 0 1 18.645334 18.645333C469.333333 160.426667 469.333333 172.373333 469.333333 196.266667v588.8c0 23.893333 0 35.84-4.650666 44.970666a42.666667 42.666667 0 0 1-18.645334 18.645334C436.906667 853.333333 424.96 853.333333 401.066667 853.333333h-34.133334c-23.893333 0-35.84 0-44.970666-4.650666a42.666667 42.666667 0 0 1-18.645334-18.645334C298.666667 820.906667 298.666667 808.96 298.666667 785.066667V196.266667zM554.666667 196.266667c0-23.893333 0-35.84 4.650666-44.970667a42.666667 42.666667 0 0 1 18.645334-18.645333C587.093333 128 599.04 128 622.933333 128h34.133334c23.893333 0 35.84 0 44.970666 4.650667a42.666667 42.666667 0 0 1 18.645334 18.645333C725.333333 160.426667 725.333333 172.373333 725.333333 196.266667v588.8c0 23.893333 0 35.84-4.650666 44.970666a42.666667 42.666667 0 0 1-18.645334 18.645334C692.906667 853.333333 680.96 853.333333 657.066667 853.333333h-34.133334c-23.893333 0-35.84 0-44.970666-4.650666a42.666667 42.666667 0 0 1-18.645334-18.645334C554.666667 820.906667 554.666667 808.96 554.666667 785.066667V196.266667z"
                               p-id="4154"
                             ></path>
                           </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-6"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </Button>
                        <Button
                          className="h-full"
                          variant="ghost"
                          onClick={(event) => {
                            setCurrentSongIndex(
                              (currentSongIndex + 1) % songIds.length
                            );
                            event.stopPropagation();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                          >
                            <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </Card>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-3xl" />
          <Drawer.Content className="z-[99999999] bg-white dark:bg-black text-black dark:text-white flex flex-col rounded-t-xl h-screen mt-24 fixed bottom-0 left-0 right-0 border-neutral-800 focus:outline-none">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700 mb-8" />
              <div className="w-full flex flex-row">
                <div className="flex justify-center sm:justify-end w-full md:w-1/2 sm:w-1/2 px-4 md:px-6 sm:px-12">
                  {songInfo.map((song) => (
                    <div>
                      <LazyLoadImage
                        effect="blur"
                        src={`${song.al.picUrl}?param=512y512`}
                        className="rounded-xl h-auto w-[28rem]"
                      />

                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col font-medium mt-2 px-2 py-1.5 space-y-0.5">
                          <h1 className="line-clamp-1 truncate text-lg md:text-xl sm:text-2xl w-96 font-medium">
                            {song.name}
                          </h1>
                          <h2 className="font-normal opacity-75 truncate w-96 -mt-1">
                            {song.ar.map((artist) => artist.name).join(" / ")}
                          </h2>
                        </div>
                        <div>
                          <button
                            className="mt-4 rounded-lg w-12 h-12 flex justify-center items-center"
                            onClick={toggleLikeMusic}
                          >
                            {isLiked ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="px-2">
                        <div className="flex mx-auto mt-2 flex-row justify-between">
                          <div className="text-xs md:text-sm sm:text-sm opacity-75">
                            {formatTime(currentTime)}
                          </div>
                          <Slider
                            className="w-[80%] ml-2 mr-2"
                            min={0}
                            max={1}
                            step={0.01}
                            value={[played]}
                            onValueChange={(newValue) =>
                              handleSeekChange(newValue)
                            }
                            onPointerUp={handleSeek}
                          />

                          <div className="text-xs md:text-sm sm:text-sm opacity-75">
                            -{formatTime(remainingTime)}
                          </div>
                        </div>

                        <div className="max-w-xs mx-auto flex flex-row justify-center mt-2">
                          <div className={cn("flex flex-row mt-4")}>
                            <Button
                              className="size-12"
                              variant={
                                playMode === "loop" ? "secondary" : "ghost"
                              }
                              onClick={() =>
                                setPlayMode(
                                  playMode === "default" ? "loop" : "default"
                                )
                              }
                            >
                              <LoopIcon className="size-8" />
                            </Button>
                          </div>

                          <div>
                            <div className="px-4 mt-2 mx-auto flex flex-row justify-between transition-all duration-500">
                              <Button
                                variant="ghost"
                                className="hover:bg-neutral-300/75 dark:hover:bg-neutral-700/25 rounded-lg w-16 h-16 flex justify-center items-center"
                                onClick={() =>
                                  setCurrentSongIndex(
                                    (currentSongIndex - 1 + songIds.length) %
                                      songIds.length
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="size-12"
                                >
                                  <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V8.69c0-1.44-1.555-2.343-2.805-1.628L12 11.029v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061Z" />
                                </svg>
                              </Button>
                              <Button
                                className="size-16 flex justify-center items-center"
                                variant="ghost"
                                onClick={() => setIsPlaying(!isPlaying)}
                              >
                                {isPlaying === true ? (
                                  <svg
                                    t="1692268156116"
                                    fill="currentColor"
                                    className="size-12"
                                    viewBox="0 0 1024 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    p-id="4153"
                                  >
                                    <path
                                      d="M298.666667 196.266667c0-23.893333 0-35.84 4.650666-44.970667a42.666667 42.666667 0 0 1 18.645334-18.645333C331.093333 128 343.04 128 366.933333 128h34.133334c23.893333 0 35.84 0 44.970666 4.650667a42.666667 42.666667 0 0 1 18.645334 18.645333C469.333333 160.426667 469.333333 172.373333 469.333333 196.266667v588.8c0 23.893333 0 35.84-4.650666 44.970666a42.666667 42.666667 0 0 1-18.645334 18.645334C436.906667 853.333333 424.96 853.333333 401.066667 853.333333h-34.133334c-23.893333 0-35.84 0-44.970666-4.650666a42.666667 42.666667 0 0 1-18.645334-18.645334C298.666667 820.906667 298.666667 808.96 298.666667 785.066667V196.266667zM554.666667 196.266667c0-23.893333 0-35.84 4.650666-44.970667a42.666667 42.666667 0 0 1 18.645334-18.645333C587.093333 128 599.04 128 622.933333 128h34.133334c23.893333 0 35.84 0 44.970666 4.650667a42.666667 42.666667 0 0 1 18.645334 18.645333C725.333333 160.426667 725.333333 172.373333 725.333333 196.266667v588.8c0 23.893333 0 35.84-4.650666 44.970666a42.666667 42.666667 0 0 1-18.645334 18.645334C692.906667 853.333333 680.96 853.333333 657.066667 853.333333h-34.133334c-23.893333 0-35.84 0-44.970666-4.650666a42.666667 42.666667 0 0 1-18.645334-18.645334C554.666667 820.906667 554.666667 808.96 554.666667 785.066667V196.266667z"
                                      p-id="4154"
                                    ></path>
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="size-12"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-16 h-16 flex justify-center items-center"
                                onClick={() =>
                                  setCurrentSongIndex(
                                    (currentSongIndex + 1) % songIds.length
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="size-12"
                                >
                                  <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z" />
                                </svg>
                              </Button>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "transition-all duration-500 flex flex-row mt-4"
                            )}
                          >
                            <Button
                              className="size-12"
                              onClick={() =>
                                setPlayMode(
                                  playMode === "shuffle" ? "default" : "shuffle"
                                )
                              }
                              variant={
                                playMode === "shuffle" ? "secondary" : "ghost"
                              }
                            >
                              <ShuffleIcon className="size-8" />
                            </Button>
                          </div>
                        </div>
                        <div className="px-2 flex flex-row space-x-2 mt-2 justify-center items-center">
                          <Button
                            variant="ghost"
                            onClick={() => setVolume(0)}
                            className="rounded-lg size-12 flex justify-center items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-8"
                            >
                              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
                            </svg>
                          </Button>

                          <Slider
                            className="w-[80%]"
                            min={0}
                            max={1}
                            step={0.01}
                            value={[volume]}
                            onValueChange={(newValue) =>
                              handleVolumeChange(newValue)
                            }
                          />

                          <Button
                            variant="ghost"
                            onClick={() => setVolume(1)}
                            className="rounded-lg size-12 flex justify-center items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-8"
                            >
                              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block sm:block w-1/2 h-screen overflow-y-auto">
                  <div className="py-4 overflow-y-auto select-none my-56">
                    <div ref={lyricsContainerRef} style={{ maxHeight: "100%" }}>
                      {lyrics.map((line, index) => {
                        const translationLine = translatedLyrics.find(
                          (translatedLine) =>
                            translatedLine.timestamp === line.timestamp &&
                            line.text !== ""
                        );
                        const highlightedIndex = lyrics.findIndex(
                          (lyric) =>
                            lyric.text === highlightedLine &&
                            lyric.timestamp === highlightedLineTimestamp
                        );
                        const isHighlightedRow = index === highlightedIndex;
                        return (
                          <p
                            key={index}
                            className={cn(
                              "transition-all hover:bg-neutral-300/75 dark:hover:bg-neutral-700/25 w-auto rounded-lg px-8 flex flex-col space-y-0 cursor-pointer py-6 leading-tight",
                              isHighlightedRow &&
                                highlightedIndex !== -1 &&
                                "font-medium text-[1.75rem] md:text-[32px] sm:text-[34px] blur-0",
                              !isHighlightedRow &&
                                "opacity-50 text-[28px] sm:text-[30px] font-medium"
                            )}
                            onClick={() =>
                              audioRef.current.seekTo(line.timestamp)
                            }
                            data-text={String(line.timestamp)}
                          >
                            <span className="tracking-tight break-words hyphens-auto leading-tight">
                              {line.text ? <>{line.text}</> : <></>}
                            </span>
                            {translationLine?.text && (
                              <span className="text-2xl md:text-2xl sm:text-3xl text-neutral-700 dark:text-neutral-300 font-medium leading-tight">
                                {translationLine.text}
                              </span>
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
};

Player.theme = "dark";

export default Player;
