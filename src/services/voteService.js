import { getItem, setItem, generateId, STORAGE_KEYS } from '../utils/storage.js';
import { validateVoteTitle } from '../utils/validators.js';
import { userService } from './userService.js';
import { restaurantService } from './restaurantService.js';
import { settlementService } from './settlementService.js';

function getVotes() {
  return getItem(STORAGE_KEYS.VOTES) || [];
}

function saveVotes(votes) {
  setItem(STORAGE_KEYS.VOTES, votes);
}

function getVoteRecords() {
  return getItem(STORAGE_KEYS.VOTE_RECORDS) || [];
}

function saveVoteRecords(records) {
  setItem(STORAGE_KEYS.VOTE_RECORDS, records);
}

function getArchives() {
  return getItem(STORAGE_KEYS.ARCHIVES) || [];
}

function saveArchives(archives) {
  setItem(STORAGE_KEYS.ARCHIVES, archives);
}

function getDrawResults() {
  return getItem(STORAGE_KEYS.DRAW_RESULTS) || {};
}

function saveDrawResults(results) {
  setItem(STORAGE_KEYS.DRAW_RESULTS, results);
}

function updateVoteStatuses(votes) {
  const now = new Date();
  return votes.map(vote => {
    if (vote.status === 'ended') return vote;

    const startTime = new Date(vote.startTime);
    const endTime = new Date(vote.endTime);

    let newStatus = vote.status;
    if (now < startTime) {
      newStatus = 'pending';
    } else if (now >= startTime && now <= endTime) {
      newStatus = 'active';
    } else {
      newStatus = 'ended';
    }

    if (newStatus !== vote.status) {
      return { ...vote, status: newStatus };
    }
    return vote;
  });
}

export const voteService = {
  getAllVotes(departmentId = null) {
    const votes = getVotes();
    let filteredVotes = updateVoteStatuses(votes);
    
    if (departmentId) {
      filteredVotes = filteredVotes.filter(v => v.departmentId === departmentId);
    }
    
    return filteredVotes;
  },

  getVoteById(id) {
    const votes = getVotes();
    const vote = votes.find(v => v.id === id);
    if (!vote) return null;
    
    const [updatedVote] = updateVoteStatuses([vote]);
    return updatedVote;
  },

  createVote(data) {
    const titleValidation = validateVoteTitle(data.title);
    if (!titleValidation.isValid) {
      throw new Error(titleValidation.message);
    }

    if (!data.restaurantIds || data.restaurantIds.length < 2) {
      throw new Error('至少需要选择2个餐厅');
    }

    if (!data.startTime || !data.endTime) {
      throw new Error('请设置投票时间');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const now = new Date();

    if (endTime <= startTime) {
      throw new Error('结束时间必须晚于开始时间');
    }

    let status = 'pending';
    if (now >= startTime && now <= endTime) {
      status = 'active';
    } else if (now > endTime) {
      status = 'ended';
    }

    const votes = getVotes();
    const newVote = {
      id: generateId(),
      title: data.title,
      description: data.description || '',
      organizerId: data.organizerId,
      organizerName: data.organizerName || '',
      departmentId: data.departmentId || null,
      restaurantIds: data.restaurantIds,
      startTime: data.startTime,
      endTime: data.endTime,
      status,
      hasSettlement: false,
      archived: false,
      createdAt: new Date().toISOString(),
    };

    votes.push(newVote);
    saveVotes(votes);
    return newVote;
  },

  updateVote(id, data) {
    const votes = getVotes();
    const index = votes.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error('投票不存在');
    }

    if (data.title) {
      const titleValidation = validateVoteTitle(data.title);
      if (!titleValidation.isValid) {
        throw new Error(titleValidation.message);
      }
    }

    votes[index] = {
      ...votes[index],
      ...data,
    };

    saveVotes(votes);
    return votes[index];
  },

  deleteVote(id) {
    const votes = getVotes();
    const index = votes.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error('投票不存在');
    }

    votes.splice(index, 1);
    saveVotes(votes);

    const records = getVoteRecords();
    const filteredRecords = records.filter(r => r.voteId !== id);
    saveVoteRecords(filteredRecords);
  },

  submitVote(voteId, data, oderId) {
    const votes = getVotes();
    const vote = votes.find(v => v.id === voteId);
    
    if (!vote) {
      throw new Error('投票不存在');
    }

    if (vote.status !== 'active') {
      throw new Error('投票未开始或已结束');
    }

    const { isParticipating, selectedRestaurantIds } = data;

    const records = getVoteRecords();
    const existingRecord = records.find(r => r.voteId === voteId && r.oderId === oderId);
    
    const voteData = {
      isParticipating: isParticipating !== undefined ? isParticipating : true,
      selectedRestaurantIds: isParticipating === false ? [] : (selectedRestaurantIds || []),
      votedAt: new Date().toISOString(),
    };

    if (existingRecord) {
      Object.assign(existingRecord, voteData);
    } else {
      records.push({
        id: generateId(),
        voteId,
        oderId,
        ...voteData,
      });
    }

    saveVoteRecords(records);
    return existingRecord || records[records.length - 1];
  },

  getVoteResults(voteId) {
    const votes = getVotes();
    const vote = votes.find(v => v.id === voteId);
    
    if (!vote) {
      throw new Error('投票不存在');
    }

    const records = getVoteRecords();
    const voteRecords = records.filter(r => r.voteId === voteId);

    const participatingRecords = voteRecords.filter(r => r.isParticipating);
    const notParticipatingRecords = voteRecords.filter(r => !r.isParticipating);

    const restaurantVotes = {};
    vote.restaurantIds.forEach(id => {
      restaurantVotes[id] = 0;
    });

    participatingRecords.forEach(record => {
      record.selectedRestaurantIds.forEach(restaurantId => {
        if (restaurantVotes[restaurantId] !== undefined) {
          restaurantVotes[restaurantId]++;
        }
      });
    });

    const totalVotes = Object.values(restaurantVotes).reduce((sum, count) => sum + count, 0);

    const restaurantResults = vote.restaurantIds.map(id => ({
      restaurantId: id,
      voteCount: restaurantVotes[id] || 0,
      percentage: totalVotes > 0 ? ((restaurantVotes[id] || 0) / totalVotes * 100).toFixed(1) : 0,
    }));

    return {
      restaurants: restaurantResults,
      participatingCount: participatingRecords.length,
      notParticipatingCount: notParticipatingRecords.length,
      totalVoters: voteRecords.length,
    };
  },

  hasUserVoted(voteId, oderId) {
    const records = getVoteRecords();
    return records.some(r => r.voteId === voteId && r.oderId === oderId);
  },

  getUserVoteRecord(voteId, oderId) {
    const records = getVoteRecords();
    return records.find(r => r.voteId === voteId && r.oderId === oderId) || null;
  },

  getUserVoteRecords(oderId) {
    const records = getVoteRecords();
    return records.filter(r => r.oderId === oderId);
  },

  getParticipantCount(voteId) {
    const records = getVoteRecords();
    const voteRecords = records.filter(r => r.voteId === voteId && r.isParticipating);
    return voteRecords.length;
  },

  getParticipants(voteId) {
    const records = getVoteRecords();
    const voteRecords = records.filter(r => r.voteId === voteId && r.isParticipating);
    
    return voteRecords.map(record => {
      const user = userService.getAllUsers().find(u => u.id === record.oderId);
      return {
        oderId: record.oderId,
        nickname: user?.nickname || '未知用户',
        votedAt: record.votedAt,
      };
    });
  },

  getNotParticipatingUsers(voteId) {
    const records = getVoteRecords();
    const voteRecords = records.filter(r => r.voteId === voteId && !r.isParticipating);
    
    return voteRecords.map(record => {
      const user = userService.getAllUsers().find(u => u.id === record.oderId);
      return {
        oderId: record.oderId,
        nickname: user?.nickname || '未知用户',
        votedAt: record.votedAt,
      };
    });
  },

  setVoteStatus(voteId, status) {
    return this.updateVote(voteId, { status });
  },

  setHasSettlement(voteId, hasSettlement) {
    return this.updateVote(voteId, { hasSettlement });
  },

  archiveVote(voteId) {
    const vote = this.getVoteById(voteId);
    if (!vote) {
      throw new Error('投票不存在');
    }

    const settlement = settlementService.getSettlement(voteId);
    const results = this.getVoteResults(voteId);
    const participants = this.getParticipants(voteId);
    const notParticipatingUsers = this.getNotParticipatingUsers(voteId);

    const restaurants = vote.restaurantIds.map(id => {
      const restaurant = restaurantService.getRestaurantById(id);
      const result = results.restaurants.find(r => r.restaurantId === id);
      return {
        id,
        name: restaurant?.name || '未知餐厅',
        cuisineType: restaurant?.cuisineType || '',
        avgPrice: restaurant?.avgPrice || 0,
        voteCount: result?.voteCount || 0,
        percentage: result?.percentage || 0,
      };
    });

    const winningRestaurant = restaurants.reduce((prev, current) => 
      (prev.voteCount > current.voteCount) ? prev : current
    );

    const archive = {
      id: generateId(),
      voteId,
      title: vote.title,
      description: vote.description,
      organizerName: vote.organizerName,
      departmentId: vote.departmentId,
      departmentName: userService.getDepartmentName(vote.departmentId),
      startTime: vote.startTime,
      endTime: vote.endTime,
      createdAt: vote.createdAt,
      archivedAt: new Date().toISOString(),
      
      restaurants,
      winningRestaurant,
      
      totalParticipants: participants.length,
      notParticipatingCount: notParticipatingUsers.length,
      participants: participants.map(p => p.nickname),
      notParticipatingUsers: notParticipatingUsers.map(u => u.nickname),
      
      settlement: settlement ? {
        totalAmount: settlement.totalAmount,
        reimbursementAmount: settlement.reimbursementAmount,
        perPersonAmount: settlement.perPersonAmount,
        participantCount: settlement.participantCount,
      } : null,
    };

    const archives = getArchives();
    archives.push(archive);
    saveArchives(archives);

    this.updateVote(voteId, { archived: true });

    return archive;
  },

  getAllArchives(departmentId = null) {
    const archives = getArchives();
    if (departmentId) {
      return archives.filter(a => a.departmentId === departmentId);
    }
    return archives;
  },

  getArchiveById(archiveId) {
    const archives = getArchives();
    return archives.find(a => a.id === archiveId) || null;
  },

  deleteArchive(archiveId) {
    const archives = getArchives();
    const index = archives.findIndex(a => a.id === archiveId);
    
    if (index === -1) {
      throw new Error('归档不存在');
    }

    archives.splice(index, 1);
    saveArchives(archives);
  },

  exportArchive(archiveId) {
    const archive = this.getArchiveById(archiveId);
    if (!archive) {
      throw new Error('归档不存在');
    }

    const exportData = {
      title: `聚餐投票归档 - ${archive.title}`,
      exportTime: new Date().toISOString(),
      data: archive,
    };

    return JSON.stringify(exportData, null, 2);
  },

  exportArchiveAsText(archiveId) {
    const archive = this.getArchiveById(archiveId);
    if (!archive) {
      throw new Error('归档不存在');
    }

    let text = `聚餐投票归档报告\n`;
    text += `${'='.repeat(40)}\n\n`;
    text += `投票标题：${archive.title}\n`;
    text += `组织者：${archive.organizerName}\n`;
    text += `部门：${archive.departmentName}\n`;
    text += `投票时间：${archive.startTime} 至 ${archive.endTime}\n`;
    text += `归档时间：${archive.archivedAt}\n\n`;

    text += `投票结果\n`;
    text += `${'-'.repeat(40)}\n`;
    text += `获胜餐厅：${archive.winningRestaurant.name} (${archive.winningRestaurant.voteCount}票)`;
    if (archive.winningRestaurant.isDrawn) {
      text += ` [通过抽签决定]`;
    }
    text += `\n\n`;

    text += `餐厅投票详情：\n`;
    archive.restaurants.forEach((r, i) => {
      text += `  ${i + 1}. ${r.name} - ${r.voteCount}票 (${r.percentage}%)\n`;
    });

    text += `\n参与情况\n`;
    text += `${'-'.repeat(40)}\n`;
    text += `参与人数：${archive.totalParticipants}人\n`;
    text += `不参与人数：${archive.notParticipatingCount}人\n\n`;

    if (archive.participants.length > 0) {
      text += `参与人员：${archive.participants.join('、')}\n`;
    }
    if (archive.notParticipatingUsers.length > 0) {
      text += `不参与人员：${archive.notParticipatingUsers.join('、')}\n`;
    }

    if (archive.settlement) {
      text += `\n结算信息\n`;
      text += `${'-'.repeat(40)}\n`;
      text += `总金额：¥${archive.settlement.totalAmount}\n`;
      text += `报销金额：¥${archive.settlement.reimbursementAmount}\n`;
      text += `每人应付：¥${archive.settlement.perPersonAmount}\n`;
    }

    return text;
  },

  drawRestaurant(voteId) {
    const results = this.getVoteResults(voteId);
    if (!results) {
      throw new Error('投票不存在');
    }

    const sortedRestaurants = [...results.restaurants].sort((a, b) => b.voteCount - a.voteCount);
    if (sortedRestaurants.length === 0) {
      throw new Error('没有可用的餐厅');
    }

    const maxVotes = sortedRestaurants[0].voteCount;
    const tiedRestaurants = sortedRestaurants.filter(r => r.voteCount === maxVotes);
    
    const randomIndex = Math.floor(Math.random() * tiedRestaurants.length);
    const selectedRestaurant = tiedRestaurants[randomIndex];
    
    const drawResult = {
      voteId,
      selectedRestaurantId: selectedRestaurant.restaurantId,
      tiedRestaurantIds: tiedRestaurants.map(r => r.restaurantId),
      drawTime: new Date().toISOString(),
    };

    const allDrawResults = getDrawResults();
    allDrawResults[voteId] = drawResult;
    saveDrawResults(allDrawResults);

    return drawResult;
  },

  getDrawResult(voteId) {
    const allDrawResults = getDrawResults();
    return allDrawResults[voteId] || null;
  },

  clearDrawResult(voteId) {
    const allDrawResults = getDrawResults();
    delete allDrawResults[voteId];
    saveDrawResults(allDrawResults);
  },

  getWinners(voteId) {
    const results = this.getVoteResults(voteId);
    if (!results) return [];

    const sortedRestaurants = [...results.restaurants].sort((a, b) => b.voteCount - a.voteCount);
    if (sortedRestaurants.length === 0) return [];

    const maxVotes = sortedRestaurants[0].voteCount;
    return sortedRestaurants.filter(r => r.voteCount === maxVotes);
  },

  isTie(voteId) {
    const winners = this.getWinners(voteId);
    return winners.length > 1;
  },

  archiveVote(voteId) {
    const vote = this.getVoteById(voteId);
    if (!vote) {
      throw new Error('投票不存在');
    }

    const settlement = settlementService.getSettlement(voteId);
    const results = this.getVoteResults(voteId);
    const participants = this.getParticipants(voteId);
    const notParticipatingUsers = this.getNotParticipatingUsers(voteId);
    const drawResult = this.getDrawResult(voteId);

    const restaurants = vote.restaurantIds.map(id => {
      const restaurant = restaurantService.getRestaurantById(id);
      const result = results.restaurants.find(r => r.restaurantId === id);
      return {
        id,
        name: restaurant?.name || '未知餐厅',
        cuisineType: restaurant?.cuisineType || '',
        avgPrice: restaurant?.avgPrice || 0,
        voteCount: result?.voteCount || 0,
        percentage: result?.percentage || 0,
      };
    });

    let winningRestaurant;
    if (drawResult) {
      const restaurant = restaurants.find(r => r.id === drawResult.selectedRestaurantId);
      winningRestaurant = { ...restaurant, isDrawn: true };
    } else {
      winningRestaurant = restaurants.reduce((prev, current) => 
        (prev.voteCount > current.voteCount) ? prev : current
      );
    }

    const archive = {
      id: generateId(),
      voteId,
      title: vote.title,
      description: vote.description,
      organizerName: vote.organizerName,
      departmentId: vote.departmentId,
      departmentName: userService.getDepartmentName(vote.departmentId),
      startTime: vote.startTime,
      endTime: vote.endTime,
      createdAt: vote.createdAt,
      archivedAt: new Date().toISOString(),
      
      restaurants,
      winningRestaurant,
      drawResult,
      
      totalParticipants: participants.length,
      notParticipatingCount: notParticipatingUsers.length,
      participants: participants.map(p => p.nickname),
      notParticipatingUsers: notParticipatingUsers.map(u => u.nickname),
      
      settlement: settlement ? {
        totalAmount: settlement.totalAmount,
        reimbursementAmount: settlement.reimbursementAmount,
        perPersonAmount: settlement.perPersonAmount,
        participantCount: settlement.participantCount,
      } : null,
    };

    const archives = getArchives();
    archives.push(archive);
    saveArchives(archives);

    this.updateVote(voteId, { archived: true });

    return archive;
  },
};

export default voteService;
