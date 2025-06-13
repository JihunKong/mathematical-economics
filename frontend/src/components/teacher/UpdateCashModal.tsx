import { useState } from 'react';
import { X } from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface UpdateCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    email: string;
    currentCash: number;
  };
  onSuccess: () => void;
}

export default function UpdateCashModal({ isOpen, onClose, student, onSuccess }: UpdateCashModalProps) {
  const [newCash, setNewCash] = useState(student.currentCash.toString());
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cashAmount = parseFloat(newCash);
    if (isNaN(cashAmount) || cashAmount < 0) {
      toast.error('유효한 금액을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      await api.updateStudentCash(student.id, cashAmount);
      toast.success('보유 현금이 업데이트되었습니다');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update cash:', error);
      toast.error('현금 업데이트에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">보유 현금 설정</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">학생 정보</p>
          <p className="font-semibold">{student.name} ({student.email})</p>
          <p className="text-sm text-gray-600 mt-1">
            현재 보유 현금: {formatCurrency(student.currentCash)}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              새로운 보유 현금
            </label>
            <input
              type="number"
              value={newCash}
              onChange={(e) => setNewCash(e.target.value)}
              className="input w-full"
              placeholder="0"
              min="0"
              step="1000"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              * 주의: 현재 보유 주식의 가치는 변경되지 않습니다
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? '처리 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}