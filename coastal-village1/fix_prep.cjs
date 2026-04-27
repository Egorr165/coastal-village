const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const prepositions = ["в", "на", "с", "к", "и", "а", "но", "по", "за", "из", "от", "до", "у", "о", "или", "не", "для", "об", "со"];
const allPreps = [...prepositions, ...prepositions.map(p => p.charAt(0).toUpperCase() + p.slice(1))].join('|');

const regex = new RegExp(`(^|\\s|>|"|'|—|–|-)(${allPreps})\\s+(?=[a-zA-Zа-яА-Я0-9<«])`, 'g');

let changedCount = 0;

walkDir('c:\\Users\\kalmy\\OneDrive\\Рабочий стол\\ContinentSeven\\coastal-village1\\src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let originalContent = fs.readFileSync(filePath, 'utf8');
        let newContent = originalContent;
        
        // Run replace multiple times to handle consecutive prepositions like "и в "
        for (let i = 0; i < 3; i++) {
            newContent = newContent.replace(regex, '$1$2\u00A0');
        }

        // Also fix single-letter prepositions at the end of lines in JSX (sometimes they have \n)
        // newContent = newContent.replace(new RegExp(`(^|\\s|>|"|'|—|–|-|\\n)(${allPreps})\\n\\s*(?=[a-zA-Zа-яА-Я0-9<«])`, 'g'), '$1$2\u00A0');

        if (originalContent !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            changedCount++;
            console.log('Fixed', filePath);
        }
    }
});

console.log(`Finished. Changed ${changedCount} files.`);
