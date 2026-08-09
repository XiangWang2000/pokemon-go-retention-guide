/**
 * Independent Gen 3 form/variant-boundary fixture.
 *
 * This is deliberately separate from batch source and database rows. It is the
 * expected identity for every formal Gen 3 form in the current scope, including
 * Castform's weather forms and Deoxys Formes.
 */
export type CanonicalGen3Form = {
  id: string;
  dexNumber: number;
  formKey: string;
  formNameEn: string;
  formNameZhTw: string;
  regionKey: string;
  types: readonly string[];
  variantKeys: readonly string[];
};

export const canonicalGen3Forms = [
  {
    "id": "252-hoenn",
    "dexNumber": 252,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "253-hoenn",
    "dexNumber": 253,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "254-hoenn",
    "dexNumber": 254,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "255-hoenn",
    "dexNumber": 255,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIRE"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "256-hoenn",
    "dexNumber": 256,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIRE",
      "FIGHTING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "257-hoenn",
    "dexNumber": 257,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIRE",
      "FIGHTING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "258-hoenn",
    "dexNumber": 258,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "259-hoenn",
    "dexNumber": 259,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "260-hoenn",
    "dexNumber": 260,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "261-hoenn",
    "dexNumber": 261,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "262-hoenn",
    "dexNumber": 262,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "263-hoenn",
    "dexNumber": 263,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "264-hoenn",
    "dexNumber": 264,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "265-hoenn",
    "dexNumber": 265,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "266-hoenn",
    "dexNumber": 266,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "267-hoenn",
    "dexNumber": 267,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "268-hoenn",
    "dexNumber": 268,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "269-hoenn",
    "dexNumber": 269,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG",
      "POISON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "270-hoenn",
    "dexNumber": 270,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "271-hoenn",
    "dexNumber": 271,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "272-hoenn",
    "dexNumber": 272,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "273-hoenn",
    "dexNumber": 273,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "274-hoenn",
    "dexNumber": 274,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS",
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "275-hoenn",
    "dexNumber": 275,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS",
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "276-hoenn",
    "dexNumber": 276,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "277-hoenn",
    "dexNumber": 277,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "278-hoenn",
    "dexNumber": 278,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "279-hoenn",
    "dexNumber": 279,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "280-hoenn",
    "dexNumber": 280,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC",
      "FAIRY"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "281-hoenn",
    "dexNumber": 281,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC",
      "FAIRY"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "282-hoenn",
    "dexNumber": 282,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC",
      "FAIRY"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "283-hoenn",
    "dexNumber": 283,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "284-hoenn",
    "dexNumber": 284,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "285-hoenn",
    "dexNumber": 285,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "286-hoenn",
    "dexNumber": 286,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS",
      "FIGHTING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "287-hoenn",
    "dexNumber": 287,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "288-hoenn",
    "dexNumber": 288,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "289-hoenn",
    "dexNumber": 289,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "290-hoenn",
    "dexNumber": 290,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG",
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "291-hoenn",
    "dexNumber": 291,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "292-hoenn",
    "dexNumber": 292,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG",
      "GHOST"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "293-hoenn",
    "dexNumber": 293,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "294-hoenn",
    "dexNumber": 294,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "295-hoenn",
    "dexNumber": 295,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "296-hoenn",
    "dexNumber": 296,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIGHTING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "297-hoenn",
    "dexNumber": 297,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIGHTING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "298-hoenn",
    "dexNumber": 298,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL",
      "FAIRY"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "299-hoenn",
    "dexNumber": 299,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "300-hoenn",
    "dexNumber": 300,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "301-hoenn",
    "dexNumber": 301,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "302-hoenn",
    "dexNumber": 302,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DARK",
      "GHOST"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "303-hoenn",
    "dexNumber": 303,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "FAIRY"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "304-hoenn",
    "dexNumber": 304,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "ROCK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "305-hoenn",
    "dexNumber": 305,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "ROCK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "306-hoenn",
    "dexNumber": 306,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "ROCK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "307-hoenn",
    "dexNumber": 307,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIGHTING",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "308-hoenn",
    "dexNumber": 308,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIGHTING",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "309-hoenn",
    "dexNumber": 309,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ELECTRIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "310-hoenn",
    "dexNumber": 310,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ELECTRIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "311-hoenn",
    "dexNumber": 311,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ELECTRIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "312-hoenn",
    "dexNumber": 312,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ELECTRIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "313-hoenn",
    "dexNumber": 313,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "314-hoenn",
    "dexNumber": 314,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "315-hoenn",
    "dexNumber": 315,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS",
      "POISON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "316-hoenn",
    "dexNumber": 316,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "POISON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "317-hoenn",
    "dexNumber": 317,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "POISON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "318-hoenn",
    "dexNumber": 318,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "319-hoenn",
    "dexNumber": 319,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "320-hoenn",
    "dexNumber": 320,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "321-hoenn",
    "dexNumber": 321,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "322-hoenn",
    "dexNumber": 322,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIRE",
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "323-hoenn",
    "dexNumber": 323,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIRE",
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "324-hoenn",
    "dexNumber": 324,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "FIRE"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "325-hoenn",
    "dexNumber": 325,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "326-hoenn",
    "dexNumber": 326,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "327-hoenn",
    "dexNumber": 327,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "328-hoenn",
    "dexNumber": 328,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "329-hoenn",
    "dexNumber": 329,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GROUND",
      "DRAGON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "330-hoenn",
    "dexNumber": 330,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GROUND",
      "DRAGON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "331-hoenn",
    "dexNumber": 331,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "332-hoenn",
    "dexNumber": 332,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS",
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "333-hoenn",
    "dexNumber": 333,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "334-hoenn",
    "dexNumber": 334,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DRAGON",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "335-hoenn",
    "dexNumber": 335,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "336-hoenn",
    "dexNumber": 336,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "POISON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "337-hoenn",
    "dexNumber": 337,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "338-hoenn",
    "dexNumber": 338,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "339-hoenn",
    "dexNumber": 339,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "340-hoenn",
    "dexNumber": 340,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "341-hoenn",
    "dexNumber": 341,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "342-hoenn",
    "dexNumber": 342,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "343-hoenn",
    "dexNumber": 343,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GROUND",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "344-hoenn",
    "dexNumber": 344,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GROUND",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "345-hoenn",
    "dexNumber": 345,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK",
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "346-hoenn",
    "dexNumber": 346,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK",
      "GRASS"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "347-hoenn",
    "dexNumber": 347,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK",
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "348-hoenn",
    "dexNumber": 348,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK",
      "BUG"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "349-hoenn",
    "dexNumber": 349,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "350-hoenn",
    "dexNumber": 350,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "351-normal",
    "dexNumber": 351,
    "formKey": "NORMAL",
    "formNameEn": "Normal Forme",
    "formNameZhTw": "一般型態",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "351-rainy",
    "dexNumber": 351,
    "formKey": "RAINY",
    "formNameEn": "Rainy Forme",
    "formNameZhTw": "雨水型態",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "351-snowy",
    "dexNumber": 351,
    "formKey": "SNOWY",
    "formNameEn": "Snowy Forme",
    "formNameZhTw": "雪雲型態",
    "regionKey": "HOENN",
    "types": [
      "ICE"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "351-sunny",
    "dexNumber": 351,
    "formKey": "SUNNY",
    "formNameEn": "Sunny Forme",
    "formNameZhTw": "晴天型態",
    "regionKey": "HOENN",
    "types": [
      "FIRE"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "352-hoenn",
    "dexNumber": 352,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "NORMAL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "353-hoenn",
    "dexNumber": 353,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GHOST"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "354-hoenn",
    "dexNumber": 354,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GHOST"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "355-hoenn",
    "dexNumber": 355,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GHOST"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "356-hoenn",
    "dexNumber": 356,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GHOST"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "357-hoenn",
    "dexNumber": 357,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GRASS",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "358-hoenn",
    "dexNumber": 358,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "359-hoenn",
    "dexNumber": 359,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DARK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "360-hoenn",
    "dexNumber": 360,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "361-hoenn",
    "dexNumber": 361,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ICE"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "362-hoenn",
    "dexNumber": 362,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ICE"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "363-hoenn",
    "dexNumber": 363,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ICE",
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "364-hoenn",
    "dexNumber": 364,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ICE",
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "365-hoenn",
    "dexNumber": 365,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ICE",
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "366-hoenn",
    "dexNumber": 366,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "367-hoenn",
    "dexNumber": 367,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "368-hoenn",
    "dexNumber": 368,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "369-hoenn",
    "dexNumber": 369,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER",
      "ROCK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "370-hoenn",
    "dexNumber": 370,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "371-hoenn",
    "dexNumber": 371,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DRAGON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "372-hoenn",
    "dexNumber": 372,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DRAGON"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "373-hoenn",
    "dexNumber": 373,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DRAGON",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "374-hoenn",
    "dexNumber": 374,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "375-hoenn",
    "dexNumber": 375,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "376-hoenn",
    "dexNumber": 376,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "377-hoenn",
    "dexNumber": 377,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ROCK"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "378-hoenn",
    "dexNumber": 378,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "ICE"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "379-hoenn",
    "dexNumber": 379,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "380-hoenn",
    "dexNumber": 380,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DRAGON",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "381-hoenn",
    "dexNumber": 381,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DRAGON",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "382-hoenn",
    "dexNumber": 382,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "WATER"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "383-hoenn",
    "dexNumber": 383,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "GROUND"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "384-hoenn",
    "dexNumber": 384,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "DRAGON",
      "FLYING"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX",
      "MEGA"
    ]
  },
  {
    "id": "385-hoenn",
    "dexNumber": 385,
    "formKey": "HOENN",
    "formNameEn": "Hoenn",
    "formNameZhTw": "豐緣",
    "regionKey": "HOENN",
    "types": [
      "STEEL",
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "386-attack",
    "dexNumber": 386,
    "formKey": "ATTACK",
    "formNameEn": "Attack Forme",
    "formNameZhTw": "攻擊形態",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "386-defense",
    "dexNumber": 386,
    "formKey": "DEFENSE",
    "formNameEn": "Defense Forme",
    "formNameZhTw": "防禦形態",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "386-normal",
    "dexNumber": 386,
    "formKey": "NORMAL",
    "formNameEn": "Normal Forme",
    "formNameZhTw": "一般形態",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  },
  {
    "id": "386-speed",
    "dexNumber": 386,
    "formKey": "SPEED",
    "formNameEn": "Speed Forme",
    "formNameZhTw": "速度形態",
    "regionKey": "HOENN",
    "types": [
      "PSYCHIC"
    ],
    "variantKeys": [
      "NORMAL",
      "SHADOW",
      "PURIFIED",
      "DYNAMAX"
    ]
  }
] as const satisfies readonly CanonicalGen3Form[];

export const canonicalGen3FormsById = new Map(
  canonicalGen3Forms.map((form) => [form.id, form] as const),
);
