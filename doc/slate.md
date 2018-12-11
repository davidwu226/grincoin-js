# Anatomy of a Slate

## Overview

A slate is the object that is transferred between two participants of a transaction in order to create the transaction. In Grin, transactions need both sender and receiver(s) to participate to create the transaction that will ultimately be commited to the blockchain.

## Structure

Slates are currently described in `JSON` form:

```js
{

  // This is the number of participants involved
  // this transactions. Typically if it's just 
  // between a sender and a receiver, it will
  // be 2.
  num_participants: Integer,

  // This is just a unique ID for the transaction,
  // which the sender generates. The current Grin code
  // generates this as a UUIDv4 string.
  id: String,

  // Below is the structure for the core transaction,
  // which includes the inputs, outputs, kernels, and
  // offsets.
  tx: {
    
    // This is an array of Inputs.
    inputs: [
      {
        // Feature flag:
        //
        // 0 = Default
        // 1 = Coinbase
        features: OutputFeatures,

        // The Petersen Commitment for this Input. As 
        // an input, this essentially also functions as 
        // the ID for the input, as this Commitment is
        // used as the reference to a currently unspent
        // Output (UTXO).
        commit: Commitment,
      }
    ],

    // This is an array of Outputs.
    outputs: [
      {
        // Feature flag:
        //
        // 0 = Default
        // 1 = Coinbase
        features: OutputFeatures,

        // The Petersen Commitment for this Output. This
        // will ultimately also function as the ID for this
        // particular output.
        commit: Commitment,

        // The Bulletproof Range Proof for this Output. This
        // proves that the actual output amount for this
        // output is not negative (to prevent illegal
        // inflation).
        proof: RangeProof
      }
    ],

    // TODO: describe what these kernels are for, and why can
    // there an array of these?
    kernels: [
      {
        // Feature flag:
        //
        // 0 = Default
        // 1 = Coinbase
        features: KernelFeatures,

        // This is the amount to be paid to the miner for
        // processing this transaction. Currently chosen
        // by the sender.
        fee: Integer,

        // This locks the transaction such that it won't
        // become valid until the blockchain reaches this
        // lock_height. Useful for creating atomic swaps,
        // for example.
        lock_height: Integer,

        // This is the excess sum.
        // TODO: describe how this is computed.
        excess: Commitment,

        // This is a signature signed using the `excess`
        // field above as the public key. This proves that
        // the signer knows the scalar factor to the `excess`
        // sum commitment.
        // TODO: say more about format of signature.
        excess_sig: Signature,
      }
    ],

    // A 32-byte hex string that encodes the kernel offset.
    // TODO: say more about this... Is this k1+k2=k?
    // If so, explain how this helps anonymize the
    // transaction.
    offset: HexString32,
  },

  // This is the amount being sent in the transaction (not
  // including change or the fee to be paid to the miner).
  // The sender will set this.
  amount: Integer,

  // This is the amount to be paid to the miner for
  // processing this transaction. Currently chosen
  // by the sender.
  fee: Integer,

  // This is the current height of the blockchain when the
  // transaction is created.
  height: Integer,

  // This locks the transaction such that it won't
  // become valid until the blockchain reaches this
  // lock_height. Useful for creating atomic swaps,
  // for example.
  lock_height: Integer,

  // Each participant in the slate will provide an
  // entry in order to collaboratively create the transaction.
  participant_data: [
    {
      // Each slate participant's ID. Currently Grin sets the
      // sender as 0, while the receiver is set as 1.
      id: Integer,

      // TODO, what is this?
      public_blind_excess: "035db74b3cd34dfc1966c8382d3f6acc932e2331423d9976d3b952e310b9c044a3",

      // TODO, what is this?
      "public_nonce": "032e7c51c52470e094650bd096fe8488d9a67403233d6b3cf30f507fac11436af0",

      // TODO, what is this?
      "part_sig": "2e0880659ae5f484ff3d3ed50252fa5646dd7633915353b1bcc56d1a1e6c76c52e7c51c52470e094650bd096fe8488d9a67403233d6b3cf30f507fac11436af0"
    }
  ]
}
```

Slates include `Commitment` which are 33 byte hex strings that encode an EC Point. The encoding is essentially a variant of a compressed EC Point. The first byte is either `0x8` or `0x9` depending on whether the `y` value of the EC Point is even or odd. The rest of the 32 bytes encode the `x` value of the EC Point.