import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/router";
import { useEffect } from "react";

const RedirectPage = () => {
  const router = useRouter();
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      if (userData) {
        router.replace("/listen-now");
      } else {
        router.replace("/explore");
      }
    }, 0);

    // 清除定时器以避免内存泄漏
    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div>
      <Spinner />
    </div>
  );
};

export default RedirectPage;
