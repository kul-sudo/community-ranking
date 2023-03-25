import { create } from 'zustand'
import { persist } from 'zustand/middleware'

let useTabIndex = set => ({
  number: 0,
  changeTabIndex: index => set(() => ({
    number: index
  }))
})

useTabIndex = persist(useTabIndex, { name: 'communityRankingTab' })
useTabIndex = create(useTabIndex)

export default useTabIndex