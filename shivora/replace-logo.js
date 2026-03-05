const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace header/footer logos
  content = content.split(`<div className="text-3xl md:text-4xl tracking-widest" style={{ fontFamily: 'ITC Giovanni Std Book', fontWeight: 900 }}>Shivora</div>`)
    .join(`<div className="relative w-32 h-10"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" priority /></div>`);

  content = content.split(`<div className="text-3xl tracking-widest mb-6" style={{ fontFamily: 'ITC Giovanni Std Book', fontWeight: 900 }}>Shivora</div>`)
    .join(`<div className="relative w-32 h-10 mb-6"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" /></div>`);

  content = content.split(`<div className="text-2xl tracking-widest" style={{ fontFamily: 'ITC Giovanni Std Book', fontWeight: 900 }}>Shivora</div>`)
    .join(`<div className="relative w-24 h-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain" priority /></div>`);

  content = content.split(`<span className="text-ash tracking-[0.4em] uppercase text-xs mb-8 font-light block">Shivora</span>`)
    .join(`<div className="relative w-20 h-6 mx-auto mb-8"><Image src="/shivlogo.png" alt="Shivora Logo" fill className="object-contain opacity-70" /></div>`);

  if (content !== originalContent) {
    if (!content.includes('import Image from')) {
      content = 'import Image from "next/image";\n' + content;
    }
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

function traverse(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  });
}

traverse(path.join(process.cwd(), 'src', 'app'));
console.log('Done!');
