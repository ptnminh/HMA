export function isContainSpecialChar(str) {
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  return specialChars.test(str) ? true : false;
}
