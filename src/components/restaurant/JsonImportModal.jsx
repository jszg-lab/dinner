import React, { useState } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle, X } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService.js';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

export default function JsonImportModal({ visible, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      setError('请选择 JSON 格式的文件');
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.restaurants && Array.isArray(data.restaurants)) {
          setPreview({
            total: data.restaurants.length,
            meta: data.meta || {},
            sample: data.restaurants.slice(0, 3),
          });
        } else {
          setError('JSON 格式不正确，缺少 restaurants 数组');
          setPreview(null);
        }
      } catch (err) {
        setError('JSON 解析失败：' + err.message);
        setPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = await restaurantService.importFromJson(event.target.result);
          setSuccess(`成功导入 ${result.success} 家餐厅！`);
          setTimeout(() => {
            setFile(null);
            setPreview(null);
            onSuccess();
          }, 1500);
        } catch (err) {
          setError('导入失败：' + err.message);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('导入失败：' + err.message);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal visible={visible} title="导入餐厅数据" onClose={handleClose} size="lg">
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            id="json-file-input"
          />
          <label htmlFor="json-file-input" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto text-text-secondary mb-4" />
            <p className="text-text-primary font-medium mb-2">
              点击选择 JSON 文件
            </p>
            <p className="text-text-secondary text-sm">
              支持批量导入餐厅数据
            </p>
          </label>
        </div>

        {file && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileJson className="w-5 h-5 text-secondary mr-2" />
                <span className="text-text-primary font-medium">{file.name}</span>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="text-text-secondary hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-secondary text-sm mt-2">
              文件大小：{(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {preview && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileJson className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-medium text-blue-700">
                预览数据（共 {preview.total} 家餐厅）
              </span>
            </div>
            {preview.meta && (
              <div className="mb-3 text-sm text-blue-600">
                <p>版本：{preview.meta.version}</p>
                <p>数据来源：{preview.meta.data_source || '未指定'}</p>
              </div>
            )}
            <div className="space-y-2">
              {preview.sample.map((r, index) => (
                <div key={index} className="bg-white rounded p-2 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-text-secondary ml-2">{r.cuisine_type || r.cuisineType}</span>
                </div>
              ))}
              {preview.total > 3 && (
                <p className="text-text-secondary text-sm">
                  ...还有 {preview.total - 3} 家餐厅
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start bg-red-50 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start bg-green-50 rounded-lg p-4">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-yellow-700 text-sm font-medium mb-2">JSON 文件格式示例：</p>
          <pre className="text-xs text-yellow-800 bg-yellow-100 rounded p-3 overflow-x-auto">
{`{
  "meta": { "version": "1.0" },
  "restaurants": [
    {
      "name": "餐厅名称",
      "cuisine_type": "菜系",
      "avg_price": 100,
      "rating": 4.5,
      "address": "地址"
    }
  ]
}`}
          </pre>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            loading={loading}
            variant="secondary"
          >
            确认导入
          </Button>
        </div>
      </div>
    </Modal>
  );
}
