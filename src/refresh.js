#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * 필름메이커스 자동화 스크립트
 * 기존 Python 코드를 JavaScript로 완전 이식
 */

// 환경변수에서 로그인 정보 가져오기
const FILMMAKERS_ID = process.env.FILMMAKERS_ID;
const FILMMAKERS_PW = process.env.FILMMAKERS_PW;
const DEBUG = process.env.DEBUG === 'true';

/**
 * 로그 출력 함수
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toLocaleString('ko-KR');
    const emoji = {
        'INFO': '📝',
        'SUCCESS': '✅',
        'ERROR': '❌',
        'DEBUG': '🔍'
    };
    console.log(`${emoji[level]} [${timestamp}] ${message}`);
}

/**
 * 스크린샷 저장 (에러 발생 시)
 */
async function saveErrorScreenshot(page, error) {
    try {
        const filename = `error-${Date.now()}.png`;
        await page.screenshot({ path: filename, fullPage: true });
        log(`에러 스크린샷 저장됨: ${filename}`, 'DEBUG');
    } catch (err) {
        log(`스크린샷 저장 실패: ${err.message}`, 'ERROR');
    }
}

/**
 * 필름메이커스 로그인 함수
 */
async function login(page, username, password) {
    try {
        log('로그인 페이지 접속 중...');

        await page.goto('https://www.filmmakers.co.kr/member/login', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // 페이지 로드 대기
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 페이지 스크롤 (요소가 화면 밖에 있을 경우)
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        log('아이디/비밀번호 입력 중...');

        // 입력 필드 대기 후 입력
        await page.waitForSelector('input[name="user_id"]', { timeout: 10000 });
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });

        // JavaScript로 직접 값 설정 (Python 코드와 동일한 방식)
        await page.evaluate((username, password) => {
            const idInput = document.querySelector('input[name="user_id"]');
            const pwInput = document.querySelector('input[name="password"]');
            if (idInput) idInput.value = username;
            if (pwInput) pwInput.value = password;
        }, username, password);

        await new Promise(resolve => setTimeout(resolve, 1000));

        log('로그인 버튼 클릭 중...');

        // JavaScript로 직접 버튼 클릭 (Python 코드와 동일한 방식)
        try {
            await page.evaluate(() => {
                const button = document.querySelector('button[type="submit"]');
                if (button) button.click();
            });
        } catch (err) {
            log('로그인 버튼 클릭 실패, 폼 제출 시도...', 'DEBUG');
            // 폴백: 폼 제출 방식
            await page.evaluate(() => {
                const forms = document.querySelectorAll('form');
                if (forms.length > 0) forms[0].submit();
            });
        }

        // 로그인 처리 대기
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 로그인 성공 확인
        try {
            await page.waitForSelector('img.rounded-full', { timeout: 5000 });
            log('로그인 성공!', 'SUCCESS');
            return true;
        } catch (err) {
            // 대안적 로그인 확인 방법
            const pageContent = await page.content();
            if (pageContent.includes('마이로그') || pageContent.includes('/index/member_info')) {
                log('로그인 성공! (대안 확인)', 'SUCCESS');
                return true;
            } else {
                log('로그인 상태 확인 불가, 진행 시도...', 'DEBUG');
                return true; // 일단 진행
            }
        }

    } catch (error) {
        log(`로그인 실패: ${error.message}`, 'ERROR');
        await saveErrorScreenshot(page, error);
        return false;
    }
}

/**
 * 게시글 갱신 함수
 */
async function refreshPost(page) {
    try {
        log('수정 페이지 접속 중...');

        // 수정 페이지 접속
        await page.goto('https://www.filmmakers.co.kr/locationBank/26596329/edit', {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        log('등록 버튼 찾기 및 클릭 중...');

        // 등록 버튼 찾기 및 클릭 (디버그 정보 추가)
        const buttonResult = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button[type="submit"]');
            const allButtons = document.querySelectorAll('button');

            console.log(`전체 버튼 수: ${allButtons.length}`);
            console.log(`submit 버튼 수: ${buttons.length}`);

            // 모든 버튼의 텍스트 확인
            for (let i = 0; i < allButtons.length; i++) {
                console.log(`버튼 ${i}: "${allButtons[i].innerText}" (type: ${allButtons[i].type})`);
            }

            // submit 버튼 중 등록 버튼 찾기
            for (let i = 0; i < buttons.length; i++) {
                console.log(`submit 버튼 ${i}: "${buttons[i].innerText}"`);
                if (buttons[i].innerText.includes('등록')) {
                    buttons[i].click();
                    return { success: true, buttonText: buttons[i].innerText };
                }
            }

            return { success: false, submitButtonCount: buttons.length, totalButtonCount: allButtons.length };
        });

        log(`버튼 찾기 결과: ${JSON.stringify(buttonResult)}`, 'DEBUG');

        if (!buttonResult.success) {
            log(`등록 버튼을 찾을 수 없습니다. Submit 버튼: ${buttonResult.submitButtonCount}개, 전체 버튼: ${buttonResult.totalButtonCount}개`, 'ERROR');
            await saveErrorScreenshot(page, new Error('등록 버튼 없음'));
            return { success: false, message: '등록 버튼을 찾을 수 없음' };
        }

        log(`등록 버튼 클릭됨: "${buttonResult.buttonText}"`, 'SUCCESS');

        log('게시글 갱신 완료!', 'SUCCESS');
        await new Promise(resolve => setTimeout(resolve, 2000));

        return { success: true, message: '갱신 완료' };

    } catch (error) {
        log(`갱신 오류: ${error.message}`, 'ERROR');
        await saveErrorScreenshot(page, error);
        return { success: false, message: error.message };
    }
}

/**
 * 메인 자동화 실행 함수
 */
async function runAutomation() {
    let browser = null;

    try {
        log('=== 필름메이커스 자동 갱신 시작 ===');

        // 환경변수 확인
        if (!FILMMAKERS_ID || !FILMMAKERS_PW) {
            throw new Error('환경변수 FILMMAKERS_ID 또는 FILMMAKERS_PW가 설정되지 않았습니다.');
        }

        log('브라우저 시작 중...');

        // Puppeteer 브라우저 시작 (GitHub Actions 환경에서는 제약 없음)
        browser = await puppeteer.launch({
            headless: 'new',  // 새로운 headless 모드 사용
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        const page = await browser.newPage();

        // User-Agent 설정
        await page.setUserAgent(
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );

        // 디버그 모드에서는 더 많은 정보 출력
        if (DEBUG) {
            page.on('console', msg => log(`브라우저: ${msg.text()}`, 'DEBUG'));
            page.on('response', response => {
                if (response.status() >= 400) {
                    // Google 광고 관련 403 오류 무시
                    if (response.url().includes('fundingchoicesmessages.google.com')) {
                        return;
                    }
                    log(`HTTP 오류: ${response.status()} ${response.url()}`, 'DEBUG');
                }
            });
        }

        // 로그인
        const loginSuccess = await login(page, FILMMAKERS_ID, FILMMAKERS_PW);
        if (!loginSuccess) {
            throw new Error('로그인 실패');
        }

        // 게시글 갱신
        const result = await refreshPost(page);

        log('=== 자동화 완료 ===', result.success ? 'SUCCESS' : 'ERROR');

        if (!result.success) {
            process.exit(1); // GitHub Actions에서 실패로 표시
        }

        return result;

    } catch (error) {
        log(`자동화 실패: ${error.message}`, 'ERROR');
        process.exit(1); // GitHub Actions에서 실패로 표시
    } finally {
        if (browser) {
            await browser.close();
            log('브라우저 종료');
        }
    }
}

// 스크립트가 직접 실행될 때만 자동화 시작
if (require.main === module) {
    runAutomation().catch(error => {
        log(`예상치 못한 오류: ${error.message}`, 'ERROR');
        process.exit(1);
    });
}

module.exports = { runAutomation, login, refreshPost };