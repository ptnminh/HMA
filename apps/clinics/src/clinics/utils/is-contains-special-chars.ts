export function isContainSpecialChar(str) {
    var specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return specialChars.test(str)? true:false
}