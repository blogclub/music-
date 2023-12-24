import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useState } from "react";
import { Button } from "../button";

export default function MvCard({ picUrl, name, id, index, ar }) {
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      key={index}
      onClick={() => router.push(`/mv?id=${id}`)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="relative cursor-pointer"
    >
      <LazyLoadImage
        effect="blur"
        src={`${picUrl}?param=640y360`}
        className="hover:brightness-75 min-w-64 md:min-w-72 sm:min-w-96 object-cover hover:scale-[1.01] transition-all bg-neutral-200 dark:bg-neutral-800 rounded-xl"
      />

      {isHover && (
        <Button
        onClick={() => router.push(`/mv?id=${id}`)}
          className="absolute inset-0 w-2/5 mx-auto my-auto transition-all duration-500 rounded-3xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z"
              clipRule="evenodd"
            />
          </svg>
          Watch Now
        </Button>
      )}

      <div className="text-sm">
        <h5 className="font-normal px-1 -mb-0.5">
          <span className="hover:underline font-medium">{name}</span>
        </h5>
        <div className="px-1 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="font-normal hover:underline">{ar}</div>
        </div>
      </div>
      <br />
    </div>
  );
}
