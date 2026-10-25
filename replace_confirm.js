const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/mmbre/OneDrive/Aplicaciones HTML/Antigravity/Control de calidad';
const files = fs.readdirSync(dir);

let totalReplaced = 0;

for (const file of files) {
    if (file.endsWith('.js')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Regex to match `if (confirm("...")) { ... }` or similar.
        // It's tricky to match nested braces with a simple regex in JS.
        // Let's use a simple approach: since the blocks usually look like:
        // if(confirm("¿Eliminar...?")) {
        //     data.instances.splice(e.target.dataset.idx, 1);
        //     renderAll();
        // }
        // We can do a manual index search for the block.
        
        let modified = false;
        let searchIndex = 0;
        
        while (true) {
            let confirmIndex = content.indexOf('if(confirm(', searchIndex);
            if (confirmIndex === -1) {
                confirmIndex = content.indexOf('if (confirm(', searchIndex);
            }
            if (confirmIndex === -1) break;
            
            // Find the opening brace of the if statement
            let openBraceIndex = content.indexOf('{', confirmIndex);
            if (openBraceIndex === -1) break;
            
            // Find the matching closing brace
            let openCount = 1;
            let closeBraceIndex = openBraceIndex + 1;
            while (openCount > 0 && closeBraceIndex < content.length) {
                if (content[closeBraceIndex] === '{') openCount++;
                if (content[closeBraceIndex] === '}') openCount--;
                closeBraceIndex++;
            }
            
            if (openCount === 0) {
                // We found the block!
                // Extract the confirm message
                const conditionStr = content.substring(confirmIndex, openBraceIndex);
                const msgMatch = conditionStr.match(/confirm\((.*?)\)/);
                if (msgMatch) {
                    const msg = msgMatch[1].trim();
                    const blockContent = content.substring(openBraceIndex + 1, closeBraceIndex - 1);
                    
                    const replacement = `appConfirm(${msg}, () => {${blockContent}});`;
                    
                    content = content.substring(0, confirmIndex) + replacement + content.substring(closeBraceIndex);
                    modified = true;
                    searchIndex = confirmIndex + replacement.length; // Move search index past the replacement
                    totalReplaced++;
                } else {
                    searchIndex = openBraceIndex;
                }
            } else {
                searchIndex = openBraceIndex;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log('Modified', file);
        }
    }
}
console.log('Total replacements:', totalReplaced);
