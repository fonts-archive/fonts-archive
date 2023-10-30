// react hooks
import React, { useEffect, useState } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useInView } from 'react-intersection-observer';

// hooks
import axios from 'axios';
import { throttle } from 'lodash';

// 컴포넌트
import DummyText from "./dummytext";
import SkeletonBox from './skeletonbox';

export default function FontBox ({lang, type, sort, user, like, filter, searchword, text, num}:{lang: string, type: string, sort: string, user: any, like: any, filter: string, searchword: string, text: string, num: number}) {        
    // react-intersection-observer 훅
    const { ref, inView } = useInView();

    // 좋아요한 폰트가 있으면 array => string으로 변환 후 api에 전달
    let likedArr: string[] = [];
    like === null ? null : like.forEach((obj: any) => likedArr.push(obj.font_id));
    let liked = likedArr.join();

    // useInfiniteQuery 사용해 다음에 불러올 데이터 업데이트
    const {
        isLoading,
        data,
        remove,
        refetch,
        fetchNextPage,
        hasNextPage
    } = useInfiniteQuery(['fonts', {keepPreviousData: true}], async ({ pageParam = '' }) => {
        await new Promise((res) => setTimeout(res, 100));
        const res = await axios.get('/api/fontlist', {params: { id: pageParam, lang: lang, type: type, sort: sort, searchword: searchword, filter: filter === 'liked' ? liked : '' }});
        return res.data;
    },{
        getNextPageParam: (lastPage) => lastPage.nextId ?? false,
    });

    // react-intersection-observer 사용해 ref를 지정한 요소가 viewport에 있을 때 fetchNextPage 함수 실행
    useEffect(() => {
        if (inView && hasNextPage) { fetchNextPage(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    // 폰트 검색 필터링 값 변경 시 기존 데이터 지우고 useInfiniteQuery 재실행
    useEffect(() => {
        remove();
        refetch();
        window.scrollTo(0, 0);
    }, [lang, type, sort, searchword, remove, refetch]);

    // 좋아요 state
    const [alertDisplay, setAlertDisplay] = useState<boolean>(false);
    const [hoverDisplay, setHoverDisplay] = useState<boolean>(true);

    /** 로그인 중이 아닐 때 좋아요 클릭 방지 */
    const handleLikeClick = (e: React.MouseEvent<HTMLInputElement>) => {
        if (user === null) {
            setAlertDisplay(true);
            e.preventDefault();
        }
    }

    /** 좋아요 버튼 체인지 이벤트 */
    const handleLikeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (user !== null) {
            // 좋아요 버튼 눌렀을 때 호버창 지우기
            setHoverDisplay(false);

            await axios.post('/api/post/updatelike', null, { params: { code: e.target.id ,checked: e.target.checked, user_no: user.user_no } })
            .then(res => {
                let hoverEl = e.target.nextSibling?.nextSibling as HTMLDivElement;
                if (res.data.msg === 'liked') { hoverEl.innerText='좋아요 해제'; }
                else { hoverEl.innerText='좋아요'; }

                // 좋아요 버튼 눌렀을 때 호버창 다시 띄우기
                setHoverDisplay(true);
            })
            .catch(err => console.log(err));
        }
    }

    /** 렌더링 시 좋아요 되어있는 폰트들은 체크된 상태로 변경 */
    const handleDefaultLike = (fontCode: number) => {
        return like === null ? false : like.some((font: any) => font.font_id === fontCode);
    }

    /** 알럿창 닫기 */
    const handleAlertClose = () => { setAlertDisplay(false); }

    /** 스크롤 시 알럿창 닫기 */
    const handleScroll = () => { setAlertDisplay(false); }
    const throttledScroll = throttle(handleScroll, 500);

    // lodash/throttle을 이용해 스크롤 제어
    useEffect(() => {
        window.addEventListener('scroll', throttledScroll);
        return () => { window.removeEventListener('scroll', throttledScroll); }
    });

    // 폰트 로딩 콜백 - hook
    const FontFaceObserver = require('fontfaceobserver');

    // 폰트 로딩 콜백 - 투명도 변경
    useEffect(() => {
        if (data) {
            for (let i = 0; i < data.pages[data.pages.length-1].fonts.length; i++) {
                let font = new FontFaceObserver(data.pages[data.pages.length-1].fonts[i].font_family)
                font.load(null, 5000).then(function() { // 폰트 로딩 시 텍스트 투명도 제거 (timeout 5초)
                    let thisFont = document.getElementsByClassName(data.pages[data.pages.length-1].fonts[i].code + '-text');
                    if (thisFont.length !== 0) {
                        thisFont[0].classList.add('text-theme-3', 'dark:text-theme-8');
                        thisFont[0].classList.remove('text-theme-3/60', 'dark:text-theme-8/60');   
                    }
                }, function() { // 폰트 로딩 실패 시에도 투명도 제거
                    let thisFont = document.getElementsByClassName(data.pages[data.pages.length-1].fonts[i].code + '-text');
                    if (thisFont.length !== 0) {
                        thisFont[0].classList.add('text-theme-3', 'dark:text-theme-8');
                        thisFont[0].classList.remove('text-theme-3/60', 'dark:text-theme-8/60');   
                    }
                });
            }
        }
    }, [data, FontFaceObserver]);

    return (
        <>
            <div className='w-[100%] flex flex-col justify-start items-end'>
                <div className="main-menu w-[100%] relative flex flex-wrap flex-row justify-between items-stretch pt-[16px] pb-[20px]">
                    
                    {/* 로그인 중이 아닐 때 좋아요 alert창 팝업 */}
                    {
                        alertDisplay === true
                        ? <div className='fixed z-20 top-[24px] tlg:top-[20px] right-[32px] tlg:right-[28px] w-content h-[60px] tlg:h-[56px] px-[12px] flex flex-row justify-between items-center rounded-[8px] border border-theme-yellow dark:border-theme-blue-1 text-[13px] tlg:text-[12px] text-theme-10/80 dark:text-theme-9/80 bg-theme-4 dark:bg-theme-blue-2'>
                            <div className='flex flex-row justify-start items-center'>
                                <svg className='w-[24px] tlg:w-[20px] fill-theme-8 dark:fill-theme-9/80' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828l.645-1.937zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.734 1.734 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.734 1.734 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.734 1.734 0 0 0 3.407 2.31l.387-1.162zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L10.863.1z"/></svg>
                                <div className='ml-[8px]'>
                                    좋아요 기능은 로그인 시 이용 가능합니다. <br/>
                                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                                    <a href="/user/login" className='text-theme-yellow dark:text-theme-blue-1 hover:underline tlg:hover:no-underline'>로그인 하러 가기</a>
                                </div>
                            </div>
                            <div onClick={handleAlertClose} className='flex flex-row justify-center items-center ml-[8px] cursor-pointer'>
                                <svg className='w-[20px] fill-theme-10/80 dark:fill-theme-9' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>
                            </div>
                        </div> : <></>
                    }
                    
                    {/* fetchNextPage */}
                    {data && data.pages.map((page) => {
                        return (
                            <React.Fragment key={page.nextId ?? 'lastPage'}>
                                {page.fonts.map((font: {
                                    code: number
                                    name: string
                                    lang: string
                                    date: string
                                    source: string
                                    font_family: string
                                    font_type: string
                                    cdn_url: string
                                }) => (
                                    <a aria-label="font-link" href={`/post/${font.font_family.replaceAll(" ", "+")}`} key={font.code} className="relative block w-[calc(25%-8px)] tlg:w-[calc(33.3%-6px)] tmd:w-[calc(50%-4px)] txs:w-[100%] h-[22vw] tlg:h-[30vw] tmd:h-[46vw] txs:h-[82vw] p-[1.04vw] tlg:p-[1.95vw] tmd:p-[2.6vw] txs:p-[4.17vw] mt-[12px] tlg:mt-[10px] rounded-[8px] border border-theme-7 dark:border-theme-4 hover:bg-theme-8/60 tlg:hover:bg-transparent hover:dark:bg-theme-3/40 tlg:hover:dark:bg-transparent animate-fontbox-fade-in cursor-pointer">
                                        <link href={font.cdn_url} rel="stylesheet" type="text/css" itemProp="url"></link>
                                        <div className='group absolute z-20 top-[1.46vw] tlg:top-[2.73vw] tmd:top-[3.65vw] txs:top-[5.83vw] right-[1.25vw] tlg:right-[1.95vw] tmd:right-[2.6vw] txs:right-[4.17vw]'>
                                            <input onClick={handleLikeClick} onChange={handleLikeChange} type="checkbox" id={font.code.toString()} className='like hidden' defaultChecked={handleDefaultLike(font.code)}/>
                                            <label htmlFor={font.code.toString()} className='cursor-pointer'>
                                                <svg className='w-[1.46vw] tlg:w-[2.73vw] tmd:w-[3.65vw] txs:w-[5.83vw] fill-theme-5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"/></svg>
                                                <svg className='w-[1.46vw] tlg:w-[2.73vw] tmd:w-[3.65vw] txs:w-[5.83vw] fill-theme-red' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>
                                            </label>
                                            <div className={`${hoverDisplay === true ? 'group-hover:block' : 'group-hover:hidden'} like-btn w-content absolute z-20 left-[50%] top-[-2.4vw] text-[0.73vw] font-medium leading-none px-[0.63vw] py-[0.42vw] rounded-[0.21vw] hidden tlg:group-hover:hidden group-hover:animate-fontbox-zoom-in bg-theme-red text-theme-3 after:w-[0.42vw] after:h-[0.42vw] after:bottom-[-0.21vw]`}>{like === null || like.some((likedFont: any) => likedFont.font_id === font.code) === false ? '좋아요' : '좋아요 해제'}</div>
                                        </div>
                                        <div style={{fontFamily:"'"+font.font_family+"'"}} className="text-[1.04vw] tlg:text-[1.95vw] tmd:text-[2.6vw] txs:text-[4.17vw] mb-[0.42vw] tlg:mb-[0.78vw] tmd:mb-[1.04vw] txs:mb-[1.67vw] text-normal leading-tight text-theme-3 dark:text-theme-8">{font.name}</div>
                                        <div className="flex flex-row justify-start items-center">
                                            <div style={{fontFamily:"'"+font.font_family+"'"}} className="inline-block text-[0.73vw] tlg:text-[1.37] tmd:text-[1.82vw] txs:text-[2.92vw] text-normal text-theme-5 dark:text-theme-6 leading-tight"><span className="text-theme-3 dark:text-theme-8">by</span> {font.source}</div>
                                        </div>
                                        <div className="w-[100%] h-px my-[0.83vw] tlg:my-[1.56vw] tmd:my-[2.08vw] txs:my-[3.33vw] bg-theme-7 dark:bg-theme-5"></div>
                                        <div style={{fontFamily:"'"+font.font_family+"'"}} className="text-[1.88vw] tlg:text-[3.52vw] tmd:text-[4.69vw] txs:text-[7.5vw] text-normal leading-normal overflow-hidden">
                                            <p className={`${font.code + '-text'} textbox ellipsed-text text-theme-3/60 dark:text-theme-8/60`}><DummyText lang={font.lang} text={text} num={num}/></p>
                                        </div>
                                    </a>
                                ))}
                            </React.Fragment>
                        )
                    })}

                    {/* 정렬 맞추기 위한 빈 div */}
                    <div className="w-[calc(25%-8px)] tlg:w-[calc(33.3%-6px)] tmd:w-[calc(50%-4px)] txs:w-[100%]"></div>
                    <div className="w-[calc(25%-8px)] tlg:w-[calc(33.3%-6px)] tmd:w-[calc(50%-4px)] txs:w-[100%]"></div>
                    <div className="w-[calc(25%-8px)] tlg:w-[calc(33.3%-6px)] tmd:w-[calc(50%-4px)] txs:w-[100%]"></div>

                    {/* 로딩 스켈레톤 */}
                    {
                        isLoading 
                        ? <div className='w-[100%] flex flex-wrap flex-row justify-between items-start'>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                            <SkeletonBox/>
                        </div>
                        : null
                    }

                    {/* 뷰포트 만날 시 다음 데이터 로딩 */}
                    <span className="w-[100%]" ref={ref}></span>

                    {/* 로딩 바 */}
                    {hasNextPage ? <div className="w-[100%] pt-[20px] flex flex-row justify-center items-center"><span className="loader w-[36px] h-[36px]"></span></div> : null}
                </div>
            </div>
        </>
    )
}