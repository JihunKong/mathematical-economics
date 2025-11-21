import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast'에러가 발생했습니다'',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''에러가 발생했습니다'/teacher/classes');
      setClasses(response.data.data);
    } catch (error) {
      toast.error('클래스 목록을 불러오는데 실패했습니다.'에러가 발생했습니다'/teacher/classes', data);
      toast.success('클래스가 생성되었습니다.');
      setShowCreateModal(false);
      setNewClassData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      fetchClasses();
    } catch (error) {
      toast.error('클래스 생성에 실패했습니다.'에러가 발생했습니다'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {classItem.isActive ? '진행중' : '종료'에러가 발생했습니다'ko-KR'에러가 발생했습니다'ko-KR')}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500"에러가 발생했습니다"text-center py-12">
          <p className="text-gray-500 mb-4"에러가 발생했습니다"btn btn-primary"에러가 발생했습니다"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">새 클래스 만들기</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  클래스 이름
                </label>
                <input
                  type="text"에러가 발생했습니다"input w-full"
                  placeholder="예: 경제수학 1반"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  type="date"에러가 발생했습니다"input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"에러가 발생했습니다"date"에러가 발생했습니다"input w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6"에러가 발생했습니다"btn btn-ghost"에러가 발생했습니다"btn btn-primary"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}