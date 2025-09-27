const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function login(page, username, password) {
    try {
        console.log('로그인 페이지 접속..');
        await page.goto('https://www.filmmakers.co.kr/member/login', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 페이지 로드 대기
        await page.waitForTimeout(3000);

        // 페이지 스크롤 (요소가 화면 밖에 있을 경우)
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });

        await page.waitForTimeout(1000);

        console.log('아이디/비밀번호 입력 중...');

        // 입력 필드 대기 후 입력
        await page.waitForSelector('input[name="user_id"]');
        await page.waitForSelector('input[name="password"]');

        // JavaScript로 직접 값 설정 (Python 코드와 동일한 방식)
        await page.evaluate((username, password) => {
            document.querySelector('input[name="user_id"]').value = username;
            document.querySelector('input[name="password"]').value = password;
        }, username, password);

        await page.waitForTimeout(1000);

        console.log('로그인 버튼 클릭 중...');

        // JavaScript로 직접 버튼 클릭 (Python 코드와 동일한 방식)
        try {
            await page.evaluate(() => {
                var button = document.querySelector('button[type="submit"]');
                if (button) button.click();
            });
        } catch (err) {
            // 폼 제출 방식 (폴백)
            await page.evaluate(() => {
                var forms = document.querySelectorAll('form');
                if (forms.length > 0) forms[0].submit();
            });
        }

        // 로그인 처리 대기
        await page.waitForTimeout(5000);

        // 로그인 성공 확인
        try {
            await page.waitForSelector('img.rounded-full', { timeout: 3000 });
            console.log('✅ 로그인 성공!');
            return true;
        } catch (err) {
            // 대안적 로그인 확인 방법
            const pageContent = await page.content();
            if (pageContent.includes('마이로그') || pageContent.includes('/index/member_info')) {
                console.log('✅ 로그인 성공!');
                return true;
            } else {
                console.log('⚠️ 로그인 확인 필요');
                return true; // 일단 진행
            }
        }

    } catch (error) {
        console.error(`❌ 로그인 실패: ${error.message}`);
        return false;
    }
}

/**
 * 게시글 갱신 함수
 * Python refresh_post() 함수를 Puppeteer로 변환
 */
async function refreshPost(page) {
    try {
        console.log('수정 페이지 접속...');

        // 수정 페이지 접속
        await page.goto('https://www.filmmakers.co.kr/locationBank/26555975/edit', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        await page.waitForTimeout(3000);

        console.log('등록 버튼 찾기 및 클릭...');

        try {
            // JavaScript로 등록 버튼 찾기 및 클릭 (Python 코드와 동일)
            await page.evaluate(() => {
                var buttons = document.querySelectorAll('button[type="submit"]');
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].innerText.includes('등록')) {
                        buttons[i].click();
                        break;
                    }
                }
            });
        } catch (err) {
            console.log('등록 버튼을 찾을 수 없습니다.');
        }

        console.log(`✅ [${new Date().toLocaleString('ko-KR')}] 갱신 완료!`);
        await page.waitForTimeout(2000);

        return { success: true, message: '갱신 완료' };

    } catch (error) {
        console.error(`❌ 갱신 오류: ${error.message}`);
        return { success: false, message: error.message };
    }
}

/**
 * 메인 자동화 실행 함수
 */
async function runAutomation(username, password) {
    let browser = null;

    try {
        console.log('브라우저 시작...');

        // 헤드리스 브라우저 시작 (Vercel 최적화)
        browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--run-all-compositor-stages-before-draw',
                '--memory-pressure-off'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath('/opt/vercel/.cache'),
            headless: 'new',
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();

        // User-Agent 설정
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // 로그인
        const loginSuccess = await login(page, username, password);
        if (!loginSuccess) {
            throw new Error('로그인 실패');
        }

        // 게시글 갱신
        const result = await refreshPost(page);

        return result;

    } catch (error) {
        console.error(`❌ 자동화 실패: ${error.message}`);
        return { success: false, message: error.message };
    } finally {
        if (browser) {
            await browser.close();
            console.log('브라우저 종료');
        }
    }
}

module.exports = {
    login,
    refreshPost,
    runAutomation
};