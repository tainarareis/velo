import { test } from '../support/fixtures'
import {
  BASE_PRICE,
  CONFIGURATOR_ASSETS,
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
})
