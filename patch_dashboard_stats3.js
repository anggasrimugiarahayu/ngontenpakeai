const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const additionalCards = `
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Free Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersFree)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">Pro Users</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalUsersPro)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-0.5">Monthly Subscribers</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.totalSubscribers)}</h3>
          </div>
        </div>
`;

let target = `        <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lifetime Orders</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeOrders)}</h3>
          </div>
        </div>`;

code = code.replace(target, target + "\n" + additionalCards);

fs.writeFileSync(file, code);
