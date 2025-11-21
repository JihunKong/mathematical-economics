#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 코드 정리 함수
function cleanCode(content) {
  // AI 스타일 주석 제거
  content = content.replace(/\/\*\*[\s\S]*?\*\//g, ''); // JSDoc 주석 제거
  content = content.replace(/\/\/ .{50,}/g, ''); // 긴 설명형 주석 제거
  content = content.replace(/\/\*[\s\S]*?\*\//g, ''); // 블록 주석 제거
  
  // 콘솔 로그 제거
  content = content.replace(/console\.(log|info|warn|error|debug)\([^)]*\);?\n?/g, '');
  
  // 빈 줄 정리 (3줄 이상 연속된 빈 줄을 2줄로)
  content = content.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n');
  
  // 과도한 에러 메시지 간소화
  content = content.replace(/'[^']{100,}'/g, "'에러가 발생했습니다'");
  content = content.replace(/"[^"]{100,}"/g, '"에러가 발생했습니다"');
  
  // TODO, FIXME, NOTE 주석 제거
  content = content.replace(/\/\/ (TODO|FIXME|NOTE).*$/gm, '');
  
  return content.trim();
}

// 파일 복사 및 정리
function cleanAndCopyFile(srcPath, destPath) {
  try {
    const content = fs.readFileSync(srcPath, 'utf8');
    const cleanedContent = cleanCode(content);
    
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.writeFileSync(destPath, cleanedContent);
    console.log(`✓ Cleaned: ${path.relative(process.cwd(), srcPath)}`);
  } catch (error) {
    console.error(`✗ Error cleaning ${srcPath}:`, error.message);
  }
}

// 파일 목록 수집
function collectFiles(dir, extensions) {
  const files = [];
  
  function walk(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 제외할 디렉토리
        if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item)) {
          walk(fullPath);
        }
      } else {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  walk(dir);
  return files;
}

// 메인 실행
function main() {
  const projectRoot = '/Users/jihunkong/AWS/mathematical-economics';
  const outputRoot = path.join(projectRoot, 'copyright-submission');
  
  console.log('🧹 저작권 등록용 소스코드 정리 시작...\n');
  
  // Backend 파일들 정리
  console.log('📁 Backend 파일 정리 중...');
  const backendSrc = path.join(projectRoot, 'backend/src');
  const backendFiles = collectFiles(backendSrc, ['.ts', '.js']);
  
  for (const file of backendFiles) {
    const relativePath = path.relative(backendSrc, file);
    const destPath = path.join(outputRoot, 'backend-clean/src', relativePath);
    cleanAndCopyFile(file, destPath);
  }
  
  // Frontend 파일들 정리
  console.log('\n📁 Frontend 파일 정리 중...');
  const frontendSrc = path.join(projectRoot, 'frontend/src');
  const frontendFiles = collectFiles(frontendSrc, ['.ts', '.tsx', '.js', '.jsx']);
  
  for (const file of frontendFiles) {
    const relativePath = path.relative(frontendSrc, file);
    const destPath = path.join(outputRoot, 'frontend-clean/src', relativePath);
    cleanAndCopyFile(file, destPath);
  }
  
  // 중요 설정 파일들 복사
  console.log('\n📋 설정 파일 복사 중...');
  const configFiles = [
    { src: 'backend/package.json', dest: 'backend-clean/package.json' },
    { src: 'backend/prisma/schema.prisma', dest: 'backend-clean/prisma/schema.prisma' },
    { src: 'backend/tsconfig.json', dest: 'backend-clean/tsconfig.json' },
    { src: 'frontend/package.json', dest: 'frontend-clean/package.json' },
    { src: 'frontend/tsconfig.json', dest: 'frontend-clean/tsconfig.json' },
    { src: 'frontend/vite.config.ts', dest: 'frontend-clean/vite.config.ts' },
    { src: 'frontend/tailwind.config.js', dest: 'frontend-clean/tailwind.config.js' }
  ];
  
  for (const { src, dest } of configFiles) {
    const srcPath = path.join(projectRoot, src);
    const destPath = path.join(outputRoot, dest);
    
    if (fs.existsSync(srcPath)) {
      cleanAndCopyFile(srcPath, destPath);
    }
  }
  
  console.log('\n✅ 소스코드 정리 완료!');
  console.log(`📂 정리된 파일들: ${outputRoot}`);
}

main();