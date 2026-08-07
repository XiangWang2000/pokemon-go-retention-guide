function encodeDataFilePart(value: string) {
  return [...value]
    .map((character) => {
      if (/^[A-Za-z0-9]$/.test(character)) return character;
      return `-${character.codePointAt(0)!.toString(16)}-`;
    })
    .join("");
}

export function familyDataFileName(familyId: string) {
  return `${encodeDataFilePart(familyId)}.json`;
}

export function auditDataFileName(rowId: string) {
  return `${encodeDataFilePart(rowId)}.json`;
}
