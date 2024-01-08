import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { SongIdsContext } from "@/components/layout/SongIdsContext";
import axios from "axios";
import site from "@/lib/site.config";
import Container from "@/components/layout/Container";
import Display from "@/components/layout/Carousel";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";

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
      return plData; // 返回Promise对象
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
      return songData; // 返回Promise对象
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    Promise.all([fetchNewPl(), fetchNewSongs()])
      .then(([plData, songData]) => {
        setPlaylist(plData);
        setSongs(songData);
      })
      .catch((error) => {
        console.log(
          "An error occurred while fetching new playlist and songs:",
          error
        );
      });
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
    <Container title="现在就听">
      {userData && (
        <>
          {!playlist.length && <Spinner />}
          {playlist.length && (
            <>
              <h1>现在就听</h1>
              <h6 className="mb-2">每日推荐好音乐，您的专属.</h6>
              <Separator />
              <h2 className="mt-4">歌单</h2>
              <h6 className="mb-2">你的最爱，每日更新.</h6>
              <Separator />
              <Display source={playlist} type="playlist" />
              <h2 className="mt-4">歌曲</h2>
              <h6 className="mb-2">你的最爱，每日更新.</h6>
              <Separator />
              <Display source={songs} type="songs" /> <br />
              <br />
            </>
          )}
        </>
      )}

      {!userData && <div className="font-medium text-center">请先登录.</div>}
    </Container>
  );
}
