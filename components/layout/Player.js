import { useRef, useEffect, useState, useContext } from "react";
import cn from "classnames";
import axios from "axios";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import ReactPlayer from "react-player";
import { Slider } from "@/components/ui/slider";
import { SongIdsContext } from "./SongIdsContext";
import site from "@/lib/site.config";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button } from "../ui/button";
import { LoopIcon, ShuffleIcon } from "@radix-ui/react-icons";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

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
      <Drawer className="rounded-none">
        <DrawerTrigger asChild>
          <Card className="px-1 cursor-pointer w-72 md:w-80 sm:w-96">
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
                      <div className="flex flex-row items-center">
                        <Button
                          className="size-10 p-0"
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
                            className="size-4"
                            viewBox="0 0 32 32"
                          >
                            <path
                              fill="currentColor"
                              d="M6 5a1 1 0 0 0-2 0v22a1 1 0 1 0 2 0zm22.003 1.504c0-2.002-2.236-3.192-3.897-2.073l-14.003 9.432A2.5 2.5 0 0 0 10.09 18l14.003 9.56c1.66 1.132 3.91-.056 3.91-2.065z"
                            />
                          </svg>
                        </Button>
                        <Button
                          className="size-10 p-0"
                          variant="ghost"
                          onClick={(event) => {
                            setIsPlaying(!isPlaying);
                            event.stopPropagation();
                          }}
                        >
                          {isPlaying === true ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="size-8 bi bi-pause-fill"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              className="size-8 bi bi-play-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                            </svg>
                          )}
                        </Button>
                        <Button
                          className="size-10 p-0"
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
                            className="size-4"
                            viewBox="0 0 32 32"
                          >
                            <path
                              fill="currentColor"
                              d="M26.002 5a1 1 0 1 1 2 0v22a1 1 0 0 1-2 0zM3.999 6.504c0-2.002 2.236-3.192 3.897-2.073l14.003 9.432A2.5 2.5 0 0 1 21.912 18L7.909 27.56c-1.66 1.132-3.91-.056-3.91-2.065z"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </Card>
        </DrawerTrigger>
        <div>
          <DrawerContent className="z-[99999999] bg-white dark:bg-zinc-950 text-black dark:text-white flex flex-col rounded-t-xl h-screen mt-24 fixed bottom-0 left-0 right-0 border-neutral-800 focus:outline-none">
            <div className="p-0 md:p-2 sm:p-4 bg-white dark:bg-zinc-950 flex-1">
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  className="absolute hidden md:flex sm:flex top-4 left-4 sm:top-8 sm:left-8 items-center w-12 h-12 p-0 text-neutral-600 dark:text-neutral-400 opacity-75"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-10"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </DrawerClose>
              <div className="w-full flex flex-row mt-4 md:mt-12 sm:mt-0">
                <div className="flex justify-center sm:justify-end w-full md:w-1/2 sm:w-1/2 px-4 md:px-6 sm:px-12">
                  {songInfo.map((song) => (
                    <div>
                      <LazyLoadImage
                        effect="blur"
                        src={`${song.al.picUrl}?param=512y512`}
                        className="rounded-xl h-auto w-full sm:w-[28rem]"
                      />

                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col font-medium mt-2 px-2 py-1.5 space-y-0.5">
                          <h1 className="line-clamp-1 truncate text-lg w-56 md:w-64 sm:w-96 font-medium">
                            {song.name}
                          </h1>
                          <h2 className="text-lg font-normal opacity-75 truncate w-56 md:w-64 sm:w-96 -mt-1">
                            {song.ar.map((artist) => artist.name).join(" / ")}
                          </h2>
                        </div>
                        <div className="flex flex-row space-x-2">
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button
                                variant="ghost"
                                className="flex md:hidden sm:hidden size-10 p-0 items-center mt-6"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="currentColor"
                                  className="size-5 bi bi-chat-square-quote-fill"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.5a1 1 0 0 0-.8.4l-1.9 2.533a1 1 0 0 1-1.6 0L5.3 12.4a1 1 0 0 0-.8-.4H2a2 2 0 0 1-2-2zm7.194 2.766a1.688 1.688 0 0 0-.227-.272 1.467 1.467 0 0 0-.469-.324l-.008-.004A1.785 1.785 0 0 0 5.734 4C4.776 4 4 4.746 4 5.667c0 .92.776 1.666 1.734 1.666.343 0 .662-.095.931-.26-.137.389-.39.804-.81 1.22a.405.405 0 0 0 .011.59c.173.16.447.155.614-.01 1.334-1.329 1.37-2.758.941-3.706a2.461 2.461 0 0 0-.227-.4zM11 7.073c-.136.389-.39.804-.81 1.22a.405.405 0 0 0 .012.59c.172.16.446.155.613-.01 1.334-1.329 1.37-2.758.942-3.706a2.466 2.466 0 0 0-.228-.4 1.686 1.686 0 0 0-.227-.273 1.466 1.466 0 0 0-.469-.324l-.008-.004A1.785 1.785 0 0 0 10.07 4c-.957 0-1.734.746-1.734 1.667 0 .92.777 1.666 1.734 1.666.343 0 .662-.095.931-.26z" />
                                </svg>
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent className="z-[99999999999999]">
                              <div className="block md:hidden sm:hidden w-full h-[80vh] overflow-y-auto">
                                <div className="py-4 overflow-y-auto select-none mt-8">
                                  <div
                                    ref={lyricsContainerRef}
                                    style={{ maxHeight: "100%" }}
                                  >
                                    {lyrics.map((line, index) => {
                                      const translationLine =
                                        translatedLyrics.find(
                                          (translatedLine) =>
                                            translatedLine.timestamp ===
                                              line.timestamp && line.text !== ""
                                        );
                                      const highlightedIndex = lyrics.findIndex(
                                        (lyric) =>
                                          lyric.text === highlightedLine &&
                                          lyric.timestamp ===
                                            highlightedLineTimestamp
                                      );
                                      const isHighlightedRow =
                                        index === highlightedIndex;
                                      return (
                                        <p
                                          key={index}
                                          className={cn(
                                            "text-balance transition-all hover:bg-neutral-300/75 dark:hover:bg-neutral-700/25 w-auto rounded-lg px-8 flex flex-col space-y-0 cursor-pointer py-6 leading-tight",
                                            isHighlightedRow &&
                                              highlightedIndex !== -1 &&
                                              "font-medium text-[28px] blur-0",
                                            !isHighlightedRow &&
                                              "opacity-50 text-[26px] font-medium"
                                          )}
                                          onClick={() =>
                                            audioRef.current.seekTo(
                                              line.timestamp
                                            )
                                          }
                                          data-text={String(line.timestamp)}
                                        >
                                          <span className="tracking-tight break-words hyphens-auto leading-tight">
                                            {line.text ? (
                                              <>{line.text}</>
                                            ) : (
                                              <></>
                                            )}
                                          </span>
                                          {translationLine?.text && (
                                            <span className="text-[26px] text-neutral-700 dark:text-neutral-300 font-medium leading-tight">
                                              {translationLine.text}
                                            </span>
                                          )}
                                        </p>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </DrawerContent>
                          </Drawer>
                          <Button
                            variant="ghost"
                            className="size-10 p-0 items-center mt-6"
                            onClick={toggleLikeMusic}
                          >
                            {isLiked ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6"
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
                          </Button>
                        </div>
                      </div>

                      <div className="px-2">
                        <div className="flex mx-auto mt-2 flex-row justify-between">
                          <div className="w-10 text-xs md:text-sm sm:text-sm opacity-75">
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

                          <div className="w-10 text-xs md:text-sm sm:text-sm opacity-75">
                            -{formatTime(remainingTime)}
                          </div>
                        </div>

                        <div className="max-w-xs mx-auto flex flex-row justify-center mt-2">
                          <div className={cn("items-center mt-6")}>
                            <Button
                              className="size-8 p-0"
                              variant={
                                playMode === "loop" ? "secondary" : "ghost"
                              }
                              onClick={() =>
                                setPlayMode(
                                  playMode === "default" ? "loop" : "default"
                                )
                              }
                            >
                              <LoopIcon className="size-4" />
                            </Button>
                          </div>

                          <div>
                            <div className="px-4 mt-2 mx-auto flex flex-row space-x-2 justify-between transition-all duration-500">
                              <Button
                                variant="ghost"
                                className="size-10 mt-3 p-0"
                                onClick={() =>
                                  setCurrentSongIndex(
                                    (currentSongIndex - 1 + songIds.length) %
                                      songIds.length
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="size-6"
                                  viewBox="0 0 32 32"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M6 5a1 1 0 0 0-2 0v22a1 1 0 1 0 2 0zm22.003 1.504c0-2.002-2.236-3.192-3.897-2.073l-14.003 9.432A2.5 2.5 0 0 0 10.09 18l14.003 9.56c1.66 1.132 3.91-.056 3.91-2.065z"
                                  />
                                </svg>
                              </Button>
                              <Button
                                className="size-12 mt-2 p-0"
                                variant="ghost"
                                onClick={() => setIsPlaying(!isPlaying)}
                              >
                                {isPlaying === true ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="size-12 bi bi-pause-fill"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5" />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    className="size-12 bi bi-play-fill"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                  </svg>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                className="size-10 mt-3 p-0"
                                onClick={() =>
                                  setCurrentSongIndex(
                                    (currentSongIndex + 1) % songIds.length
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="size-6"
                                  viewBox="0 0 32 32"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M26.002 5a1 1 0 1 1 2 0v22a1 1 0 0 1-2 0zM3.999 6.504c0-2.002 2.236-3.192 3.897-2.073l14.003 9.432A2.5 2.5 0 0 1 21.912 18L7.909 27.56c-1.66 1.132-3.91-.056-3.91-2.065z"
                                  />
                                </svg>
                              </Button>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "transition-all duration-500 flex flex-row"
                            )}
                          >
                            <Button
                              className="size-8 mt-6 p-0"
                              onClick={() =>
                                setPlayMode(
                                  playMode === "shuffle" ? "default" : "shuffle"
                                )
                              }
                              variant={
                                playMode === "shuffle" ? "secondary" : "ghost"
                              }
                            >
                              <ShuffleIcon className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="px-2 flex flex-row space-x-2 mt-4 justify-center items-center">
                          <Button
                            variant="ghost"
                            onClick={() => setVolume(0)}
                            className="size-8 p-0 flex justify-center items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-4"
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
                            className="size-8 p-0 flex justify-center items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="size-4"
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
                <div className="hidden md:block sm:block w-1/2 h-screen overflow-y-auto px-16">
                  <ScrollArea className="h-screen relative">
                    <div className="fixed w-full top-0 bg-gradient-to-b from-white to-white/0 dark:from-zinc-950 dark:to-zinc-950/0 py-24 z-[9999999999999]" />
                    <div className="fixed w-full bottom-0 bg-gradient-to-t from-white to-white/0 dark:from-zinc-950 dark:to-zinc-950/0 py-24 z-[9999999999999]" />
                    <div className="py-4 overflow-y-auto select-none my-56">
                      <div
                        ref={lyricsContainerRef}
                        style={{ maxHeight: "100%" }}
                      >
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
                                line.text !== "" &&
                                "text-balance transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 w-auto rounded-xl px-8 flex flex-col space-y-0 cursor-pointer py-6 leading-tight",
                                isHighlightedRow &&
                                  highlightedIndex !== -1 &&
                                  "font-medium text-[1.75rem] md:text-[32px] sm:text-[32px] blur-0",
                                !isHighlightedRow &&
                                  "text-neutral-600 dark:text-neutral-400 text-[28px] sm:text-[30px] font-medium blur-[1px]"
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
                                <span className="text-2xl md:text-2xl sm:text-3xl text-neutral-700 dark:text-neutral-300 leading-tight">
                                  {translationLine.text}
                                </span>
                              )}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </DrawerContent>
        </div>
      </Drawer>
    </div>
  );
};

export default Player;
