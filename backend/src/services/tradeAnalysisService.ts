import { prisma } from '../config/database';
import { logger } from '../utils/logger';

// 경제 개념 키워드 정의
const ECONOMIC_CONCEPTS = {
  // 기본 분석 개념
  'PER': ['PER', 'per', '주가수익비율', 'P/E'],
  'PBR': ['PBR', 'pbr', '주가순자산비율', 'P/B'],
  'EPS': ['EPS', 'eps', '주당순이익'],
  'ROE': ['ROE', 'roe', '자기자본이익률'],
  'ROA': ['ROA', 'roa', '총자산이익률'],

  // 투자 전략
  '분산투자': ['분산투자', '분산', '포트폴리오 분산', '리스크 분산'],
  '가치투자': ['가치투자', '저평가', '내재가치', '밸류'],
  '성장투자': ['성장투자', '성장주', '성장성', '그로스'],
  '모멘텀': ['모멘텀', 'momentum', '추세', '트렌드'],
  '배당': ['배당', '배당금', '배당수익률', '배당률'],

  // 시장 분석
  '시장분석': ['시장분석', '시장상황', '경기', '경제상황'],
  '기술적분석': ['기술적분석', '차트', '지지선', '저항선', '이동평균'],
  '기본적분석': ['기본적분석', '재무제표', '실적', '매출', '영업이익'],

  // 리스크 관리
  '리스크관리': ['리스크', '위험', '손절', '손실제한', 'stop loss'],
  '변동성': ['변동성', '볼라틸리티', 'volatility', '변동폭'],

  // 산업/섹터 분석
  '산업분석': ['산업', '섹터', '업종', '산업동향'],

  // 뉴스/이벤트
  '뉴스기반': ['뉴스', '기사', '공시', '발표', '이벤트'],
  '실적발표': ['실적', '어닝', 'earnings', '분기실적'],

  // 기타 개념
  '시가총액': ['시가총액', '시총', 'market cap'],
  '거래량': ['거래량', '거래대금', '볼륨', 'volume'],
  '수급': ['수급', '외국인', '기관', '개인'],
};

// 뉴스 참조 키워드
const NEWS_KEYWORDS = [
  '뉴스', '기사', '발표', '공시', '보도', '언론', '미디어',
  'news', 'article', '속보', '단독', '전망', '분석리포트',
  '애널리스트', '증권사', '리서치', '보고서'
];

interface AnalysisResult {
  reasonLength: number;
  hasNewsRef: boolean;
  conceptsMentioned: string[];
  qualityScore: number;
}

export class TradeAnalysisService {

  /**
   * 거래 근거 텍스트를 분석하여 품질 점수와 메타데이터 생성
   */
  analyzeTradeReason(reason: string): AnalysisResult {
    const reasonLength = reason?.length || 0;

    // 뉴스 참조 여부 확인
    const hasNewsRef = this.checkNewsReference(reason);

    // 언급된 경제 개념 추출
    const conceptsMentioned = this.extractConcepts(reason);

    // 품질 점수 계산 (1-5점)
    const qualityScore = this.calculateQualityScore(
      reasonLength,
      hasNewsRef,
      conceptsMentioned.length
    );

    return {
      reasonLength,
      hasNewsRef,
      conceptsMentioned,
      qualityScore,
    };
  }

  /**
   * 뉴스 참조 여부 확인
   */
  private checkNewsReference(reason: string): boolean {
    if (!reason) return false;
    const lowerReason = reason.toLowerCase();
    return NEWS_KEYWORDS.some(keyword =>
      lowerReason.includes(keyword.toLowerCase())
    );
  }

  /**
   * 텍스트에서 경제 개념 키워드 추출
   */
  private extractConcepts(reason: string): string[] {
    if (!reason) return [];

    const foundConcepts: string[] = [];
    const lowerReason = reason.toLowerCase();

    for (const [concept, keywords] of Object.entries(ECONOMIC_CONCEPTS)) {
      const found = keywords.some(keyword =>
        lowerReason.includes(keyword.toLowerCase())
      );
      if (found) {
        foundConcepts.push(concept);
      }
    }

    return foundConcepts;
  }

  /**
   * 품질 점수 계산 (1-5점)
   * - 길이: 20자 미만 0점, 20-50자 1점, 50-100자 2점, 100자 이상 3점
   * - 뉴스 참조: 0.5점 추가
   * - 경제 개념: 개념당 0.3점 (최대 1.5점)
   */
  private calculateQualityScore(
    reasonLength: number,
    hasNewsRef: boolean,
    conceptCount: number
  ): number {
    let score = 0;

    // 길이 점수 (최대 3점)
    if (reasonLength >= 100) {
      score += 3;
    } else if (reasonLength >= 50) {
      score += 2;
    } else if (reasonLength >= 20) {
      score += 1;
    }

    // 뉴스 참조 점수 (0.5점)
    if (hasNewsRef) {
      score += 0.5;
    }

    // 경제 개념 점수 (개념당 0.3점, 최대 1.5점)
    score += Math.min(conceptCount * 0.3, 1.5);

    // 최종 점수는 1-5 범위로 제한
    return Math.max(1, Math.min(5, score));
  }

  /**
   * 거래 분석 데이터 저장
   */
  async saveTransactionAnalysis(
    transactionId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      const analysis = this.analyzeTradeReason(reason);

      await prisma.transactionAnalysis.create({
        data: {
          transactionId,
          userId,
          reasonLength: analysis.reasonLength,
          hasNewsRef: analysis.hasNewsRef,
          conceptsMentioned: analysis.conceptsMentioned,
          qualityScore: analysis.qualityScore,
        },
      });

      logger.info(`Transaction analysis saved for transaction: ${transactionId}`);
    } catch (error) {
      logger.error('Failed to save transaction analysis:', error);
      // 분석 저장 실패해도 거래는 계속 진행
    }
  }

  /**
   * 사용자의 거래 분석 통계 조회
   */
  async getUserAnalyticsStats(userId: string) {
    const analyses = await prisma.transactionAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (analyses.length === 0) {
      return {
        totalTrades: 0,
        avgQualityScore: 0,
        avgReasonLength: 0,
        newsRefRate: 0,
        topConcepts: [],
      };
    }

    const totalTrades = analyses.length;
    const avgQualityScore = analyses.reduce((sum, a) => sum + a.qualityScore, 0) / totalTrades;
    const avgReasonLength = analyses.reduce((sum, a) => sum + a.reasonLength, 0) / totalTrades;
    const newsRefCount = analyses.filter(a => a.hasNewsRef).length;
    const newsRefRate = (newsRefCount / totalTrades) * 100;

    // 가장 많이 언급된 개념 추출
    const conceptCounts: Record<string, number> = {};
    analyses.forEach(a => {
      a.conceptsMentioned.forEach(concept => {
        conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
      });
    });

    const topConcepts = Object.entries(conceptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([concept, count]) => ({ concept, count }));

    return {
      totalTrades,
      avgQualityScore: Math.round(avgQualityScore * 10) / 10,
      avgReasonLength: Math.round(avgReasonLength),
      newsRefRate: Math.round(newsRefRate),
      topConcepts,
    };
  }

  /**
   * 교사 피드백 추가
   */
  async addTeacherFeedback(
    transactionId: string,
    feedback: string
  ): Promise<void> {
    await prisma.transactionAnalysis.update({
      where: { transactionId },
      data: {
        teacherFeedback: feedback,
        feedbackDate: new Date(),
      },
    });

    logger.info(`Teacher feedback added for transaction: ${transactionId}`);
  }

  /**
   * 학급 전체 분석 통계
   */
  async getClassAnalyticsStats(classId: string) {
    const students = await prisma.user.findMany({
      where: { classId, role: 'STUDENT' },
      select: { id: true },
    });

    const studentIds = students.map(s => s.id);

    const analyses = await prisma.transactionAnalysis.findMany({
      where: { userId: { in: studentIds } },
    });

    if (analyses.length === 0) {
      return {
        totalTrades: 0,
        avgQualityScore: 0,
        qualityDistribution: { low: 0, medium: 0, high: 0 },
        topConcepts: [],
      };
    }

    const totalTrades = analyses.length;
    const avgQualityScore = analyses.reduce((sum, a) => sum + a.qualityScore, 0) / totalTrades;

    // 품질 분포 계산
    const qualityDistribution = {
      low: analyses.filter(a => a.qualityScore < 2).length,
      medium: analyses.filter(a => a.qualityScore >= 2 && a.qualityScore < 4).length,
      high: analyses.filter(a => a.qualityScore >= 4).length,
    };

    // 가장 많이 언급된 개념
    const conceptCounts: Record<string, number> = {};
    analyses.forEach(a => {
      a.conceptsMentioned.forEach(concept => {
        conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
      });
    });

    const topConcepts = Object.entries(conceptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concept, count]) => ({ concept, count }));

    return {
      totalTrades,
      avgQualityScore: Math.round(avgQualityScore * 10) / 10,
      qualityDistribution,
      topConcepts,
    };
  }

  /**
   * 모든 경제 개념 목록 반환 (프론트엔드용)
   */
  getEconomicConcepts() {
    return Object.keys(ECONOMIC_CONCEPTS).map(concept => ({
      id: concept,
      name: concept,
      keywords: ECONOMIC_CONCEPTS[concept as keyof typeof ECONOMIC_CONCEPTS],
    }));
  }
}

export const tradeAnalysisService = new TradeAnalysisService();
