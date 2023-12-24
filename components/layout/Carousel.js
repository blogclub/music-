import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import cn from "classnames";
import PlCard from "../ui/cards/PlCard";
import AlCard from "../ui/cards/AlCard";
import ArCard from "../ui/cards/ArCard";
import SoCard from "../ui/cards/SoCard";
import MvCard from "../ui/cards/MvCard";

export default function Display({ source, type }) {
  return (
    <Carousel className="mt-4">
      <CarouselContent>
        {source &&
          source.map((source, index) => (
            <CarouselItem
              className={cn(
                "",
                type === "playlist" && "basis-[85%] md:basis-3/5 sm:basis-1/3",
                type === "songs" && "basis-3/5 md:basis-2/5 sm:basis-1/5",
                type === "album" && "basis-3/5 md:basis-2/5 sm:basis-1/5",
                type === "artist" && "basis-3/5 md:basis-2/5 sm:basis-1/5",
                type === "mv" && "basis-[85%] md:basis-3/5 sm:basis-1/3"
              )}
            >
              {type === "playlist" && (
                <PlCard
                  key={source.id}
                  index={index}
                  picUrl={source.picUrl ? source.picUrl : source.coverImgUrl}
                  name={source.name}
                  id={source.id}
                  copywriter={source.copywriter}
                  playCount={
                    source.playcount ? source.playcount : source.playCount
                  }
                />
              )}
              {type === "songs" && (
                <SoCard
                  key={source.id}
                  index={index}
                  id={source.id}
                  name={source.name}
                  duration={source.durationTime}
                  ar={
                    source.ar
                      ? source.ar.map((artist) => artist.name).join(" / ")
                      : source.artists.map((artist) => artist.name).join(" / ")
                  }
                  arid={source.ar ? source.ar[0].id : source.artists[0].id}
                  picUrl={source.al ? source.al.picUrl : source.album.picUrl}
                />
              )}
              {type === "album" && (
                <AlCard
                  key={index}
                  index={index}
                  picUrl={source.picUrl}
                  name={source.name}
                  ar={source.artists.map((artist) => artist.name).join(" / ")}
                  id={source.id}
                />
              )}
              {type === "artist" && (
                <ArCard
                  key={index}
                  index={index}
                  picUrl={source.picUrl}
                  name={source.name}
                  id={source.id}
                />
              )}
              {type === "mv" && (
                <MvCard
                  key={source.id ? source.id : source.vid}
                  index={index}
                  id={source.id || source.vid}
                  name={source.name ? source.name : source.title}
                  ar={
                    source.artists && source.artists.length > 0
                      ? source.artists.map((artist) => artist.name).join(" / ")
                      : source.creator && source.creator.length > 0
                      ? source.creator.map((artist) => artist.name).join(" / ")
                      : ""
                  }
                  picUrl={source.cover || source.imgurl || source.coverUrl}
                />
              )}
            </CarouselItem>
          ))}
        {(!source || source.length === 0) && (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(() => (
              <CarouselItem
                className={cn(
                  type === "playlist" && "basis-[85%] md:basis-3/5 sm:basis-1/3",
                  type === "songs" && "basis-3/5 md:basis-2/5 sm:basis-1/5",
                  type === "album" && "basis-3/5 md:basis-2/5 sm:basis-1/5",
                  type === "artist" && "basis-3/5 md:basis-2/5 sm:basis-1/5",
                  type === "mv" && "basis-[85%] md:basis-3/5 sm:basis-1/3"
                )}
              >
                <Skeleton
                  style={{ paddingBottom: "100%" }}
                  className="rounded-xl w-full h-auto"
                />
              </CarouselItem>
            ))}
          </>
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
