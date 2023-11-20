// next hooks
import { NextSeo } from 'next-seo';

// react hooks
import React from 'react';

// api
import { FetchUserInfoFromToken } from '../api/user/fetchuserinfo';
import axios from 'axios';

// components
import Header from "@/components/header";
import MailAnimation from '@/components/mailanimation';

const SendEmail = ({params}: any) => {
    // 디바이스 체크
    const isMac: boolean = params.userAgent.includes("Mac OS") ? true : false;

    // 빈 함수
    const emptyFn = () => { return; }

    // 유저 정보 저장
    const user = params.user;

    // 이메일 다시 보내기
    const resendEmail = async () => {
        await axios.post('/api/user/register', {
            id: user.user_id,
            name: user.user_name,
            session_id: user.user_session_id,
            email_token: user.user_email_token,
        })
        .then(() => location.reload())
        .catch(err => console.log(err));
    }

    return (
        <>
            {/* Head 부분*/}
            <NextSeo 
                title={"폰트 아카이브"}
                description={"폰트 아카이브 · 상업용 무료 한글 폰트 저장소"}
            />

            {/* 헤더 */}
            <Header
                isMac={isMac}
                theme={params.theme}
                user={null}
                page={""}
                license={""}
                lang={""}
                type={""}
                sort={""}
                source={""}
                handleTextChange={emptyFn}
                handleLicenseOptionChange={emptyFn}
                handleLangOptionChange={emptyFn}
                handleTypeOptionChange={emptyFn}
                handleSortOptionChange={emptyFn}
                handleSearch={emptyFn}
            />

            {/* 메인 */}
            <div className='w-[100%] flex flex-col justify-start items-center'>
                <div className='w-[100%] text-[14px] tlg:text-[12px] text-theme-6 dark:text-theme-7 flex flex-col justify-center items-center'>
                    <MailAnimation/>
                    <h2 className='text-center leading-relaxed break-keep'>
                        인증 메일이 <span className='text-theme-5 dark:text-theme-9 font-medium'>[{params.id}]</span>(으)로 전송되었습니다. <br className='txs:hidden'/>
                        받으신 이메일의 링크를 클릭하면 가입이 완료됩니다.
                    </h2>
                    <h3 className='mt-[28px] tlg:mt-[20px] flex flex-row justify-center items-center'>
                        이메일을 확인할 수 없나요?
                        <div onClick={resendEmail} className='text-theme-yellow dark:text-theme-blue-1 hover:underline tlg:hover:no-underline ml-[8px] cursor-pointer'>인증 메일 다시 보내기</div>
                    </h3>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(ctx: any) {
    try {
        // 필터링 쿠키 체크
        const cookieTheme = ctx.req.cookies.theme === undefined ? "dark" : ctx.req.cookies.theme;

        // 디바이스 체크
        const userAgent = ctx.req ? ctx.req.headers['user-agent'] : navigator.userAgent;

        // 세션ID 쿠키 제거
        ctx.res.setHeader('Set-Cookie', [`session=deleted; max-Age=0; path=/`]);

        // 토큰 유효성 검사
        const token = ctx.query.token;
        const user = await FetchUserInfoFromToken(token);

        if (token === undefined || token === "" || user === null || user.user_email_confirm) {
            return {
                redirect: {
                    destination: "/404",
                    permanent: false,
                }
            }
        } else {
            return {
                props: {
                    params: {
                        theme: cookieTheme,
                        userAgent: userAgent,
                        user: user,
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default SendEmail;