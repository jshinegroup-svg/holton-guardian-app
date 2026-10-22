"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.childStorageKey = childStorageKey;
exports.validateChildProfile = validateChildProfile;
function childStorageKey(familyId, childId) {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(familyId) || !uuid.test(childId))
        throw Error('Invalid family or child identifier');
    return `holton-family-v2::${familyId}::${childId}`;
}
function validateChildProfile(nickname, ageYears) {
    const name = nickname.trim();
    if (!name || Array.from(name).length > 20)
        throw Error('暱稱請填寫 1～20 個字。');
    if (ageYears !== null && (!Number.isInteger(ageYears) || ageYears < 1 || ageYears > 18))
        throw Error('請選擇孩子的年齡。');
    return { nickname: name, ageYears };
}
