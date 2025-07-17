console.log("Hello from JavaScript!");
console.log("Testing Node.js execution.");

// Basic operations
const a = 5, b = 3;
console.log(`${a} + ${b} = ${a + b}`);
console.log(`${a} * ${b} = ${a * b}`);

// Array operations
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(`Sum of [${numbers.join(', ')}] = ${sum}`);

// Object operations
const testInfo = {
    extension: "Run!",
    language: "JavaScript",
    status: "Success"
};

console.log(`Testing ${testInfo.extension} with ${testInfo.language} - ${testInfo.status}!`);
