import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function ArCard({ picUrl, name, id, index }) {
  const router = useRouter();
  return (
    <div
      key={index}
      onClick={() => router.push(`/artist?id=${id}`)}
      className="snap-center relative cursor-pointer"
    >
      <div className="hover:brightness-75 hover:scale-[1.01] transition-all">
        <LazyLoadImage
          effect="blur"
          src={`${picUrl}?param=192y192`}
          className="bg-neutral-200 dark:bg-neutral-800 rounded-full"
        />
      </div>

      <div className="text-center text-sm w-40 md:w-40 sm:w-48">
        <h5 className="font-medium hover:underline text-center rounded-md p-1">
          <span className="line-clamp-1 text-center">{name}</span>
        </h5>
      </div>
      <br />
    </div>
  );
}
