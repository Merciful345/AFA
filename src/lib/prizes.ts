export interface PrizeSettings {
  registration_fee: number;
  prize_mode: "dynamic" | "fixed";
  house_cut_percentage: number;
  first_place_share: number;
  fixed_first_prize: number;
  fixed_second_prize: number;
}

export function calculatePrizes(settings: PrizeSettings, paidCount: number) {
  if (settings.prize_mode === "fixed") {
    return { first: settings.fixed_first_prize, second: settings.fixed_second_prize };
  }

  const poolExact =
    (paidCount * settings.registration_fee * (100 - settings.house_cut_percentage)) / 100;
  const pool = Math.round(poolExact);
  const first = Math.round((pool * settings.first_place_share) / 100);
  const second = pool - first;

  return { first, second };
}

export function formatArs(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
