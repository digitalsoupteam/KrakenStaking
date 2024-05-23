/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/staking.json`.
 */
export type Staking = {
  "address": "8jQ519dZStwEm7x6cspozH5Cm8Uxo8Ht1ePWDbaW4qHu",
  "metadata": {
    "name": "staking",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "confirmNewAdmin",
      "discriminator": [
        3,
        109,
        83,
        170,
        106,
        54,
        173,
        117
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createVault",
      "discriminator": [
        29,
        237,
        247,
        208,
        193,
        82,
        54,
        135
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultId"
              }
            ]
          }
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "vaultToken",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "createVaultArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "initializeArgs"
            }
          }
        }
      ]
    },
    {
      "name": "pauseVault",
      "discriminator": [
        250,
        6,
        228,
        57,
        6,
        104,
        19,
        210
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultId"
              }
            ]
          }
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "updateVaultArgs"
            }
          }
        }
      ]
    },
    {
      "name": "proposeNewAdmin",
      "discriminator": [
        232,
        189,
        155,
        60,
        4,
        68,
        17,
        188
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "stake",
      "discriminator": [
        206,
        176,
        202,
        18,
        200,
        209,
        179,
        108
      ],
      "accounts": [
        {
          "name": "staker",
          "writable": true,
          "signer": true
        },
        {
          "name": "userLock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              },
              {
                "kind": "arg",
                "path": "stakeId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultId"
              }
            ]
          }
        },
        {
          "name": "userConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "userToken",
          "writable": true
        },
        {
          "name": "mint",
          "relations": [
            "vault",
            "vaultToken"
          ]
        },
        {
          "name": "vaultToken",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "stakeArgs"
            }
          }
        }
      ]
    },
    {
      "name": "unpauseVault",
      "discriminator": [
        125,
        29,
        213,
        213,
        114,
        155,
        125,
        63
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultId"
              }
            ]
          }
        },
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  103,
                  114,
                  97,
                  109,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "updateVaultArgs"
            }
          }
        }
      ]
    },
    {
      "name": "unstake",
      "discriminator": [
        90,
        95,
        107,
        42,
        205,
        124,
        50,
        225
      ],
      "accounts": [
        {
          "name": "staker",
          "writable": true,
          "signer": true,
          "relations": [
            "userLock"
          ]
        },
        {
          "name": "userLock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  99,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              },
              {
                "kind": "arg",
                "path": "stakeId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "vaultId"
              }
            ]
          },
          "relations": [
            "userLock"
          ]
        },
        {
          "name": "userConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "staker"
              }
            ]
          }
        },
        {
          "name": "userToken",
          "writable": true
        },
        {
          "name": "mint",
          "relations": [
            "vault",
            "userToken",
            "vaultToken"
          ]
        },
        {
          "name": "vaultToken",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "unstakeArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "lockState",
      "discriminator": [
        140,
        53,
        195,
        57,
        171,
        177,
        11,
        86
      ]
    },
    {
      "name": "programState",
      "discriminator": [
        77,
        209,
        137,
        229,
        149,
        67,
        167,
        230
      ]
    },
    {
      "name": "userConfigState",
      "discriminator": [
        19,
        88,
        189,
        93,
        48,
        216,
        213,
        159
      ]
    },
    {
      "name": "vaultState",
      "discriminator": [
        228,
        196,
        82,
        165,
        98,
        210,
        235,
        152
      ]
    }
  ],
  "events": [
    {
      "name": "confirmedAdmin",
      "discriminator": [
        129,
        131,
        11,
        22,
        132,
        25,
        31,
        207
      ]
    },
    {
      "name": "createdVault",
      "discriminator": [
        39,
        21,
        194,
        32,
        95,
        15,
        86,
        202
      ]
    },
    {
      "name": "pausedVault",
      "discriminator": [
        186,
        20,
        162,
        102,
        112,
        80,
        191,
        157
      ]
    },
    {
      "name": "promotedAdmin",
      "discriminator": [
        163,
        200,
        186,
        221,
        26,
        148,
        250,
        102
      ]
    },
    {
      "name": "staked",
      "discriminator": [
        11,
        146,
        45,
        205,
        230,
        58,
        213,
        240
      ]
    },
    {
      "name": "unpausedVault",
      "discriminator": [
        80,
        172,
        95,
        244,
        87,
        212,
        142,
        191
      ]
    },
    {
      "name": "unstaked",
      "discriminator": [
        27,
        179,
        156,
        215,
        47,
        71,
        195,
        7
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notAdmin",
      "msg": "Not admin"
    },
    {
      "code": 6001,
      "name": "vaultIsPaused",
      "msg": "Vault is paused"
    },
    {
      "code": 6002,
      "name": "notEligible",
      "msg": "Not eligible to unstake"
    },
    {
      "code": 6003,
      "name": "notStaker",
      "msg": "Not staker"
    },
    {
      "code": 6004,
      "name": "invalidVaultId",
      "msg": "Invalid vault id"
    },
    {
      "code": 6005,
      "name": "invalidMagic",
      "msg": "Invalid magic"
    },
    {
      "code": 6006,
      "name": "periodsIsNotUnique",
      "msg": "Periods is not unique"
    },
    {
      "code": 6007,
      "name": "periodsContainsZero",
      "msg": "Periods contains zero"
    },
    {
      "code": 6008,
      "name": "periodsIsEmpty",
      "msg": "Periods is empty"
    },
    {
      "code": 6009,
      "name": "invalidVaultMint",
      "msg": "Invalid vault mint"
    },
    {
      "code": 6010,
      "name": "invalidOwner",
      "msg": "Invalid owner"
    },
    {
      "code": 6011,
      "name": "invalidLockId",
      "msg": "Invalid lock id"
    },
    {
      "code": 6012,
      "name": "alreadyUnstaked",
      "msg": "Already unstaked"
    }
  ],
  "types": [
    {
      "name": "confirmedAdmin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "prevAdmin",
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "createVaultArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultId",
            "type": "u32"
          },
          {
            "name": "periods",
            "type": {
              "vec": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "createdVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "periods",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "vault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "initializeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "lockState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "magic",
            "type": "u32"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "lockedFor",
            "type": "u32"
          },
          {
            "name": "lockedAt",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "pausedVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "programState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "lastVaultId",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "promotedAdmin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "newAdmin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "stakeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultId",
            "type": "u32"
          },
          {
            "name": "stakeId",
            "type": "u32"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "period",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "staked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "lock",
            "type": "pubkey"
          },
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "period",
            "type": "u32"
          },
          {
            "name": "vault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "unpausedVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "unstakeArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultId",
            "type": "u32"
          },
          {
            "name": "stakeId",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "unstaked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "lock",
            "type": "pubkey"
          },
          {
            "name": "staker",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "period",
            "type": "u32"
          },
          {
            "name": "vault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "updateVaultArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultId",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "userConfigState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "magic",
            "type": "u32"
          },
          {
            "name": "lastLockId",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "vaultState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "magic",
            "type": "u32"
          },
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "periods",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
