import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useState } from "react";
import { Button } from "../button";

export default function ArCard({ picUrl, name, id, index }) {
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      key={index}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => router.push(`/artist?id=${id}`)}
      className="relative cursor-pointer"
    >
      <div className="transition-all relative">
        <LazyLoadImage
          effect="blur"
          src={`${picUrl}?param=256y256`}
          className="bg-neutral-200 dark:bg-neutral-800 rounded-full size-full"
        />
        {isHover && (
          <Button
            onClick={() => router.push(`/artist?id=${id}`)}
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
      </div>

      <div className="text-center text-sm">
        <h5 className="font-medium hover:underline text-center">
          <span className="line-clamp-1 text-center">{name}</span>
        </h5>
      </div>
      <br />
    </div>
  );
}
