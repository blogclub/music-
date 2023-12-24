import Container from "@/components/layout/Container";

import { useRouter } from "next/router";
import axios from "axios";
import { useState, useEffect } from "react";

import site from "@/lib/site.config";
import Display from "@/components/layout/Carousel";
import Spinner from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Mv() {
  const [mvData, setMvData] = useState(null);
  const [mvUrl, setMvUrl] = useState(null);
  const [simiMv, setSimiMv] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const cookie = localStorage.getItem("cookie");

  const getMvData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${site.api}/mv/detail?mvid=${id}`);
      if (response.data.code === 200) {
        setMvData(response.data.data);
      }
    } catch (error) {
      console.log("An error occurred while fetching MV data:", error);
    }
  };

  const getMvUrl = async () => {
    try {
      const response = await axios.get(`${site.api}/mv/url?id=${id}`);
      if (response.data.code === 200) {
        setMvUrl(response.data.data.url);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("An error occurred while fetching MV URL:", error);
    }
  };

  const getSimiMv = async () => {
    try {
      const response = await axios.get(
        `${site.api}/simi/mv?mvid=${id}&cookie=${cookie}&t=${Date.now}`
      );
      if (response.data.code === 200) {
        setSimiMv(response.data.mvs);
      }
    } catch (error) {
      console.log("An error occurred while fetching Similar MV:", error);
    }
  };

  useEffect(() => {
    getMvData();
    getMvUrl();
    getSimiMv();
  }, [id]);
  return (
    <Container title={mvData && mvData.name}>
      {!mvData && <Spinner />}
      {mvUrl && mvData && (
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1>{mvData.name}</h1>
            <div className="my-2" />
            <div className="text-sm">
              <Badge className="mr-2">Music Video</Badge> By {mvData.artistName}
            </div>
          </div>
          <video
            controls
            src={mvUrl}
            className="rounded-none md:rounded-xl sm:rounded-xl w-full mt-4"
          ></video>
        </div>
      )}
      <br />
      {simiMv !== null && simiMv && (
        <>
          <h2 className="mt-4">Similar Music Video</h2>
          <h6 className="mb-2">Similar. To present for you.</h6>
          <Separator />
          <Display type="mv" source={simiMv} />
        </>
      )}
    </Container>
  );
}
