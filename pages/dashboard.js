import Container from "@/components/layout/Container";

import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import site from "@/lib/site.config";
import moment from "moment";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Display from "@/components/layout/Carousel";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreatePlaylist from "@/components/layout/CreatePlaylist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          `${site.api}/user/playlist?uid=${userData.data.account.id}&cookie=${cookie}`
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
  const filteredPlaylists = playlists.filter(
    (playlist) => playlist.subscribed === true
  );
  const createdPlaylists = playlists.filter(
    (playlist) => playlist.creator.userId === userData.data.account.id
  );
  return (
    <Container title="仪表盘">
      {userDetail === null && <Spinner />}
      {userDetail !== null && (
        <>
          <Card>
            <p className="mt-4 text-sm text-center text-neutral-500">
              加入于
              <span className="font-bold">
                {moment(userDetail.profile.createTime).format("YYYY年MM月DD日")}
              </span>
            </p>
            <div className="flex justify-center h-80">
              <LazyLoadImage
                effect="blur"
                className="rounded-full w-72 mt-6"
                src={`${userDetail.profile.avatarUrl}?param=256y256`}
              />
            </div>
            <div className="mt-8 px-16 py-8 flex flex-row justify-between">
              <h1 className="items-center">
                {userDetail.profile.nickname}
                <Badge className="ml-2 -mt-4 rounded-full">
                  Lv.{userDetail.level}
                </Badge>
              </h1>
              <div className="items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-10"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </Card>
          <br />
          <>
            <h2>你的歌单</h2>
            <h6 className="mb-2">你喜欢的音乐.</h6>
            <Separator />

            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-row justify-between mt-4">
                <TabsList>
                  <TabsTrigger value="all">
                    全部歌单
                    <sup className="font-extrabold">{playlists.length}</sup>
                  </TabsTrigger>
                  <TabsTrigger value="create">
                    创建的歌单
                    <sup className="font-extrabold">
                      {createdPlaylists.length}
                    </sup>
                  </TabsTrigger>
                  <TabsTrigger value="favorite">
                    收藏的歌单
                    <sup className="font-extrabold">
                      {filteredPlaylists.length}
                    </sup>
                  </TabsTrigger>
                </TabsList>
                <CreatePlaylist />
              </div>
              <TabsContent value="all">
                <Display type="playlist" source={playlists} />
              </TabsContent>
              <TabsContent value="create">
                <Display type="playlist" source={createdPlaylists} />
              </TabsContent>
              <TabsContent value="favorite">
                <Display type="playlist" source={filteredPlaylists} />
              </TabsContent>
            </Tabs>
          </>
          <br />
          <>
            <h2>关注的艺术家</h2>
            <h6 className="mb-2">你喜欢的艺术家.</h6>
            <Separator />
            <Display type="artist" source={artist} />
          </>
          <br />
          <>
            <h2>收藏的音乐视频</h2>
            <h6 className="mb-2">你喜欢的音乐视频.</h6>
            <Separator />
            <Display type="mv" source={mv} />
          </>
        </>
      )}
    </Container>
  );
}
