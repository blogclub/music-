import Head from "next/head";

export default function Container({ title, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
     
      <div className="mb-20 sm:mb-8">
        {children}
      </div>
    </div>
  );
}
