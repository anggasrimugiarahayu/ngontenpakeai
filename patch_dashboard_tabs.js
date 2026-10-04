const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove the old pill tabs
const oldTabs = `{/* TABS HEADERS */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#121214] p-1 rounded-full w-fit mb-6 border border-gray-200 dark:border-white/5">
        <button
          onClick={() => setActiveTab('main')}
          className={\`px-6 py-2 rounded-full text-sm font-semibold transition-all \${activeTab === 'main' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}\`}
        >
          Main
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={\`px-6 py-2 rounded-full text-sm font-semibold transition-all \${activeTab === 'analytics' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}\`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={\`px-6 py-2 rounded-full text-sm font-semibold transition-all \${activeTab === 'orders' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}\`}
        >
          Orders
        </button>
      </div>`;

const newTabs = `{/* HEADLINE & TABS HEADERS */}
      <h1 className="text-2xl md:text-3xl font-bold font-heading mb-8 md:mb-10 text-gray-900 dark:text-white">
        Dashboard
      </h1>
      
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <button
          onClick={() => setActiveTab('main')}
          className={\`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border \${
            activeTab === 'main'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }\`}
        >
          Main
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={\`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border \${
            activeTab === 'statistics'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }\`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={\`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border \${
            activeTab === 'orders'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }\`}
        >
          Orders
        </button>
      </div>`;

code = code.replace(oldTabs, newTabs);
// replace activeTab === 'analytics' condition to 'statistics'
code = code.replace(/activeTab === 'analytics'/g, "activeTab === 'statistics'");
// replace "Analytics Section" to "Statistics Section"
code = code.replace(/Analytics Section/g, "Statistics Section");

fs.writeFileSync(file, code);
