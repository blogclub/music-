import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useState } from "react";

export default function MvCard({ picUrl, name, id, index, ar }) {
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      key={index}
      onClick={() => router.push(`/mv?id=${id}`)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="snap-center relative cursor-pointer"
    >
      <div className="hover:brightness-75 hover:scale-[1.01] transition-all relative">
        <LazyLoadImage
          effect="blur"
          src={`${picUrl}?param=1400y900`}
          className="bg-neutral-200 dark:bg-neutral-800 rounded-xl"
        />
      </div>

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
