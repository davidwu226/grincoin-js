import ecurve from 'ecurve'
import sha256 from 'js-sha256'
import BigInteger from 'bigi'
import crypto from 'crypto'

//
// The NUMS computation of H.
//
const curve = ecurve.getCurveByName('secp256k1')
const G = curve.G
 
// H is defined as H.x = sha256(G)[0...15], where G is
// the uncompressed representation of G: 0x4 [x] [y]

const uncompressedG = Buffer.concat([Buffer.alloc(1, 0x4), G.x.toBuffer(), G.y.toBuffer()])
const Hx = sha256(uncompressedG)

const H = curve.pointFromX(false, BigInteger.fromHex(Hx))
const uncompressedH = Buffer.concat([Buffer.alloc(1, 0x4), H.x.toBuffer(), H.y.toBuffer()])

class Commitment {
  constructor(value, blinding) {
    this.value = value
    this.blinding = blinding === undefined ? BigInteger.fromBuffer(crypto.randomBytes(32)) : blinding
  }

  add(other) {
    return new Commitment(this.value + other.value, this.blinding.add(other.blinding))
  }

  sub(other) {
    return new Commitment(this.value - other.value, this.blinding.subtract(other.blinding))
  }

  commit() {
    console.log(this.value)
    return { G: G.multiply(this.blinding), H: H.multiply(new BigInteger(`${this.value}`)) }
  }
}

const v1 = new Commitment(100)
const v2 = new Commitment(30)
const v3 = new Commitment(130)
const sum = v1.add(v2).sub(v3)
const commit = sum.commit()
console.log(`${commit.G.x.toHex()}
${commit.H.x}`)
