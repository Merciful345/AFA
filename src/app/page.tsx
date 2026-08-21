import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import About from "@/components/site/About";
import Rules from "@/components/site/Rules";
import LiveBracket from "@/components/site/LiveBracket";
import Prizes from "@/components/site/Prizes";
import Registration from "@/components/site/Registration";
import VoterCta from "@/components/site/VoterCta";
import Faq from "@/components/site/Faq";
import Footer from "@/components/site/Footer";
import { getPaidCount, getSettings } from "@/lib/supabase";
import { calculatePrizes, type PrizeSettings } from "@/lib/prizes";
import { getAllRounds } from "@/lib/bracket";
import { getActiveRewards, rewardImageUrl } from "@/lib/rewards";
import { getLeaderboard } from "@/lib/voters";

export const revalidate = 30;

const FALLBACK_SETTINGS: PrizeSettings = {
  registration_fee: 0,
  prize_mode: "dynamic",
  house_cut_percentage: 100,
  first_place_share: 0,
  fixed_first_prize: 0,
  fixed_second_prize: 0,
  second_place_enabled: true,
};

export default async function Home() {
  const [paidCount, settings, rounds, rewards, topVoters] = await Promise.all([
    getPaidCount().catch(() => 0),
    getSettings().catch(() => FALLBACK_SETTINGS),
    getAllRounds().catch(() => ({})),
    getActiveRewards().catch(() => []),
    getLeaderboard(3).catch(() => []),
  ]);

  const { first, second } = calculatePrizes(settings, paidCount);
  const roundNumbers = Object.keys(rounds).map(Number);
  const currentRound = roundNumbers.length > 0 ? Math.max(...roundNumbers) : null;

  return (
    <>
      <Nav />
      <main>
        <Hero fee={settings.registration_fee} paidCount={paidCount} currentRound={currentRound} firstPrize={first} />
        <About />
        <Rules fee={settings.registration_fee} />
        <LiveBracket rounds={rounds} />
        <Prizes
          paidCount={paidCount}
          first={first}
          second={second}
          secondPlaceEnabled={settings.second_place_enabled}
        />
        <Registration fee={settings.registration_fee} paidCount={paidCount} />
        <VoterCta
          rewards={rewards.map((r) => ({ ...r, imageUrl: rewardImageUrl(r.image_path) }))}
          topVoters={topVoters}
        />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
