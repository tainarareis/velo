import { test } from '../support/fixtures'
import {
  BASE_PRICE,
  BOTH_OPTIONALS_PRICE,
  CONFIGURATOR_ASSETS,
  PRECISION_PARK_PRICE,
  SPORT_WHEELS_PRICE,
} from '../support/actions/configuratorActions'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar a imagem e manter o preço ao mudar a cor do veículo', async ({ app }) => {
    await app.configurator.expectPrice(BASE_PRICE)

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectPrice(BASE_PRICE)
    await app.configurator.expectCarImageSrc(CONFIGURATOR_ASSETS.midnightBlackAero)

    await app.configurator.selectColor('Lunar White')
    await app.configurator.expectPrice(BASE_PRICE)
    await app.configurator.expectCarImageSrc(CONFIGURATOR_ASSETS.lunarWhiteAero)
  })

  test('deve atualizar a imagem e o preço ao alterar as rodas para Sport e retornar ao valor inicial ao alterar para Aero', async ({ app }) => {
    await app.configurator.expectPrice(BASE_PRICE)

    await app.configurator.selectWheels('sport')
    await app.configurator.expectPrice(SPORT_WHEELS_PRICE)
    await app.configurator.expectCarImageSrc(CONFIGURATOR_ASSETS.glacierBlueSport)

    await app.configurator.selectWheels('aero')
    await app.configurator.expectPrice(BASE_PRICE)
    await app.configurator.expectCarImageSrc(CONFIGURATOR_ASSETS.glacierBlueAero)
  })

  test('deve atualizar o preço ao adicionar e remover opcionais e persistir a configuração no checkout', async ({ app }) => {
    await app.configurator.expectPrice(BASE_PRICE)

    await app.configurator.toggleOptional('precision-park')
    await app.configurator.expectPrice(PRECISION_PARK_PRICE)

    await app.configurator.toggleOptional('flux-capacitor')
    await app.configurator.expectPrice(BOTH_OPTIONALS_PRICE)

    await app.configurator.toggleOptional('precision-park')
    await app.configurator.toggleOptional('flux-capacitor')
    await app.configurator.expectPrice(BASE_PRICE)

    await app.configurator.finishConfigurator()
    await app.checkout.expectCheckoutPrice(BASE_PRICE)
    await app.checkout.expectCheckoutWithoutOptionals()
  })
})
