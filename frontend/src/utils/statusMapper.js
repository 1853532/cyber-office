export function getEmployeeState(cpu, memory) {
  if (cpu > 20) return { animation: 'animate-bounce', icon: '💦', bg: 'bg-red-500', color: 'text-red-500', label: '爆肝中', description: 'CPU占用极高，疯狂输出' };
  if (memory > 1000) return { animation: 'animate-pulse', icon: '📚', bg: 'bg-yellow-500', color: 'text-yellow-600', label: '文件堆积', description: '内存占用极大，工作量超载' };
  if (cpu < 1 && memory < 100) return { animation: '', icon: '☕', bg: 'bg-blue-400', color: 'text-blue-500', label: '摸鱼中', description: '处于低频休眠，正在喝咖啡' };
  return { animation: '', icon: '👨‍💻', bg: 'bg-green-500', color: 'text-green-600', label: '正常搬砖', description: '平稳运行中' };
}
