const fs = require('fs');
const path = require('path');
const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
const matches = [];
for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    if (content.includes('instances.push')) {
        matches.push(file);
    }
}
console.log(matches.join('\n'));
