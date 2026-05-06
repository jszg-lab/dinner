export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '¥0';
  return `¥${Number(amount).toFixed(2)}`;
}

export function formatPercentage(value, total) {
  if (!total || total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = date - now;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (diff < 0) {
    return '已结束';
  }

  if (minutes < 60) {
    return `${minutes}分钟后结束`;
  }
  if (hours < 24) {
    return `${hours}小时后结束`;
  }
  return `${days}天后结束`;
}

export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

export function getRoleName(role) {
  const roleMap = {
    admin: '管理员',
    organizer: '聚餐组织者',
    member: '普通成员',
  };
  return roleMap[role] || '未知角色';
}

export function getRoleColor(role) {
  const colorMap = {
    admin: 'bg-red-100 text-red-700',
    organizer: 'bg-blue-100 text-blue-700',
    member: 'bg-gray-100 text-gray-700',
  };
  return colorMap[role] || 'bg-gray-100 text-gray-700';
}
