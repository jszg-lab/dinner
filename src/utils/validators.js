export function validateNickname(nickname) {
  if (!nickname) {
    return { isValid: false, message: '昵称不能为空' };
  }
  const trimmed = nickname.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: '昵称至少需要2个字符' };
  }
  if (trimmed.length > 20) {
    return { isValid: false, message: '昵称不能超过20个字符' };
  }
  return { isValid: true, message: '' };
}

export function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: '密码不能为空' };
  }
  if (password.length < 6) {
    return { isValid: false, message: '密码至少需要6个字符' };
  }
  if (password.length > 20) {
    return { isValid: false, message: '密码不能超过20个字符' };
  }
  return { isValid: true, message: '' };
}

export function validateDepartmentName(name) {
  if (!name) {
    return { isValid: false, message: '部门名称不能为空' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: '部门名称至少需要2个字符' };
  }
  if (trimmed.length > 20) {
    return { isValid: false, message: '部门名称不能超过20个字符' };
  }
  return { isValid: true, message: '' };
}

export function validateVoteTitle(title) {
  if (!title) {
    return { isValid: false, message: '投票标题不能为空' };
  }
  if (title.length < 2) {
    return { isValid: false, message: '投票标题至少需要2个字符' };
  }
  if (title.length > 50) {
    return { isValid: false, message: '投票标题不能超过50个字符' };
  }
  return { isValid: true, message: '' };
}

export function validateAmount(amount) {
  if (amount === '' || amount === null || amount === undefined) {
    return { isValid: false, message: '金额不能为空' };
  }
  const num = Number(amount);
  if (isNaN(num)) {
    return { isValid: false, message: '请输入有效的金额' };
  }
  if (num < 0) {
    return { isValid: false, message: '金额不能为负数' };
  }
  if (num > 100000) {
    return { isValid: false, message: '金额不能超过10万元' };
  }
  return { isValid: true, message: '' };
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, message: `${fieldName}不能为空` };
  }
  return { isValid: true, message: '' };
}
