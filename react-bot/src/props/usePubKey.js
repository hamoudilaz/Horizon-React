import { useContext } from 'react'
import PubKeyContext from './PubKeyContext'

export function usePubKey() {
    return useContext(PubKeyContext)
}
