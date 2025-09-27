const { runAutomation } = require('../lib/filmmakers');

/**
 * Vercel 서버리스 함수 - 필름메이커스 자동 갱신
 * Make.com에서 webhook으로 호출됩니다
 */
export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method Not Allowed. Use POST.'
        });
    }

    try {
        console.log('=== 필름메이커스 자동 갱신 시작 ===');
        console.log(`시작 시간: ${new Date().toLocaleString('ko-KR')}`);

        // 환경변수에서 로그인 정보 가져오기
        const username = process.env.FILMMAKERS_ID;
        const password = process.env.FILMMAKERS_PW;
        const authToken = process.env.API_SECRET_KEY;

        // 필수 환경변수 확인
        if (!username || !password) {
            console.error('❌ 환경변수 누락: FILMMAKERS_ID 또는 FILMMAKERS_PW');
            return res.status(500).json({
                success: false,
                message: '환경변수 설정이 필요합니다.'
            });
        }

        // 보안 토큰 확인 (선택사항)
        if (authToken) {
            const providedToken = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;
            if (providedToken !== authToken) {
                console.error('❌ 인증 토큰 불일치');
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.'
                });
            }
        }

        console.log('🚀 자동화 실행 중...');

        // 실제 자동화 실행
        const result = await runAutomation(username, password);

        console.log('=== 자동화 실행 결과 ===');
        console.log(`종료 시간: ${new Date().toLocaleString('ko-KR')}`);
        console.log(`결과: ${result.success ? '성공' : '실패'}`);
        console.log(`메시지: ${result.message}`);

        // 성공/실패에 따른 HTTP 상태 코드
        const statusCode = result.success ? 200 : 500;

        return res.status(statusCode).json({
            success: result.success,
            message: result.message,
            timestamp: new Date().toISOString(),
            executionTime: new Date().toLocaleString('ko-KR')
        });

    } catch (error) {
        console.error('=== 예외 발생 ===');
        console.error(`오류 시간: ${new Date().toLocaleString('ko-KR')}`);
        console.error(`오류 내용: ${error.message}`);
        console.error(`스택 트레이스: ${error.stack}`);

        return res.status(500).json({
            success: false,
            message: `서버 오류: ${error.message}`,
            timestamp: new Date().toISOString(),
            executionTime: new Date().toLocaleString('ko-KR')
        });
    }
}