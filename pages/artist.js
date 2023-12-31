import Container from "@/components/layout/Container";
import { LazyLoadImage } from "react-lazy-load-image-component";

import axios from "axios";
import { useState, useEffect } from "react";
import site from "@/lib/site.config";
import { useRouter } from "next/router";
import Display from "@/components/layout/Carousel";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";

export default function Artist() {
  const [arData, setArData] = useState(null);
  const [arSongs, setArSongs] = useState(null);
  const [arMVs, setArMVs] = useState(null);
  const [arAlbums, setArAlbums] = useState(null);
  const [similarArtists, setSimilarArtists] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const cookie = localStorage.getItem("cookie");

  useEffect(() => {
    if (id) {
      const getArDetail = async () => {
        try {
          setIsLoading(true);
          const arDataResponse = await axios.get(
            `${site.api}/artist/detail?id=${id}`
          );
          if (arDataResponse.data.code === 200) {
            setArData(arDataResponse.data.data.artist);
          }
        } catch (error) {
          console.error("An error occurred while fetching Ar data:", error);
        }
      };

      const getArSongs = async () => {
        try {
          const arSongsResponse = await axios.get(
            `${site.api}/artist/top/song?id=${id}`
          );
          if (arSongsResponse.data.code === 200) {
            setArSongs(arSongsResponse.data.songs);
          }
        } catch (error) {
          console.error("An error occurred while fetching ArSongs:", error);
        }
      };

      const getArMVs = async () => {
        try {
          const arMVsResponse = await axios.get(
            `${site.api}/artist/mv?id=${id}&limit=100`
          );
          if (arMVsResponse.data.code === 200) {
            setArMVs(arMVsResponse.data.mvs);
          }
        } catch (error) {
          console.error("An error occurred while fetching ArMVs:", error);
        }
      };

      const getArAlbums = async () => {
        try {
          const arAlbumsResponse = await axios.get(
            `${site.api}/artist/album?id=${id}`
          );
          if (arAlbumsResponse.data.code === 200) {
            setArAlbums(arAlbumsResponse.data.hotAlbums);
          }
        } catch (error) {
          console.error("An error occurred while fetching ArAlbums:", error);
        }
      };

      const getSimilarArtists = async () => {
        try {
          const similarArtistsResponse = await axios.get(
            `${site.api}/simi/artist?id=${id}&cookie=${cookie}`
          );
          if (similarArtistsResponse.data.code === 200) {
            setSimilarArtists(similarArtistsResponse.data.artists);
          }
        } catch (error) {
          console.error(
            "An error occurred while fetching SimilarArtists:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

      getArDetail();
      getArSongs();
      getArMVs();
      getArAlbums();
      getSimilarArtists();
    }

    return () => {
      setArData(null);
    };
  }, [id]);
  return (
    <Container title={arData && arData.name}>
      {!arData && <Spinner />}
      {arData && (
        <>
          <Card>
            <div className="flex justify-center h-80">
              <LazyLoadImage
                effect="blur"
                className="rounded-full w-72 mt-6"
                src={`${arData.avatar}?param=256y256`}
              />
            </div>
            <div className="mt-8 px-16 py-8 flex flex-row justify-between">
              <h1 className="items-center">{arData.name}</h1>
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
          <h2 className="mt-4">简介</h2>
          <h6 className="mb-2">了解这个艺术家.</h6>
          <Separator />
          <p className="mt-6 text-sm md:text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            {arData.briefDesc}
          </p>

          <h2 className="mt-4">单曲</h2>
          <h6 className="mb-2">50首热门单曲.</h6>
          <Separator />

          <Display type="songs" source={arSongs} />
          <h2 className="mt-4">音乐视频</h2>
          <h6 className="mb-2">火热视频.</h6>
          <Separator />

          <Display type="mv" source={arMVs} />
          <h2 className="mt-4">专辑</h2>
          <h6 className="mb-2">可能是你的珍藏.</h6>
          <Separator />

          <Display type="album" source={arAlbums} />

          {similarArtists !== null && similarArtists && (
            <>
              <h2 className="mt-4">相似艺术家</h2>
              <h6 className="mb-2">你可能也会喜欢.</h6>
              <Separator />

              <Display type="artist" source={similarArtists} />
            </>
          )}
        </>
      )}
    </Container>
  );
}
