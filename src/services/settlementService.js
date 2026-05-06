import { getItem, setItem, generateId, STORAGE_KEYS } from '../utils/storage.js';
import { validateAmount } from '../utils/validators.js';
import { voteService } from './voteService.js';

function getSettlements() {
  return getItem(STORAGE_KEYS.SETTLEMENTS) || [];
}

function saveSettlements(settlements) {
  setItem(STORAGE_KEYS.SETTLEMENTS, settlements);
}

export const settlementService = {
  getSettlement(voteId) {
    const settlements = getSettlements();
    return settlements.find(s => s.voteId === voteId) || null;
  },

  saveSettlement(data) {
    if (!data.voteId) {
      throw new Error('投票ID不能为空');
    }

    const totalValidation = validateAmount(data.totalAmount);
    if (!totalValidation.isValid) {
      throw new Error(totalValidation.message);
    }

    const reimbursementValidation = validateAmount(data.reimbursementAmount);
    if (!reimbursementValidation.isValid) {
      throw new Error(reimbursementValidation.message);
    }

    const totalAmount = Number(data.totalAmount);
    const reimbursementAmount = Number(data.reimbursementAmount);
    
    if (reimbursementAmount > totalAmount) {
      throw new Error('报销金额不能超过总金额');
    }

    const participantCount = voteService.getParticipantCount(data.voteId);
    if (participantCount === 0) {
      throw new Error('投票尚未有人参与');
    }

    const actualAmount = totalAmount - reimbursementAmount;
    const perPersonAmount = Math.ceil(actualAmount / participantCount);

    const settlements = getSettlements();
    const existingIndex = settlements.findIndex(s => s.voteId === data.voteId);

    const settlement = {
      id: existingIndex >= 0 ? settlements[existingIndex].id : generateId(),
      voteId: data.voteId,
      totalAmount,
      reimbursementAmount,
      actualAmount,
      participantCount,
      perPersonAmount,
      paymentQRCode: data.paymentQRCode || '',
      createdAt: existingIndex >= 0 ? settlements[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      settlements[existingIndex] = settlement;
    } else {
      settlements.push(settlement);
    }

    saveSettlements(settlements);
    voteService.setHasSettlement(data.voteId, true);

    return settlement;
  },

  uploadPaymentQRCode(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('请选择图片文件'));
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('只支持 PNG、JPG 格式的图片'));
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        reject(new Error('图片大小不能超过 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('图片读取失败'));
      };
      reader.readAsDataURL(file);
    });
  },

  calculatePerPerson(totalAmount, reimbursementAmount, participantCount) {
    const total = Number(totalAmount) || 0;
    const reimbursement = Number(reimbursementAmount) || 0;
    const participants = Number(participantCount) || 1;
    
    const actualAmount = total - reimbursement;
    return Math.ceil(actualAmount / participants);
  },

  deleteSettlement(voteId) {
    const settlements = getSettlements();
    const index = settlements.findIndex(s => s.voteId === voteId);
    
    if (index === -1) {
      return;
    }

    settlements.splice(index, 1);
    saveSettlements(settlements);
    voteService.setHasSettlement(voteId, false);
  },
};

export default settlementService;
