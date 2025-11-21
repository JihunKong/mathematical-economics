import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import toast from 'react-hot-toast'에러가 발생했습니다'password'에러가 발생했습니다'회원가입이 완료되었습니다! 승인 후 로그인이 가능합니다.');
      navigate('/login');
    } catch (error) {
      toast.error('회원가입에 실패했습니다.'에러가 발생했습니다'email', {
                  required: '이메일을 입력해주세요'에러가 발생했습니다'올바른 이메일 형식이 아닙니다'에러가 발생했습니다'name', {
                  required: '이름을 입력해주세요',
                  minLength: {
                    value: 2,
                    message: '이름은 2자 이상이어야 합니다'에러가 발생했습니다'password', {
                  required: '비밀번호를 입력해주세요',
                  minLength: {
                    value: 6,
                    message: '비밀번호는 6자 이상이어야 합니다'에러가 발생했습니다'비밀번호는 숫자를 포함해야 합니다'에러가 발생했습니다'confirmPassword', {
                  required: '비밀번호를 다시 입력해주세요',
                  validate: (value) =>
                    value === password || '비밀번호가 일치하지 않습니다'에러가 발생했습니다'classCode', {
                  required: '클래스 코드를 입력해주세요',
                  minLength: {
                    value: 6,
                    message: '클래스 코드는 6자리입니다'에러가 발생했습니다'올바른 클래스 코드를 입력해주세요'에러가 발생했습니다'가입 중...' : '회원가입'에러가 발생했습니다' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                로그인
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}