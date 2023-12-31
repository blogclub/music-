import Container from "@/components/layout/Container";
import Display from "@/components/layout/Carousel";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import site from "@/lib/site.config";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [newMv, setNewMv] = useState([]);
  const [newSongs, setNewSongs] = useState([]);
  const [songIds, setSongIds] = useState([]);
  const [songDetails, setSongDetails] = useState([]);
  const [newAl, setNewAl] = useState([]);
  const [newAr, setNewAr] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [tagedPlaylist, setTagedPlaylist] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTags = await fetch(
          `${site.api}/playlist/highquality/tags`
        );
        const dataTags = await responseTags.json();
        if (dataTags && dataTags.code === 200) {
          setTags(dataTags.tags);
        }

        const responseHighQualityPlaylists = await fetch(
          `${site.api}/personalized`
        );
        const dataHighQualityPlaylists =
          await responseHighQualityPlaylists.json();
        if (dataHighQualityPlaylists && dataHighQualityPlaylists.code === 200) {
          setPlaylists(dataHighQualityPlaylists.result);
        }

        const responseNewSongs = await fetch(
          `${site.api}/personalized/newsong`
        );
        const dataNewSongs = await responseNewSongs.json();
        if (dataNewSongs && dataNewSongs.code === 200) {
          setNewSongs(dataNewSongs.result);
          setSongIds(dataNewSongs.result.map((song) => song.id));
          const responseSongDetails = await fetch(
            `${site.api}/song/detail?ids=${dataNewSongs.result
              .map((song) => song.id)
              .join(",")}`
          );
          const dataSongDetails = await responseSongDetails.json();
          if (dataSongDetails && dataSongDetails.code === 200) {
            setSongDetails(dataSongDetails.songs);
          }
        }
        const responseNewAl = await fetch(`${site.api}/album/newest`);
        const dataNewAl = await responseNewAl.json();
        const alData = dataNewAl.albums;
        setNewAl(alData);

        const responseNewMV = await fetch(`${site.api}/personalized/mv`);
        const dataNewMV = await responseNewMV.json();
        if (dataNewMV && dataNewMV.code === 200) {
          setNewMv(dataNewMV.result);
        }

        const responseNewAr = await fetch(`${site.api}/top/artists`);
        const dataNewAr = await responseNewAr.json();
        if (dataNewAr && dataNewAr.code === 200) {
          setNewAr(dataNewAr.artists);
        }
      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      } finally {
      }
    };

    fetchData();
  }, []);

  const fetchDataByTag = async (tag) => {
    try {
      setIsLoading(true);

      // 根据标签获取精品歌单
      const responsePlaylists = await fetch(
        `${site.api}/top/playlist/highquality?cat=${tag}`
      );
      const dataPlaylists = await responsePlaylists.json();
      if (dataPlaylists && dataPlaylists.code === 200) {
        setTagedPlaylist(dataPlaylists.playlists);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("An error occurred while fetching playlists data:", error);
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    fetchDataByTag(tag);
  };

  return (
    <Container title="探索">
      <h1>探索</h1>
      <h6 className="mb-2">永远保持最新</h6>
      <Separator />
      <h2 className="mt-4">歌单</h2>
      <h6 className="mb-2">人们的最爱</h6>
      <Separator />
      <Display source={playlists} type="playlist" />
      <h2 className="mt-4">歌曲</h2>
      <h6 className="mb-2">新歌速递</h6>
      <Separator />
      <Display source={songDetails} type="songs" />
      <h2 className="mt-4">专辑</h2>
      <h6 className="mb-2">新碟上架</h6>
      <Separator />
      <Display source={newAl} type="album" />
      <h2 className="mt-4">艺术家</h2>
      <h6 className="mb-2">最受欢迎</h6>
      <Separator />
      <Display source={newAr} type="artist" />
      <h2 className="mt-4">按类别浏览</h2>
      <h6 className="mb-2">探索不同风格</h6>
      <Separator />

      <Card className="mt-4 text-justify rounded-xl px-2 py-2">
        {tags.map((tag) => (
          <Button
            variant={selectedTag === tag.name ? "secondary" : "ghost"}
            key={tag.id}
            onClick={() => handleTagClick(tag.name)}
          >
            {tag.name}
          </Button>
        ))}
      </Card>
      {selectedTag !== "" && <Display source={tagedPlaylist} type="playlist" />}
      <br />
      <br />
    </Container>
  );
}
