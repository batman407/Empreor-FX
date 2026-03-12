import HeroSection from '../components/HeroSection'
import MarketOverview from '../components/MarketOverview'
import PlatformPower from '../components/PlatformPower'
import CopyTrading from '../components/CopyTrading'
import DemoTrading from '../components/DemoTrading'
import EarnStaking from '../components/EarnStaking'
import VIPTiers from '../components/VIPTiers'
import SecuritySection from '../components/SecuritySection'
import EconomicCalendar from '../components/EconomicCalendar'
import FinalCTA from '../components/FinalCTA'

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <MarketOverview />
      <PlatformPower />
      <CopyTrading />
      <DemoTrading />
      <EarnStaking />
      <VIPTiers />
      <SecuritySection />
      <EconomicCalendar />
      <FinalCTA />
    </main>
  )
}
