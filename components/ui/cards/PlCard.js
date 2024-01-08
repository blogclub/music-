import { LazyLoadImage } from "react-lazy-load-image-component";
import { useRouter } from "next/router";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "../button";
import cn from "classnames";
import { Card } from "../card";
import { Separator } from "../separator";

export default function PlCard({
  picUrl,
  id,
  name,
  index,
  creator,
  avatarUrl,
  playCount,
}) {
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);

  function formatPlayCount(playCount) {
    if (playCount >= 10000) {
      return (playCount / 10000).toFixed(1) + "万";
    }
    if (playCount >= 1000) {
      return (playCount / 1000).toFixed(1) + "千";
    } else {
      return playCount.toString();
    }
  }

  return (
    <Card
      key={index}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="relative cursor-pointer py-0 size-full"
      onClick={() => router.push(`/playlist?id=${id}`)}
    >
      <AspectRatio ratio={1} className="relative">
        <LazyLoadImage
          effect="blur"
          src={`${picUrl}?param=384y384`}
          className="size-full transition-all  bg-neutral-200 dark:bg-neutral-800 rounded-t-xl"
        />
        {isHover && (
          <Button
            onClick={() => router.push(`/playlist?id=${id}`)}
            className="absolute inset-0 w-32 mx-auto my-auto transition-all duration-500 rounded-3xl"
          >
            现在就听
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 ml-2"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        )}
      </AspectRatio>
      <div
        className={cn(
          "transition-all relative rounded-b-xl overflow-hidden bg-white/75 dark:bg-zinc-950/75 z-[9999] backdrop-blur-3xl"
        )}
      >
        <img
          src={`${picUrl}?param=384y384`}
          className="absolute top-0 bottom-0 left-0 right-0 z-[-1] rounded-b-xl blur-lg"
        />
        <div
          className={cn(
            "bg-white/75 dark:bg-zinc-950/75 z-[9999] backdrop-blur-3xl px-1.5 py-2"
          )}
        >
          <div className="mt-1 px-1 text-xs flex flex-row items-center space-x-0.5 text-neutral-600 dark:text-neutral-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-3"
            >
              <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
            </svg>
            <div className="font-normal">{formatPlayCount(playCount)}</div>
          </div>
          <h5 className="font-medium px-1 mb-1.5">
            <span className="text-sm line-clamp-1 text-balance">{name}</span>
          </h5>
          {creator && (
            <div className="mt-1.5 text-zinc-600 dark:text-zinc-400 line-clamp-1 rounded-full px-1 py-1 bg-zinc-200/40 dark:bg-zinc-800/40 flex flex-row space-x-2 items-center text-sm">
              <LazyLoadImage
                src={`${picUrl}?param=32y32`}
                className="rounded-full size-6 mr-2"
              />
              {creator}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
