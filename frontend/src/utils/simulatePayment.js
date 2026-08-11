const APPROVAL_RATE = 0.7
const MIN_DELAY_MS = 1200
const MAX_DELAY_MS = 2000

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export async function simulatePayment() {
  const delay =
    MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1))
  await wait(delay)

  return {
    approved: Math.random() < APPROVAL_RATE,
  }
}
