const assert = require('assert/strict')
const {
  getParametrosTerreno,
  determinarClaseEstructura,
  getParametrosPorCategoria,
  getAlphaPorClase,
  calculateArea,
  calculateVolume,
  calculateWeight,
  calculateFrz,
  calculateFalpha,
  calculateVd,
  calculateCorrection,
  calculateQz,
  calculatePressure,
  calculateForce,
  calculateFactorG,
  calculateYCG,
  calculateNFT,
  calculateGradosInclinacionBrace,
} = require('../src/services/calculosService')

const approxEqual = (actual: number, expected: number, epsilon = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`)
}

describe('calculosService', () => {
  it('expone la tabla de parámetros de terreno', () => {
    const parametros = getParametrosTerreno()
    assert.equal(parametros.length, 4)
    assert.deepStrictEqual(parametros[0], { categoria: 1, alpha_A: 0.099, alpha_B: 0.101, alpha_C: 0.105, delta: 245, descripcion: 'Terreno plano o ligeramente ondulado' })
  })

  it('clasifica la estructura por altura', () => {
    assert.deepStrictEqual(determinarClaseEstructura(10), { clase: 'A', FC: 1, altura_min: 0, altura_max: 20 })
    assert.deepStrictEqual(determinarClaseEstructura(20), { clase: 'B', FC: 0.95, altura_min: 20, altura_max: 50 })
    assert.deepStrictEqual(determinarClaseEstructura(51), { clase: 'C', FC: 0.9, altura_min: 50, altura_max: Infinity })
  })

  it('recupera parámetros por categoría y alpha por clase', () => {
    const terreno = getParametrosPorCategoria(2)
    assert.ok(String(terreno.descripcion).includes('Terreno rugoso'))
    assert.equal(getAlphaPorClase(terreno, 'B'), 0.131)
  })

  it('calcula área, volumen y peso', () => {
    assert.equal(calculateArea(3, 4), 12)
    approxEqual(calculateVolume(12, 0.2), 2.4)
    approxEqual(calculateWeight(2.4), 5.76)
  })

  it('calcula factores de viento intermedios', () => {
    const frz = 1.56 * Math.pow(12 / 315, 0.128)
    approxEqual(calculateFrz(12, 0.128, 315), frz)
    approxEqual(calculateFalpha(0.95, frz, 1), 0.95 * frz)
    assert.equal(calculateVd(100, 1.08), 108)
    approxEqual(calculateCorrection(15, 760), 1)
    approxEqual(calculateQz(1.2, 100), 57.6)
    approxEqual(calculatePressure(10, -0.5, 0.8, 2), -26)
    assert.equal(calculateForce(2.5, 8), 20)
  })

  it('calcula factor G y YCG', () => {
    approxEqual(calculateFactorG(25, 750), (0.392 * 750) / (273 + 25))
    assert.equal(calculateYCG(9, 'rectangular'), 4.5)
    assert.equal(calculateYCG(9, 'triangular'), 3)
  })

  it('calcula NFT y ángulo de brace', () => {
    const nft = calculateNFT(0.1, 0.02, 0.14, 0.02)
    approxEqual(nft.nft_final, 0.24)
    assert.deepStrictEqual(nft.componentes, { nivel_natural: 0.1, excavacion: 0.02, espesor_losa: 0.14, acabado: 0.02 })
    assert.ok(nft.observaciones.length > 0)
    approxEqual(calculateGradosInclinacionBrace(10), 55, 0.5)
  })
})

export {}