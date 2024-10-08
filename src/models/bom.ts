import { createSlice } from '@reduxjs/toolkit'

export const bomSlice = createSlice({
  name: 'bom',
  initialState: {
    value: {
      init: true
    }
  },
  reducers: {
    setActive: (state, action) => {
      state.value = action.payload
    },
    setBom: (state, action) => {
      state.value = action.payload
    }
  }
})
// 每个 case reducer 函数会生成对应的 Action creators
export const {setBom, setActive} = bomSlice.actions

export default bomSlice.reducer