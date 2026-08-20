export const REGISTRATION_FEE_ARS = 50;

const FIRST_PRIZE_PER_REGISTRANT = 250;
const SECOND_PRIZE_PER_REGISTRANT = 100;

export function calculatePrizes(paidCount: number) {
  return {
    first: FIRST_PRIZE_PER_REGISTRANT * paidCount,
    second: SECOND_PRIZE_PER_REGISTRANT * paidCount,
  };
}

export function formatArs(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
