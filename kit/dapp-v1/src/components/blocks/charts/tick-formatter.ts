export const defaultTickFormatter = (value: string) => {
  const commaSplit = value.split(",");
  if (commaSplit.length > 1) {
    return commaSplit[0];
  }
  return value;
};

export const defaultTickMargin = 8;
