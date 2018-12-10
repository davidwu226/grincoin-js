import elliptic from 'elliptic'
import BN from 'bn.js'
import sha256 from 'js-sha256'
import crypto from 'crypto'


//
// The NUMS computation of H.
//
const curve = elliptic.curves.secp256k1.curve
const G = curve.g

console.log(G.getX().toBuffer())

// H is defined as H.x = sha256(G)[0...15], where G is
// the uncompressed representation of G: 0x4 [x] [y]

const uncompressedG = Buffer.concat([Buffer.alloc(1, 0x4), G.getX().toBuffer(), G.getY().toBuffer()])
const rawH = sha256(uncompressedG).toString(16)

console.log(rawH.slice(0,32))
console.log(rawH.slice(32))

const H = curve.point(rawH.slice(0, 32), rawH.slice(32))

console.log(H.getX().toBuffer())
console.log(H.getY().toBuffer())

const rn = new BN(crypto.randomBytes(32))
console.log(rn)
class Commitment {
  constructor(value, blinding) {
    this.value = value
    this.blinding = blinding === undefined ? new BN(crypto.randomBytes(32)) : blinding
  }

  add(other) {
    return new Commitment(this.value + other.value, this.blinding.add(other.blinding))
  }

  sub(other) {
    return new Commitment(this.value - other.value, this.blinding.sub(other.blinding))
  }

  commit() {
    const g = G.mul(this.blinding)
    const h = H.mul(new BN(this.value))
    return { blinding, value, g, h, isZero: h.inf  }
  }
}

const v1 = new Commitment(100)
const v2 = new Commitment(30)
const v3 = new Commitment(130)
const sum = v1.add(v2).sub(v3)
const commit = sum.commit()
console.log(`${commit.G.getX().toBuffer().toString('hex')}
${Object.keys(commit.H)}
${commit.H.inf}
${commit.G.inf}
`)
