import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, BarChart2, List, Clock, AlertCircle } from 'lucide-react'
import useStore from '../store/useStore'
import { fetchMarketData, formatPrice } from '../services/api'

const ORDER_BOOK_BIDS = Array.from({ length: 10 }, (_, i) => ({
  price: 67400 - i * 12,
  amount: (Math.random() * 2 + 0.1).toFixed(4),
  total: (Math.random() * 120000 + 5000).toFixed(0),
}))

const ORDER_BOOK_ASKS = Array.from({ length: 10 }, (_, i) => ({
  price: 67420 + i * 14,
  amount: (Math.random() * 2 + 0.1).toFixed(4),
  total: (Math.random() * 120000 + 5000).toFixed(0),
}))

export default function TradePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isDemo = searchParams.get('demo') === 'true'
  const symbolParam = searchParams.get('symbol') || 'BTC'

  const { demoBalance, buyAsset, sellAsset, marketData, setMarketData, portfolio, demoTransactions } = useStore()

  const [selectedCoin, setSelectedCoin] = useState(null)
  const [orderType, setOrderType] = useState('market')
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('orderbook')

  useEffect(() => {
    const load = async () => {
      if (marketData.length === 0) {
        const data = await fetchMarketData()
        setMarketData(data)
      }
    }
    load()
  }, [marketData.length, setMarketData])

  useEffect(() => {
    if (marketData.length > 0) {
      const match = marketData.find(c => c.symbol.toUpperCase() === symbolParam)
      setSelectedCoin(match || marketData[0])
    }
  }, [marketData, symbolParam])

  const handleTrade = () => {
    if (!selectedCoin || !amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount' })
      return
    }
    const amtUSD = parseFloat(amount)
    const price = selectedCoin.current_price
    const symbol = selectedCoin.symbol.toUpperCase()

    let result
    if (side === 'buy') {
      result = buyAsset(symbol, amtUSD, price)
    } else {
      const coinAmt = amtUSD / price
      result = sellAsset(symbol, coinAmt, price)
    }
    setMessage({ type: result.success ? 'success' : 'error', text: result.msg })
    if (result.success) setAmount('')
    setTimeout(() => setMessage(null), 3000)
  }

  const currentPrice = selectedCoin?.current_price || 67450
  const priceChange = selectedCoin?.price_change_percentage_24h || 0
  const isUp = priceChange >= 0

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Demo banner */}
      {isDemo && (
        <div style={{
          background: 'rgba(212,175,55,0.1)',
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontSize: '13px',
          color: '#D4AF37',
        }}>
          <AlertCircle size={14} />
          Demo Mode — Virtual Balance: ${demoBalance.toFixed(2)} USDT | No real funds
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
        {/* Left: Markets list */}
        <div style={{ background: 'var(--bg-secondary)', borderRight: '1px solid rgba(212,175,55,0.08)', overflowY: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B6B78', letterSpacing: '1px', marginBottom: '10px' }}>MARKETS</div>
            <input
              placeholder="Search..."
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.1)',
                borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#F5F5F5',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>
          {marketData.map((coin) => (
            <div
              key={coin.id}
              onClick={() => setSelectedCoin(coin)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: selectedCoin?.id === coin.id ? 'rgba(212,175,55,0.06)' : 'transparent',
                borderLeft: selectedCoin?.id === coin.id ? '2px solid #D4AF37' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#F5F5F5' }}>{coin.symbol.toUpperCase()}/USDT</span>
                <span style={{ fontSize: '12px', color: coin.price_change_percentage_24h >= 0 ? '#00C896' : '#FF4D4F' }}>
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#A0A0A8', marginTop: '2px' }}>
                {formatPrice(coin.current_price)}
              </div>
            </div>
          ))}
        </div>

        {/* Center: Chart + order tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            padding: '12px 20px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid rgba(212,175,55,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#F5F5F5' }}>
                {selectedCoin?.symbol.toUpperCase()}/USDT
              </div>
              <div style={{ fontSize: '12px', color: '#6B6B78' }}>{selectedCoin?.name}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '22px', color: isUp ? '#00C896' : '#FF4D4F' }}>
                {formatPrice(currentPrice)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isUp ? '#00C896' : '#FF4D4F', fontSize: '14px', fontWeight: 600 }}>
              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {priceChange.toFixed(2)}% 24h
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              {['1H', '4H', '1D', '1W', '1M'].map((tf) => (
                <button key={tf} style={{
                  background: tf === '1D' ? 'rgba(212,175,55,0.15)' : 'transparent',
                  border: '1px solid ' + (tf === '1D' ? 'rgba(212,175,55,0.4)' : 'rgba(212,175,55,0.1)'),
                  color: tf === '1D' ? '#D4AF37' : '#A0A0A8',
                  borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                }}>
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* TradingView chart */}
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe
              key={selectedCoin?.symbol}
              src={`https://s.tradingview.com/widgetembed/?frameElementId=tv_trade&symbol=BINANCE%3A${selectedCoin?.symbol?.toUpperCase() || 'BTC'}USDT&interval=D&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=141419&studies=&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hideideasbutton=1&bgcolor=0B0B0F&gridcolor=1C1C24`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowTransparency="true"
              title={`${selectedCoin?.symbol?.toUpperCase()} Trading Chart`}
            />
          </div>

          {/* Bottom tabs: Orderbook / Trade history */}
          <div style={{ height: '240px', background: 'var(--bg-secondary)', borderTop: '1px solid rgba(212,175,55,0.08)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
              {['orderbook', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 20px',
                    background: 'none',
                    border: 'none',
                    color: activeTab === tab ? '#D4AF37' : '#6B6B78',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderBottom: activeTab === tab ? '2px solid #D4AF37' : '2px solid transparent',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    textTransform: 'capitalize',
                  }}
                >
                  {tab === 'orderbook' ? <BarChart2 size={13} /> : <Clock size={13} />}
                  {tab === 'orderbook' ? 'Order Book' : 'Trade History'}
                </button>
              ))}
            </div>

            {activeTab === 'orderbook' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100% - 36px)', overflow: 'hidden' }}>
                {/* Asks */}
                <div style={{ overflowY: 'auto', borderRight: '1px solid rgba(212,175,55,0.05)' }}>
                  <div style={{ padding: '6px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {['Price (USDT)', 'Amount', 'Total'].map(h => (
                      <div key={h} style={{ fontSize: '10px', color: '#6B6B78', letterSpacing: '0.5px' }}>{h}</div>
                    ))}
                  </div>
                  {ORDER_BOOK_ASKS.slice().reverse().map((row, i) => (
                    <div key={i} style={{ padding: '3px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', right: 0, top: 0, bottom: 0,
                        width: `${Math.random() * 70 + 10}%`,
                        background: 'rgba(255,77,79,0.04)',
                      }} />
                      <span style={{ fontSize: '11px', color: '#FF4D4F', fontWeight: 600, position: 'relative' }}>${row.price.toLocaleString()}</span>
                      <span style={{ fontSize: '11px', color: '#A0A0A8', position: 'relative' }}>{row.amount}</span>
                      <span style={{ fontSize: '11px', color: '#6B6B78', position: 'relative' }}>{parseInt(row.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {/* Bids */}
                <div style={{ overflowY: 'auto' }}>
                  <div style={{ padding: '6px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {['Price (USDT)', 'Amount', 'Total'].map(h => (
                      <div key={h} style={{ fontSize: '10px', color: '#6B6B78', letterSpacing: '0.5px' }}>{h}</div>
                    ))}
                  </div>
                  {ORDER_BOOK_BIDS.map((row, i) => (
                    <div key={i} style={{ padding: '3px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${Math.random() * 70 + 10}%`,
                        background: 'rgba(0,200,150,0.04)',
                      }} />
                      <span style={{ fontSize: '11px', color: '#00C896', fontWeight: 600, position: 'relative' }}>${row.price.toLocaleString()}</span>
                      <span style={{ fontSize: '11px', color: '#A0A0A8', position: 'relative' }}>{row.amount}</span>
                      <span style={{ fontSize: '11px', color: '#6B6B78', position: 'relative' }}>{parseInt(row.total).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ overflowY: 'auto', height: 'calc(100% - 36px)', padding: '0 12px' }}>
                {demoTransactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B6B78', fontSize: '13px' }}>No trades yet</div>
                ) : (
                  demoTransactions.map((tx) => (
                    <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '12px' }}>
                      <span style={{ color: tx.type === 'BUY' ? '#00C896' : '#FF4D4F', fontWeight: 600 }}>{tx.type}</span>
                      <span style={{ color: '#F5F5F5' }}>{tx.symbol}</span>
                      <span style={{ color: '#A0A0A8' }}>${tx.value.toFixed(2)}</span>
                      <span style={{ color: '#6B6B78' }}>{new Date(tx.time).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Buy/Sell panel */}
        <div style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid rgba(212,175,55,0.08)', overflowY: 'auto', padding: '20px' }}>
          {/* Side toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
            {['buy', 'sell'].map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: side === s ? (s === 'buy' ? '#00C896' : '#FF4D4F') : 'transparent',
                  color: side === s ? '#0B0B0F' : '#A0A0A8',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Order type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: '#6B6B78', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>ORDER TYPE</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)',
                borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#F5F5F5',
                outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <option value="market">Market Order</option>
              <option value="limit">Limit Order</option>
              <option value="stop">Stop-Limit Order</option>
            </select>
          </div>

          {/* Price display */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: '#6B6B78', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>MARKET PRICE</label>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: '8px', padding: '10px 12px',
              fontSize: '14px', fontWeight: 600, color: '#D4AF37',
            }}>
              {formatPrice(currentPrice)} USDT
            </div>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: '#6B6B78', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              AMOUNT (USDT)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#F5F5F5',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          {/* Quick % buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount((demoBalance * pct / 100).toFixed(2))}
                style={{
                  background: 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.15)',
                  borderRadius: '6px', padding: '6px', fontSize: '11px',
                  color: '#A0A0A8', cursor: 'pointer', fontWeight: 600,
                }}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Summary */}
          {amount && (
            <div style={{
              background: 'rgba(212,175,55,0.04)',
              border: '1px solid rgba(212,175,55,0.1)',
              borderRadius: '8px', padding: '12px', marginBottom: '16px',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#6B6B78' }}>You {side === 'buy' ? 'Get' : 'Sell'}</span>
                <span style={{ color: '#F5F5F5', fontWeight: 600 }}>
                  {(parseFloat(amount) / currentPrice).toFixed(6)} {selectedCoin?.symbol?.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B6B78' }}>Fee (~0.1%)</span>
                <span style={{ color: '#A0A0A8' }}>${(parseFloat(amount) * 0.001).toFixed(4)}</span>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: 600,
              background: message.type === 'success' ? 'rgba(0,200,150,0.1)' : 'rgba(255,77,79,0.1)',
              border: `1px solid ${message.type === 'success' ? 'rgba(0,200,150,0.3)' : 'rgba(255,77,79,0.3)'}`,
              color: message.type === 'success' ? '#00C896' : '#FF4D4F',
            }}>
              {message.text}
            </div>
          )}

          {/* Trade button */}
          <button
            onClick={handleTrade}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: side === 'buy' ? 'linear-gradient(135deg, #00C896, #00A87D)' : 'linear-gradient(135deg, #FF4D4F, #CC3D3F)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {side === 'buy' ? `Buy ${selectedCoin?.symbol?.toUpperCase() || ''}` : `Sell ${selectedCoin?.symbol?.toUpperCase() || ''}`}
          </button>

          {/* Balance display */}
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#6B6B78', marginBottom: '6px' }}>AVAILABLE BALANCE</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#D4AF37' }}>${demoBalance.toFixed(2)} USDT</div>
          </div>

          {/* Portfolio */}
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#6B6B78', marginBottom: '10px' }}>MY HOLDINGS</div>
            {Object.entries(portfolio).map(([symbol, amount]) => {
              if (symbol === 'USDT' || amount === 0) return null
              const coin = marketData.find(c => c.symbol.toUpperCase() === symbol)
              const value = coin ? amount * coin.current_price : 0
              return (
                <div key={symbol} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#F5F5F5' }}>{symbol}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#A0A0A8' }}>{amount.toFixed(6)}</div>
                    <div style={{ fontSize: '11px', color: '#6B6B78' }}>${value.toFixed(2)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          #trade-layout { grid-template-columns: 1fr 280px !important; }
          #trade-markets { display: none !important; }
        }
        @media (max-width: 768px) {
          #trade-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
