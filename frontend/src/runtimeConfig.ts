interface PortfolioRuntimeConfig {
  apiBaseUrl: string;
  rudderstackWriteKey: string;
  rudderstackDataPlaneUrl: string;
}

declare global {
  interface Window {
    __PORTFOLIO_CONFIG__?: PortfolioRuntimeConfig;
  }
}

export function runtimeConfig(): PortfolioRuntimeConfig | undefined {
  return typeof window === "undefined" ? undefined : window.__PORTFOLIO_CONFIG__;
}
