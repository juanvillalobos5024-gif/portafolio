const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/components/CatalogModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Page 2 and Page 3 completely
content = content.replace(/\{\/\*\s*===\s*PÁGINA EN BLANCO[\s\S]*?<\/Page>/, '');
content = content.replace(/\{\/\*\s*===\s*ÍNDICE[\s\S]*?<\/Page>\s*/, '');

// 2. Shift all hardcoded Page numbers down by 2
// Match <Page number={X}
content = content.replace(/<Page number=\{([0-9]+)\}/g, (match, p1) => {
    let num = parseInt(p1, 10);
    if (num >= 4) {
        num -= 2;
    }
    return `<Page number={${num}}`;
});

// 3. Update dynamic page calculations
content = content.replace(/const totalPages = 20 \+ \(extraKeys\.length \* 2\);/g, 'const totalPages = 18 + (extraKeys.length * 2);');
content = content.replace(/const leftPageNum = 18 \+ \(index \* 2\);/g, 'const leftPageNum = 16 + (index * 2);');
content = content.replace(/const rightPageNum = 19 \+ \(index \* 2\);/g, 'const rightPageNum = 17 + (index * 2);');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated CatalogModal.tsx successfully.");
