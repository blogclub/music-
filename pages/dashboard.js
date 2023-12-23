import Container from "@/components/layout/Container";

import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import site from "@/lib/site.config";
import moment from "moment";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Display from "@/components/layout/Carousel";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const [userDetail, setUserDetail] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [artist, setArtist] = useState([]);
  const [mv, setMv] = useState([]);
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  const cookie = localStorage.getItem("cookie");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `${site.api}/user/detail?uid=${userData.data.account.id}&t=${Date.now}`
        );
        const userDetails = response.data;
        setUserDetail(userDetails);
        console.log(response.data);

        const playlistResponse = await axios.get(
          `${site.api}/user/playlist?uid=${userData.data.account.id}`
        );
        const playlistData = playlistResponse.data;
        setPlaylists(playlistData.playlist);

        const artist = await axios.get(
          `${site.api}/artist/sublist?cookie=${cookie}`
        );
        const artistData = artist.data;
        setArtist(artistData.data);

        const mv = await axios.get(`${site.api}/mv/sublist?cookie=${cookie}`);
        const mvData = mv.data;
        setMv(mvData.data);
      } catch (error) {
        console.error(error);
        // 处理错误
      }
    }

    fetchData(); // 调用 fetchData 函数来获取用户详情和歌单数据
  }, []); // 空数组作为依赖项，确保只在组件挂载后调用一次

  const handleSignin = async () => {
    try {
      const response = await axios.get(
        `${site.api}/daily_signin?cookie=${cookie}`
      );
      console.log("签到成功", response.data);
      alert("签到成功，经验 + 3.请勿重复签到！");
      // 处理签到结果
      // ...
    } catch (error) {
      console.error("签到失败", error);
      alert("签到失败，需要登录.请勿重复签到！");
    }
  };

  const router = useRouter();

  const logout = () => {
    // 清除本地存储的 cookie 和用户数据
    localStorage.removeItem("cookie");
    localStorage.removeItem("userData");
    router.reload();
  };
  return (
    <Container title="Dashboard">
      {userDetail === null && (
        <div className="animate-pulse">
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 relative h-[24rem] overflow-hidden"></div>
          <div className="rounded-full absolute bg-white dark:bg-black p-2 ml-12 w-28 h-28 -mt-12"></div>
        </div>
      )}
      {userDetail !== null && (
        <div>
          <div className="relative h-full md:h-[24rem] sm:h-[24rem] overflow-hidden">
            <LazyLoadImage
              effect="blur"
              className="w-full h-full object-cover"
              src={userDetail.profile.backgroundUrl}
            />
          </div>
          <div className="rounded-full absolute bg-white dark:bg-black p-2 ml-12 -mt-12">
            <LazyLoadImage
              effect="blur"
              className="w-28 h-28 rounded-full"
              src={userDetail.profile.avatarUrl}
            />
          </div>
          <div className="mt-24 font-medium px-6 mb-16">
            <h1 className="font-semibold text-xl md:text-2xl sm:text-3xl ml-6 mt-2">
              {userDetail.profile.nickname}
            </h1>
            <p className="opacity-75 text-sm mt-1 ml-16">
              Lv.{userDetail.level}
            </p>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              {userDetail.profile.signature}
            </p>
            <p className="mt-4 text-lg">
              Joined{" "}
              <span className="font-bold">
                {moment(userDetail.profile.createTime).format("YYYY年MM月DD日")}
              </span>
            </p>
            <div className="mt-4 text-lg">
              <span className="font-bold">{userDetail.profile.followeds}</span>{" "}
              Followed·{" "}
              <span className="font-bold"> {userDetail.profile.follows}</span>{" "}
              Following
            </div>
          </div>
        </div>
      )}
      <br />

      <>
        <h2>Favorited Playlists</h2>
        <h6 className="mb-2">Songs You Like.</h6>
        <Separator />
        <Display type="playlist" source={playlists} />
      </>

      <br />

      <>
        <h2>Favorited Artists</h2>
        <h6 className="mb-2">Artists You Like.</h6>
        <Separator />
        <Display type="artist" source={artist} />
      </>

      <br />

      <>
        <h2>Favorited Music Videos</h2>
        <h6 className="mb-2">Music Videos You Like.</h6>
        <Separator />
        <Display type="mv" source={mv} />
      </>
    </Container>
  );
}
