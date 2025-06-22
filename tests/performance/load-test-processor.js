// Artillery processor functions

const testAccounts = [
  { email: 'student1@test.com', password: 'Test123!' },
  { email: 'student2@test.com', password: 'Test123!' },
  { email: 'student3@test.com', password: 'Test123!' },
  { email: 'student4@test.com', password: 'Test123!' },
  { email: 'student5@test.com', password: 'Test123!' },
];

const stockSymbols = [
  '005930', // 삼성전자
  '000660', // SK하이닉스
  '035420', // NAVER
  '035720', // 카카오
  '051910', // LG화학
];

function setTestData(requestParams, context, ee, next) {
  const account = testAccounts[Math.floor(Math.random() * testAccounts.length)];
  context.vars.email = account.email;
  context.vars.password = account.password;
  
  return next();
}

function randomString() {
  return stockSymbols[Math.floor(Math.random() * stockSymbols.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  setTestData,
  $randomString: randomString,
  $randomNumber: randomNumber,
};