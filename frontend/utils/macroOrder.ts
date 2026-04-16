import { MACRO_OPTIONS, MACRO_ORDER, MacroOption } from '@/constants'

export const getMacroOrder = (macro?: MacroOption) => {
  return macro ? MACRO_ORDER[macro] : MACRO_OPTIONS.length
}
