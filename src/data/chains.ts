import { type Restaurant } from '../types'
// Chains generated from scripts/menus/chains/*.tsv by gen-chains.ts (official nutrition).
import { boosterJuice } from './booster-juice'
import { chickFilA } from './chick-fil-a'
import { dominos } from './dominos'
import { montanas } from './montanas'
import { mrSub } from './mr-sub'
import { pizzaPizza } from './pizza-pizza'
import { redLobster } from './red-lobster'

export const chainSpots: Restaurant[] = [boosterJuice, chickFilA, dominos, montanas, mrSub, pizzaPizza, redLobster]
