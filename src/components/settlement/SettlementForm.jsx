import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DollarSign, Percent, Users, Upload, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { settlementService } from '../../services/settlementService.js';
import { voteService } from '../../services/voteService.js';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import Card from '../common/Card.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function SettlementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    totalAmount: '',
    reimbursementAmount: '',
    paymentQRCode: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewQRCode, setPreviewQRCode] = useState('');

  const vote = voteService.getVoteById(id);
  const participantCount = vote ? voteService.getParticipantCount(id) : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleQRCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await settlementService.uploadPaymentQRCode(file);
      setFormData(prev => ({ ...prev, paymentQRCode: base64 }));
      setPreviewQRCode(base64);
      setErrors(prev => ({ ...prev, paymentQRCode: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, paymentQRCode: error.message }));
    }
  };

  const perPersonAmount = settlementService.calculatePerPerson(
    formData.totalAmount || 0,
    formData.reimbursementAmount || 0,
    participantCount
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });

    if (!formData.totalAmount) {
      setErrors({ totalAmount: '请输入聚餐总金额' });
      return;
    }

    if (participantCount === 0) {
      setMessage({ type: 'error', text: '暂无参与者，无法进行结算' });
      return;
    }

    setLoading(true);

    try {
      settlementService.saveSettlement({
        voteId: id,
        totalAmount: formData.totalAmount,
        reimbursementAmount: formData.reimbursementAmount || 0,
        paymentQRCode: formData.paymentQRCode,
      });

      setMessage({ type: 'success', text: '结算信息已保存！' });
      
      setTimeout(() => {
        navigate(`/votes/${id}`);
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="聚餐结算管理" className="mb-6">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-2">投票信息</h4>
          <p className="text-sm text-blue-600">
            投票标题：{vote?.title || '未知'}<br />
            当前参与人数：{participantCount} 人
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                聚餐总金额
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">¥</span>
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {errors.totalAmount && (
                <p className="mt-1 text-sm text-red-500">{errors.totalAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Percent className="w-4 h-4 inline mr-1" />
                报销额度（可选）
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">¥</span>
                <input
                  type="number"
                  name="reimbursementAmount"
                  value={formData.reimbursementAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                公司或组织报销的部分
              </p>
            </div>
          </div>

          {participantCount > 0 && formData.totalAmount && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-text-secondary">
                  <Users className="w-5 h-5 inline mr-1" />
                  参与人数：{participantCount} 人
                </div>
                <div className="text-text-secondary">
                  应付金额：¥{((formData.totalAmount - (formData.reimbursementAmount || 0)) / participantCount).toFixed(2)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/20 text-center">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(perPersonAmount)}
                </span>
                <span className="text-text-secondary ml-2">每人</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              收款码
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleQRCodeUpload}
                className="hidden"
                id="qrcode-upload"
              />
              <label htmlFor="qrcode-upload" className="cursor-pointer">
                {previewQRCode ? (
                  <div className="relative inline-block">
                    <img
                      src={previewQRCode}
                      alt="收款码预览"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                    <p className="mt-2 text-sm text-text-secondary">点击更换收款码</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto text-text-secondary mb-3" />
                    <p className="text-text-primary font-medium">点击上传收款码</p>
                    <p className="text-sm text-text-secondary mt-1">
                      支持 PNG、JPG 格式，最大 5MB
                    </p>
                  </>
                )}
              </label>
            </div>
            {errors.paymentQRCode && (
              <p className="mt-1 text-sm text-red-500">{errors.paymentQRCode}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/votes/${id}`)}
            >
              返回
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!formData.totalAmount || participantCount === 0}
            >
              保存结算信息
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
