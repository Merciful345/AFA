export interface PrizeSettings {
  registration_fee: number;
  prize_mode: "dynamic" | "fixed";
  house_cut_percentage: number;
  first_place_share: number;
  fixed_first_prize: number;
  fixed_second_prize: number;
  second_place_enabled: boolean;
}

export function calculatePrizes(settings: PrizeSettings, paidCount: number) {
  if (settings.prize_mode === "fixed") {
    if (!settings.second_place_enabled) {
      return { first: settings.fixed_first_prize + settings.fixed_second_prize, second: 0 };
    }
    return { first: settings.fixed_first_prize, second: settings.fixed_second_prize };
  }

  const poolExact =
    (paidCount * settings.registration_fee * (100 - settings.house_cut_percentage)) / 100;
  const pool = Math.round(poolExact);

  if (!settings.second_place_enabled) {
    return { first: pool, second: 0 };
  }

  const first = Math.round((pool * settings.first_place_share) / 100);
  return { first, second: pool - first };
}

export function formatArs(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
