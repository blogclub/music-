import React, { useState, useEffect, useContext } from "react";
import { SongIdsContext } from "@/components/layout/SongIdsContext";
import { useRouter } from "next/router";
import Container from "@/components/layout/Container";
import Display from "@/components/layout/Carousel";
import { Separator } from "@/components/ui/separator";

import site from "@/lib/site.config";

const MusicSearch = () => {
  const router = useRouter();
  const keywords = router.query.keywords || null;
  const [keyword, setKeyword] = useState("");
  const [word, setWord] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [songDetail, setSongDetail] = useState([]);
  const [artistDetail, setArtistDetail] = useState([]);
  const [playlistDetail, setPlaylistDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hotSearchList, setHotSearchList] = useState([]);
  const [albumDetail, setAlbumDetail] = useState([]);
  const [videoDetail, setVideoDetail] = useState([]);
  const [mvDetail, setMvDetail] = useState([]);

  useEffect(() => {
    const fetchHotSearchList = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${site.api}/search/hot/detail`);
        const data = await response.json();
        if (data && data.code === 200) {
          setHotSearchList(data.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching hot search list:",
          error
        );
      }
    };

    fetchHotSearchList();
  }, []);

  useEffect(() => {
    const searchKeywords = localStorage.getItem("searchKeywords");

    if (searchKeywords) {
      setKeyword(searchKeywords);
      setWord(searchKeywords);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (keywords) {
        try {
          const [
            songResponse,
            artistResponse,
            playlistResponse,
            albumResponse,
            mvResponse,
            videoResponse,
          ] = await Promise.all([
            fetch(
              `${site.api}/search?keywords=${encodeURIComponent(keywords)}`
            ),
            fetch(
              `${site.api}/search?type=100&keywords=${encodeURIComponent(
                keywords
              )}`
            ),
            fetch(
              `${site.api}/search?type=1000&keywords=${encodeURIComponent(
                keywords
              )}`
            ),
            fetch(
              `${site.api}/search?type=10&keywords=${encodeURIComponent(
                keywords
              )}`
            ),
            fetch(
              `${site.api}/search?type=1004&keywords=${encodeURIComponent(
                keywords
              )}`
            ),
            fetch(
              `${site.api}/search?type=1014&keywords=${encodeURIComponent(
                keywords
              )}`
            ),
          ]);

          const songData = await songResponse.json();
          const artistData = await artistResponse.json();
          const playlistData = await playlistResponse.json();
          const albumData = await albumResponse.json();
          const mvData = await mvResponse.json();
          const videoData = await videoResponse.json();

          if (songData && songData.code === 200) {
            const songIds = songData.result.songs.map((song) => song.id);
            await fetchSongDetails(songIds);
          }

          if (artistData && artistData.code === 200) {
            setArtistDetail(artistData.result.artists);
          }

          if (playlistData && playlistData.code === 200) {
            setPlaylistDetail(playlistData.result.playlists);
          }

          if (albumData && albumData.code === 200) {
            setAlbumDetail(albumData.result.albums);
          }

          if (mvData && mvData.code === 200) {
            setMvDetail(mvData.result.mvs);
          }

          if (videoData && videoData.code === 200) {
            setVideoDetail(videoData.result.videos);
          }

          localStorage.setItem("searchKeywords", keywords); // 将搜索关键词保存在本地存储中
        } catch (error) {
          console.log("An error occurred while searching:", error);
        } finally {
        }
      }
    };

    const fetchSongDetails = async (songIds) => {
      try {
        const response = await fetch(
          `${site.api}/song/detail?ids=${songIds.join(",")}`
        );
        const data = await response.json();
        if (data && data.code === 200) {
          setSongDetail(data.songs);
        }
      } catch (error) {
        console.log("An error occurred while fetching song details:", error);
      }
    };

    fetchData();
  }, [keywords]);

  const {
    songIds,
    currentSongIndex,
    setCurrentSongIndex,
    addAllToPlaylist,
    addToPlaylist,
  } = useContext(SongIdsContext);

  const playingSongId = songIds[currentSongIndex];

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const handlePlayAll = () => {
    const trackIds = playlistTrack.map((track) => track.id);
    addAllToPlaylist(trackIds); // 将所有歌曲ID传递给 addAllToPlaylist 函数
  };

  return (
    <Container title={keywords && `Search Result of ${keywords}`}>
      <>
        <h1 className="mb-2">Result of '{keywords}'</h1>
        <Separator />
        <h2 className="mt-4">Songs</h2>
        <h6 className="mb-2">Singles</h6>
        <Separator />
        <Display source={songDetail} type="songs" />
        <h2 className="mt-4 mb-2">Playlists</h2>
        <Separator />
        <Display source={playlistDetail} type="playlist" />
        <h2 className="mt-4 mb-2">Albums</h2>
        <Separator />
        <Display source={albumDetail} type="album" />
        <h2 className="mt-4 mb-2">Artists</h2>
        <Separator />
        <Display source={artistDetail} type="artist" />
        <h2 className="mt-4 mb-2">Music Video</h2>
        <Separator />
        <Display source={mvDetail} type="mv" />
      </>

      <br />
    </Container>
  );
};

export default MusicSearch;
