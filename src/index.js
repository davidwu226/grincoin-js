import elliptic from 'elliptic'
import BN from 'bn.js'
import sha256 from 'js-sha256'
import crypto from 'crypto'


//
// The NUMS computation of H.
//
const curve = elliptic.curves.secp256k1.curve
const G = curve.g

// H is defined as H.x = sha256(G)[0...15], where G is
// the uncompressed representation of G: 0x4 [x] [y]

const uncompressedG = Buffer.concat([Buffer.alloc(1, 0x4), G.getX().toBuffer(), G.getY().toBuffer()])
const rawH = sha256(uncompressedG).toString(16)

const H = curve.point(rawH.slice(0, 32), rawH.slice(32))

class Commitment {
  constructor(v, r) {
    this.v = v
    this.r = r === undefined ? new BN(crypto.randomBytes(32)) : r
    // elliptic doesn't seem to handle multiplying by a negative scalar, so
    // instead just negate the generator.
    this.rG = this.r.isNeg() ? G.neg().mul(this.r.abs()) : G.mul(this.r)
    this.vH = this.v < 0 ? H.neg().mul(Math.abs(this.v)) : H.mul(this.v)
    this.isZero = this.vH.inf
  }

  add(other) {
    return new Commitment(this.v + other.v, this.r.add(other.r))
  }

  sub(other) {
    return new Commitment(this.v - other.v, this.r.sub(other.r))
  }
}

const v1 = new Commitment(100)
const v2 = new Commitment(30)
const v3 = new Commitment(130)
const sum = v1.add(v2).sub(v3)
console.log(`${v1.r} ${v2.r} ${v3.r} ${sum.r} ${sum.rG.isInfinity()}`)
console.log(`${JSON.stringify(sum.rG)}`)
console.log(`
${sum.rG.getX().toBuffer().toString('hex')}
${sum.isZero}
`)
