import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admin } from '../../../lib/api';
import { Card } from '../../components/Card';
import { Loader, Calendar, TrendingUp, DollarSign, AlertCircle, Users } from 'lucide-react';

export function MonthlyBreakdownView() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data: breakdownResponse, isLoading } = useQuery({
    queryKey: ['admin-monthly-breakdown', year],
    queryFn: () => admin.getMonthlyBreakdown(year),
  });

  const breakdownData = breakdownResponse?.data;
  const breakdownList = breakdownData?.breakdown || [];

  // Calculate Yearly Totals
  const totalExpected = breakdownList.reduce((acc: number, item: any) => acc + Number(item.expected_total), 0);
  const totalCollected = breakdownList.reduce((acc: number, item: any) => acc + Number(item.total_collected), 0);
  const totalBalance = breakdownList.reduce((acc: number, item: any) => acc + Number(item.balance), 0);
  const overallProgress = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex bg-slate-50 min-h-screen items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Find the max value for scaling the chart
  const maxVal = Math.max(
    ...breakdownList.map((d: any) => Math.max(d.expected_total, d.total_collected)), 
    1
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Payment Breakdown</h1>
          <p className="text-gray-500 mt-1">Track expected vs collected payments for {year}</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                >
                    {[currentYear, currentYear + 1, currentYear + 2].map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            {/* Future: Download Report Button */}
            {/* <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" />
                Export
            </button> */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Total Expected</p>
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">₦{totalExpected.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">For entire year {year}</p>
            </div>
        </Card>
        
        <Card className="border-0 shadow-sm">
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Total Collected</p>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-emerald-600">₦{totalCollected.toLocaleString()}</p>
                <p className="text-xs text-emerald-700 mt-1">{overallProgress.toFixed(1)}% of expected</p>
            </div>
        </Card>

        <Card className="border-0 shadow-sm">
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Outstanding</p>
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-amber-600">₦{totalBalance.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Remaining to collect</p>
            </div>
        </Card>

        <Card className="border-0 shadow-sm">
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500">Overall Progress</p>
                    <p className="text-sm font-bold text-purple-600">{overallProgress.toFixed(1)}%</p>
                </div>
                <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden mt-3">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
                 <p className="text-xs text-gray-500 mt-2">Weighted average</p>
            </div>
        </Card>
      </div>

      {/* Visual Chart Section */}
      <Card className="border-0 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Trend</h3>
        
        <div className="overflow-x-auto pt-40 pb-4">
            <div className="min-w-[800px] h-[300px] flex justify-between gap-4 border-b border-gray-200">
                {breakdownList.map((item: any, idx: number) => {
                    const expectedHeight = (item.expected_total / maxVal) * 100;
                    const collectedHeight = (item.total_collected / maxVal) * 100;
                    
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative h-full">
                            {/* Hover Tooltip - Positioned based on index to prevent overflow */}
                            <div className={`absolute bottom-full mb-2 hidden group-hover:block z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap min-w-[150px]
                                ${idx === 0 ? 'left-0' : idx === breakdownList.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                            `}>
                                <p className="font-bold text-sm mb-1">{item.month}</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">Expected:</span>
                                        <span>₦{item.expected_total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">Collected:</span>
                                        <span className="text-emerald-400">₦{item.total_collected.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">Progress:</span>
                                        <span>{item.progress_percentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="pt-2 mt-1 border-t border-gray-700 flex justify-between gap-4">
                                        <span className="text-gray-400">Paid / Total:</span>
                                        <span>{item.expected_users_count - item.defaulted_users_count} / {item.expected_users_count}</span>
                                    </div>
                                    {item.defaulted_users_count > 0 && (
                                        <div className="flex justify-between gap-4 text-red-400">
                                            <span>Unpaid:</span>
                                            <span>{item.defaulted_users_count} Users</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full flex-1 flex justify-center items-end gap-1 relative min-h-0">
                                {/* Expected Bar (Background/Gray or Lighter) */}
                                <div className="relative w-3 sm:w-8 bg-gray-100 rounded-t-sm h-full flex items-end">
                                    <div 
                                        className="w-full bg-purple-100 rounded-t-sm transition-all duration-500"
                                        style={{ height: `${expectedHeight}%` }}
                                    />
                                    
                                    {/* Actual Collected Bar (Overlay for clearer progress, or Side-by-Side?) */}
                                    {/* Side-by-side relies on width. Let's do OVERLAY within the same column but narrower, or absolute positioned? */}
                                    {/* Let's try explicit side-by-side in this flex container. */}
                                </div>
                                
                                {/* Collected Bar */}
                                <div className="relative w-3 sm:w-8 h-full flex items-end">
                                     <div 
                                        className={`w-full rounded-t-sm transition-all duration-700 ${item.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                        style={{ height: `${collectedHeight}%` }}
                                    />
                                </div>
                            </div>
                            
                            <span className="text-xs text-gray-500 font-medium truncate w-full text-center h-4">{item.month.substring(0, 3)}</span>
                        </div>
                    );
                })}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-100 rounded-sm"></div>
                    <span className="text-gray-600">Expected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                    <span className="text-gray-600">Collected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                    <span className="text-gray-600">Completed (100%)</span>
                </div>
            </div>
        </div>
      </Card>

      {/* Detailed Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Detailed Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                    <tr>
                        <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">Month</th>
                        <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">Expected</th>
                        <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">Collected</th>
                        <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">Outstanding</th>
                         <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">Users (Paid/Total)</th>
                        <th className="text-left py-3 px-6 font-semibold text-gray-600 text-sm">Progress</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {breakdownList.map((item: any) => {
                         const paidUsers = item.expected_users_count - item.defaulted_users_count;
                         return (
                        <tr key={item.month_number} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">{item.month}</td>
                            <td className="py-4 px-6 text-sm text-gray-600">₦{item.expected_total.toLocaleString()}</td>
                            <td className="py-4 px-6 text-sm font-semibold text-emerald-600">₦{item.total_collected.toLocaleString()}</td>
                            <td className="py-4 px-6 text-sm text-amber-600">₦{item.balance.toLocaleString()}</td>
                             <td className="py-4 px-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span>{paidUsers} / {item.expected_users_count}</span>
                                    {item.defaulted_users_count > 0 && (
                                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                            {item.defaulted_users_count} unpaid
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${item.progress_percentage >= 100 ? 'bg-emerald-500' : 'bg-purple-500'}`}
                                            style={{ width: `${Math.min(item.progress_percentage, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{item.progress_percentage.toFixed(1)}%</span>
                                </div>
                            </td>
                        </tr>
                    );
                    })}
                    {breakdownList.length === 0 && (
                         <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">No data available for this year.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
}
