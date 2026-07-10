const fs = require('fs');
const path = './src/pages/MenuManagement.tsx';
let content = fs.readFileSync(path, 'utf8');

// Section 1: Basic Information
content = content.replace(
  /<div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-4">/g,
  '<div className="space-y-4">'
);
content = content.replace(
  /<h4 className="text-sm font-bold text-neutral-800 font-display border-b border-neutral-100 pb-2 mb-3">\s*Basic Details\s*<\/h4>/g,
  '<h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Basic Details</h4>'
);

// Section 2: Timings
content = content.replace(
  /<div className="bg-neutral-50\/50 p-4 sm:p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-4">/g,
  '<div className="space-y-5 pt-4 border-t border-neutral-100">'
);
content = content.replace(
  /<h4 className="text-sm font-bold text-neutral-800 font-display border-b border-neutral-100 pb-2 mb-3">\s*Availability & Timings\s*<\/h4>/g,
  '<h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Availability & Timings</h4>'
);
content = content.replace(
  /<div className="bg-white p-4 rounded-xl border border-saffron-100 shadow-inner">/g,
  '<div className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">'
);
content = content.replace(
  /<div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">/g,
  '<div className="bg-neutral-50/50 p-4 rounded-xl border border-neutral-100">'
);

// Section 3: Attributes
content = content.replace(
  /<div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-6">/g,
  '<div className="space-y-6 pt-4 border-t border-neutral-100">'
);
content = content.replace(
  /<h4 className="text-sm font-bold text-neutral-800 font-display border-b border-neutral-100 pb-2 mb-3">\s*Item Attributes\s*<\/h4>/g,
  '<h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Item Attributes</h4>'
);

// Form background
content = content.replace(
  /<div className="space-y-6 max-h-\[75vh\] overflow-y-auto px-1 scrollbar-hide pb-4">/g,
  '<div className="space-y-8 max-h-[75vh] overflow-y-auto px-2 scrollbar-hide pb-4">'
);

fs.writeFileSync(path, content);
