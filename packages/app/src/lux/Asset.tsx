import { ChainId, CurrencyAmount, Token, Ether, Currency } from '@luxdefi/sdk'
import React, { useCallback, useEffect, useState } from 'react'
import { GetTriggerProps } from 'react-morphing-modal/dist/types'
import Player from 'react-player'
import { TYPE_ATM, TYPE_CASH, TYPE_VALIDATOR, TYPE_WALLET } from '../functions/assets'
import { useActiveWeb3React, useContract } from '../hooks'

export type AssetProps = {
  tokenId: number
  type: string
  image: string
  video: string
  className?: string
  height?: number
  width?: number
  showPrice?: boolean
  autoPlay?: boolean
  getTriggerProps?: GetTriggerProps
} & React.HTMLAttributes<HTMLDivElement>

const modalOffset = {
  [TYPE_VALIDATOR]: 170,
  [TYPE_ATM]: 40,
  [TYPE_WALLET]: 140,
  [TYPE_CASH]: 150,
}

// TODO: MOVE THIS SHIT
const currencyMap = (addr: string, chainId: ChainId): Currency => {
  switch (addr) {
    case `0x0000000000000000000000000000000000000000`:
      return Ether.onChain(chainId)
    default:
      return Ether.onChain(chainId)
  }
}

const Asset = (props: AssetProps) => {
  const { tokenId, showPrice } = props
  const { chainId } = useActiveWeb3React()
  const market = useContract('Market')
  const [currentAskPrice, setCurrentAskPrice] = useState(null)
  const [currency, setCurrency] = useState(null)
  const updateAssetDetails = useCallback(async () => {
    if (!tokenId || !showPrice) return
    const ask = await market.currentAskForToken(tokenId)
    setCurrentAskPrice(ask.amount)
    // TODO: Check on what currencies are accepted?
    // TODO: Accept tokens from @luxdefi/sdk
    const currency = currencyMap(ask.currency, chainId)
    setCurrency(currency)
  }, [tokenId, showPrice, market])

  useEffect(() => {
    updateAssetDetails()
  }, [tokenId, updateAssetDetails])

  return (
    <div
      className={`Asset ${props.className || ''} ${props.getTriggerProps ? 'cursor-pointer' : ''}`}
      {...(props.getTriggerProps ? props.getTriggerProps({ id: props.tokenId }) : {})}
    >
      {props.autoPlay ? (
        <Player url={props.video} playing={true} loop width={'auto'} height={'auto'} style={{ height: 'auto' }} />
      ) : (
        <img src={props.image} alt={`${props.type} ${props.tokenId}`} />
      )}
      <div
        className={`w-full pb-5 text-center backdrop-filter backdrop-opacity video-overlay`}
        style={{
          position: props.showPrice ? 'relative' : 'static',
          bottom: props.showPrice ? modalOffset[props.type] : 60,
        }}
      >
        <div>
          <span className="text-lg text-gray-300">{props.type}</span>
          <span className="px-2 py-1 ml-2 text-xs font-bold text-black bg-gray-300 rounded-full lux-font Asset__token-id">
            {props.tokenId}
          </span>
        </div>
        {props.showPrice && currency && currentAskPrice && (
          <div className="px-2 py-1 text-2xl text-indigo-500 rounded text-bold">
            Price {CurrencyAmount.fromRawAmount(currency, currentAskPrice).toSignificant(10)} {currency.symbol}
          </div>
        )}
      </div>
    </div>
  )
}

export default Asset
