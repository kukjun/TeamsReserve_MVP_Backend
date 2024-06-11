export const generateRandomPasswordFunction = (length: number = 10): string => {
    const specialChars = "!@#~$*";
    const numbers = "0123456789";
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";

    let password = "";

    // 최소한 한 개의 특수문자, 숫자, 대문자를 추가
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += upperChars[Math.floor(Math.random() * upperChars.length)];
    password += lowerChars[Math.floor(Math.random() * lowerChars.length)];

    while (password.length < length) {
        const chars = specialChars + numbers + upperChars; // 특수문자, 숫자, 대문자를 합침
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    // 생성된 비밀번호를 무작위로 섞음
    password = password.split("").sort(() => Math.random() - 0.5).join("");

    return password;
};
