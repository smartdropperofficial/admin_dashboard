import dynamic from "next/dynamic";
import type { GetServerSidePropsContext, GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

const Dashboard = dynamic(() => import("../src/Dashboard"), { ssr: false });

export default function Home(props: { user: any; initialSession: any }) {
  return <Dashboard {...props} />;
}

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const supabase = createPagesServerClient(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      redirect: { destination: "/Login", permanent: false },
    };
  }

  return {
    props: {
      user: session.user,
      initialSession: session, // ➜ viene propagato a _app.tsx
    },
  };
};
