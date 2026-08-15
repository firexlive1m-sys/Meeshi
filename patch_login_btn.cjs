const fs = require('fs');

let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const loginBtn = `
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50 flex gap-4">
             <Link to="/download" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-md hover:scale-105">
                <Lock className="w-4 h-4 text-emerald-400" />
                Login / Access Tool
             </Link>
          </div>
`;

content = content.replace('<div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">', loginBtn);

fs.writeFileSync('src/pages/Landing.tsx', content);
