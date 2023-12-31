import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";

export default function Container({ title, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="mt-8 mb-20 sm:mb-8">
        <main>{children}</main>
        <div className="w-40"><Toaster /></div>
      </div>
    </div>
  );
}
