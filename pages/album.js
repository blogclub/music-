import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { SongIdsContext } from "@/components/layout/SongIdsContext";
import axios from "axios";
import site from "@/lib/site.config";

import Container from "@/components/layout/Container";
import SmSoCard from "@/components/ui/cards/SmSoCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";

export default function Album() {
  const router = useRouter();
  const id = router.query.id || null;
  const [albumDetail, setAlbumDetail] = useState(null);
  const [albumTrack, setAlbumTrack] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 搜索关键词状态
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id !== null) {
      Promise.all([
        axios.get(`${site.api}/album/detail/dynamic`, {
          params: {
            id: id,
            cookie: cookie,
          },
        }),
        fetch(`${site.api}/album?id=${id}`).then(response => response.json())
      ]).then(([response, data]) => {
        setIsFavorited(response.data.subscribed);
        setAlbumDetail(data);
        setAlbumTrack([data.songs]);
      }).catch(error => {
        console.error(error);
        // 处理错误
      });
    }
  }, [id]);

  const cookie = localStorage.getItem("cookie");

  async function handleFavoriteAlbum(type, id) {
    try {
      const response = await axios.get(
        `${site.api}/album/sub?t=${type}&id=${id}&cookie=${cookie}`
      );
      // 根据返回的响应结果更新收藏状态
      setIsFavorited(type === 1);
    } catch (error) {
      console.error(error);
    }
  }

  const { songIds, addAllToPlaylist, addToPlaylist } =
    useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const handlePlayAll = () => {
    const trackIds = albumTrack[0].map((track) => track.id);
    addAllToPlaylist(trackIds); // 将所有歌曲ID传递给 addAllToPlaylist 函数
  };
  return (
    <Container title={albumDetail !== null && albumDetail.album.name}>
      {albumDetail === null && <Spinner />}
      {albumDetail !== null && (
        <>
          <Card>
            <div className="flex flex-col sm:flex-row space-x-4 w-full h-auto sm:w-full sm:h-96">
              <div className="w-full h-full sm:size-96">
                <LazyLoadImage
                  effect="blur"
                  className="rounded-xl h-full w-full sm:size-96"
                  src={`${
                    albumDetail !== null && albumDetail.album.picUrl
                  }?param=512y512`}
                />
              </div>
              <div className="w-1/2">
                <CardHeader>
                  <CardTitle className="font-semibold text-3xl">
                    {albumDetail !== null && albumDetail.album.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-2">
                      <Badge variant="secondary" className="rounded-full mr-2">
                        专辑
                      </Badge>
                      By {` `}
                      {albumDetail !== null &&
                        albumDetail.album.artists
                          .map((artist) => artist.name)
                          .join(" / ")}
                      , {albumDetail.songs.length}首歌
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 dark:text-neutral-400 my-4 line-clamp-6">
                    {albumDetail !== null && albumDetail.album.description}
                    {albumDetail !== null &&
                      albumDetail.album.description === null &&
                      "没有简介"}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-row space-x-4">
                    <Button variant="secondary" onClick={handlePlayAll}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4 mr-2"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                          clipRule="evenodd"
                        />
                      </svg>
                     播放全部
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handleFavoriteAlbum(isFavorited ? 2 : 1, id)
                      }
                    >
                      {!isFavorited ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="size-4 mr-2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {isFavorited ? "取消收藏" : "收藏"}
                    </Button>
                  </div>
                </CardFooter>
              </div>
            </div>
          </Card>
          <br />
          <div className="mt-6 mx-auto">
            {!albumTrack && <Spinner />}
            {albumTrack &&
              albumTrack[0].map((track, index) => (
                <SmSoCard
                  key={track.id}
                  index={index}
                  id={track.id}
                  name={track.name}
                  duration={track.dt}
                  ar={track.ar.map((artist) => artist.name).join(" / ")}
                  picUrl={track.al.picUrl}
                  arid={track.ar[0].id}
                />
              ))}
          </div>

          <br />
        </>
      )}
    </Container>
  );
}
