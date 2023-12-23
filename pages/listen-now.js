import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { SongIdsContext } from "@/components/layout/SongIdsContext";
import axios from "axios";
import site from "@/lib/site.config";
import Container from "@/components/layout/Container";
import Display from "@/components/layout/Carousel";
import { Separator } from "@/components/ui/separator";

export default function ListenNow() {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [songs, setSongs] = useState([]);
  const [fm, setFm] = useState([]);
  const [songId, setSongId] = useState([]);
  const [songDetails, setSongDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState("");
  const [playStatus, setPlayStatus] = useState(0);

  const fetchNewPl = async () => {
    try {
      const response = await axios.get(
        `${site.api}/recommend/resource?cookie=${cookie}`
      );
      const data = response.data;
      const plData = data.recommend;
      setPlaylist(plData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNewSongs = async () => {
    try {
      const response = await axios.get(
        `${site.api}/recommend/songs?cookie=${cookie}`
      );
      const data = response.data.data;
      const songData = data.dailySongs;
      setSongs(songData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNewPl();
    fetchNewSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await axios.get(
        `${site.api}/personal_fm?cookie=${cookie}`
      );

      if (response.data.code === 200) {
        const data = response.data;
        setFm(data.data);
        setSongId(data.data.map((song) => song.id));
        fetchSongDetails(data.data.map((song) => song.id));
      } else {
        console.log("获取私人FM失败！");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  const { songIds, currentSongIndex, isPlaying, setIsPlaying, addToPlaylist } =
    useContext(SongIdsContext);

  const fetchSongDetails = async (songId) => {
    try {
      const response = await fetch(
        `${site.api}/song/detail?ids=${songId.join(",")}`
      );
      const data = await response.json();
      if (data && data.code === 200) {
        setSongDetails(data.songs);
        setCurrent(data.songs[0].id);
      }
    } catch (error) {
      console.log("An error occurred while fetching song details:", error);
    }
  };

  useEffect(() => {
    if (playStatus === 2) {
      fetchSongs();
    }
  }, [playStatus, []]);

  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  const cookie = localStorage.getItem("cookie");

  useEffect(() => {
    if (userData) {
      checkLikedMusic(userData.data.account.id, current);
    }
  }, [current]);

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
  return (
    <Container title="Listen Now">
      {userData && (
        <>
          <h1>Listen Now</h1>
          <h6 className="mb-2">Daily Recommendation, Made for You.</h6>
          <Separator />
          <h2 className="mt-4">Playlists</h2>
          <h6 className="mb-2">Your favorite, updated daily.</h6>
          <Separator />
          <Display source={playlist} type="playlist" />
          <h2 className="mt-4">Songs</h2>
          <h6 className="mb-2">Your favorite, updated daily.</h6>
          <Separator />

          <Display source={songs} type="songs" />
        </>
      )}
      <br />
      <br />

      {!userData && (
        <div className="font-medium text-center">Please Login First.</div>
      )}
    </Container>
  );
}
