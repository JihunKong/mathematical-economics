import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UpdateCashModal from '@/components/teacher/UpdateCashModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { DollarSign } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters'에러가 발생했습니다'students' | 'stats'>('students'에러가 발생했습니다'클래스 정보를 불러오는데 실패했습니다.'에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW'에러가 발생했습니다'+' : ''에러가 발생했습니다'students')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'students'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'stats')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'students'에러가 발생했습니다'text-sm font-medium',
                      student.totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'에러가 발생했습니다'stats'에러가 발생했습니다'text-2xl font-bold',
              statistics.avgReturn >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatPercent(statistics.avgReturn)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">최고 수익률</h3>
            <p className="text-2xl font-bold text-green-600"에러가 발생했습니다"bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">최저 수익률</h3>
            <p className="text-2xl font-bold text-red-600"에러가 발생했습니다"bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">인기 종목</h3>
            <div className="space-y-1"에러가 발생했습니다"text-sm text-gray-900">
                  {stock.name} ({stock.tradeCount}회)
                </p>
              ))}
            </div>
          </div>
        </div>
      )}


      {}
      {selectedStudent && (
        <UpdateCashModal
          isOpen={showCashModal}
          onClose={() => {
            setShowCashModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onSuccess={fetchClassData}
        />
      )}
    </div>
  );
}