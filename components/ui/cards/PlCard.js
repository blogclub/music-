import { LazyLoadImage } from "react-lazy-load-image-component";
import { useRouter } from "next/router";
import { useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "../button";

export default function PlCard({
  picUrl,
  id,
  name,
  index,
  signature,
  playCount,
}) {
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);

  function formatPlayCount(playCount) {
    if (playCount >= 10000){
      return (playCount / 10000).toFixed(1) + "万";
    }
    if (playCount >= 1000) {
      return (playCount / 1000).toFixed(1) + "千";
    } else {
      return playCount.toString();
    }
  }
  return (
    <div
      key={index}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="relative cursor-pointer w-full h-full"
      onClick={() => router.push(`/playlist?id=${id}`)}
    >
      <AspectRatio ratio={1} className="relative">
        <LazyLoadImage
          effect="blur"
          src={`${picUrl}?param=512y512`}
          className="hover:brightness-75 object-cover hover:scale-[1.01] min-w-64 md:min-w-72 sm:min-w-96 w-full h-auto transition-all  bg-neutral-200 dark:bg-neutral-800 rounded-xl"
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

      <div className="text-sm mt-4">
        <div className="flex flex-row text-xs text-neutral-600 dark:text-neutral-400">
          <div className="font-normal">{formatPlayCount(playCount)}次播放</div>
        </div>
        <h5 className="font-medium px-1">
          <span className="hover:underline">{name}</span>
        </h5>
      </div>
      <br />
    </div>
  );
}
