import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import Card from '../common/Card.jsx';

export default function PaymentQRCode({ qrCodeUrl, amount, organizerName }) {
  if (!qrCodeUrl) {
    return (
      <Card>
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">暂无收款码</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          扫码支付
        </h3>
        
        <div className="inline-block p-4 bg-white rounded-xl border-2 border-primary/20 mb-4">
          <img
            src={qrCodeUrl}
            alt="收款码"
            className="w-64 h-64 object-contain"
          />
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-primary mb-2">
            ¥{amount?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-text-secondary">
            支付金额给 {organizerName || '组织者'}
          </p>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            温馨提示：请在转账时备注您的姓名，以便组织者确认
          </p>
        </div>
      </div>
    </Card>
  );
}
