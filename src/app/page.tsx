import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Rules from "@/components/site/Rules";
import Prizes from "@/components/site/Prizes";
import Registration from "@/components/site/Registration";
import Footer from "@/components/site/Footer";
import { getPaidCount } from "@/lib/supabase";

export const revalidate = 30;

export default async function Home() {
  const paidCount = await getPaidCount().catch(() => 0);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Rules />
        <Prizes paidCount={paidCount} />
        <Registration />
      </main>
      <Footer />
    </>
  );
}
