import { expect, test, describe } from 'vitest'
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
  useConfiguratorStore
} from './configuratorStore'

describe('configuratorStore functions', () => {
  describe('calculateTotalPrice', () => {
    test('should calculate base price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: []
      }
      expect(calculateTotalPrice(config)).toBe(40000)
    })

    test('should add sport wheels price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: []
      }
      expect(calculateTotalPrice(config)).toBe(42000)
    })

    test('should add optionals price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor']
      }
      expect(calculateTotalPrice(config)).toBe(50500) // 40000 + 5500 + 5000
    })
  })

  describe('calculateInstallment', () => {
    test('should calculate 12x installments with 2% monthly interest', () => {
      const total = 40000
      expect(calculateInstallment(total)).toBe(3782.38)
    })
  })

  describe('formatPrice', () => {
    test('should format price to BRL correctly', () => {
      // Because formatting uses Intl, it might have non-breaking spaces or regular spaces
      // using a regex helps avoiding minor locale differences in whitespace
      const formatted = formatPrice(40000)
      expect(formatted).toMatch(/R\$\s?40\.000,00/)
    })
  })

  describe('useConfiguratorStore - toggleOptional', () => {
    test('should add optional if it does not exist', () => {
      const store = useConfiguratorStore.getState()
      store.resetConfiguration()
      
      expect(useConfiguratorStore.getState().configuration.optionals).toEqual([])
      
      store.toggleOptional('precision-park')
      
      expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')
    })

    test('should remove optional if it already exists', () => {
      const store = useConfiguratorStore.getState()
      store.resetConfiguration()
      store.toggleOptional('precision-park')
      
      expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')
      
      // Toggle again to remove
      store.toggleOptional('precision-park')
      
      expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park')
      expect(useConfiguratorStore.getState().configuration.optionals).toEqual([])
    })
  })
})
