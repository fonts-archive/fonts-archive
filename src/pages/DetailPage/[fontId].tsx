// Next hooks
import Link from "next/link";
import { NextSeo } from 'next-seo';

// react hooks
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useCookies } from 'react-cookie';

// hooks
import axios from "axios";
import { isMacOs } from "react-device-detect";
import { throttle } from "lodash";

// api
import { FetchFont } from "../api/DetailPage/fetchFont";
import { FetchFontInfo } from "../api/DetailPage/fetchFontInfo";

// materail-ui hooks
import { Slider } from "@mui/material";

// components
import Tooltip from "@/components/tooltip";
import FontSearch from "@/components/fontsearch";
import DummyText from "@/components/dummytext";
import { FetchFontComp } from "../api/DetailPage/fetchFontComp";

const alphabetKR = '가 나 다 라 마 바 사 아 자 차 카 타 파 하 a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9 가 나 다 라 마 바 사 아 자 차 카 타 파 하 a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9 가 나 다 라 마 바 사 아 자 차 카 타 파 하 a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9';
const alphabetEN = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9';

function DetailPage({fonts, comps, randomNum, initFontSize, initLineHeight, initLetterSpacing}:{fonts: any, comps: string, randomNum: number, initFontSize: number, initLineHeight: number, initLetterSpacing: number}) {
    // 쿠키 훅
    const [cookies, setCookie] = useCookies<string>([]);

    // 폰트 데이터 props
    const font = fonts[0];

    // 폰트 미리보기 props
    const defaultFontSize = initFontSize;
    const defaultLineHeight = initLineHeight;
    const defaultLetterSpacing = initLetterSpacing;

    /** 조회수 업데이트 */
    const viewUpdate = async () => {
        await fetch("/api/updateview", { method: "POST", body: JSON.stringify(font) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { viewUpdate(); }, [font]);

    /** 조회수 불러오기 */
    const defaultView = null;
    const [view, setView] = useState<number | null>(defaultView);
    const viewFetch = async () => {
        const res = await axios.get("/api/fetchview", { params: { code: font.code } }).then(res => { return res.data; }).catch(error => console.log(error));
        setView(res.fonts[0].view);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => { viewFetch(); }, [view]);

    /** 조회수 단위 변경 : 1000 => 1K */
    const ranges = [
        { divider: 1e6 , suffix: 'M' },
        { divider: 1e3 , suffix: 'k' }
    ];
    const formatNumber = (n: number | null) => {
        if (n === null) {
            return ""
        }
        else {
            for (let i = 0; i < ranges.length; i++) {
                if (n >= ranges[i].divider) {
                    return (n / ranges[i].divider).toString() + ranges[i].suffix;
                }
            }
        }
        return n.toString();
    }

    /** 폰트 검색 훅 */
    const defaultSearchDisplay = "hide"
    const [searchDisplay, setSearchDisplay] = useState(defaultSearchDisplay);
    useEffect(() => { setSearchDisplay(defaultSearchDisplay); }, [defaultSearchDisplay])

    /** 폰트 검색 버튼 클릭 */
    const handleFontSearch = () => {
        setSearchDisplay("show");
        document.body.style.overflow = "hidden";
    }

    /** 폰트 검색 ESC 버튼 클릭 */
    const handleFontSearchCloseBtn = () => {
        setSearchDisplay("hide");
        document.body.style.overflow = "auto";
    }

    /** 키값 변경 */
    const [isMac, setIsMac] = useState<boolean | undefined>(undefined);
    useEffect(() => {
        if (isMacOs) { setIsMac(true) }
        else { setIsMac(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMacOs]);

    /** 웹 폰트 적용하기 훅 */
    const defaultWebFont = "CSS";
    const [webFont, setWebFont] = useState(defaultWebFont);
    useEffect(() => {
        setWebFont(defaultWebFont);
    },[defaultWebFont]);

    /** 웹 폰트 클릭 시 코드 변경 */
    const handleWebFont = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "CSS") { setWebFont("CSS"); }
        else if (e.target.value === "link") { setWebFont("link"); }
        else if (e.target.value === "import") { setWebFont("import"); }
        else { setWebFont("font-face"); }
    }

    useEffect(() => {
        const cdnFontFace = document.getElementById("cdn-font-face") as HTMLDivElement;
        if (webFont === "font-face") { cdnFontFace.innerHTML = font.cdn_font_face; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [webFont]);

    /** 웹 폰트 적용하기 복사 버튼 클릭 이벤트 */
    const copyOnClick = () => {
        const pre = document.getElementsByClassName("cdn_pre")[0] as HTMLPreElement;
        const copyBtn = document.getElementsByClassName("copy_btn")[0] as SVGSVGElement;
        const copyChkBtn = document.getElementsByClassName("copy_chk_btn")[0] as SVGSVGElement;

        window.navigator.clipboard.writeText(pre.innerText);

        copyBtn.style.display = 'none';
        copyChkBtn.style.display = 'block';
        setTimeout(function() {
            copyBtn.style.display = 'block';
            copyChkBtn.style.display = 'none';
        },1000);
    }

    /** 폰트 미리보기 텍스트 체인지 이벤트 */
    const defaultText = "";
    const [text, setText] = useState(defaultText);
    useEffect(() => {
        setText(defaultText);
    }, [defaultText])
    const handleFontWeightChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    }

    /** 라이센스 본문 */
    useEffect(() => {
        const license = document.getElementById("license") as HTMLDivElement;
        license.innerHTML = font.license;
    }, [font.license]);

    /** lodash/throttle을 이용해 스크롤 제어 */
    const handleScroll = () => {
        const inputTheme = document.getElementById("color-theme") as HTMLInputElement;
        inputTheme.checked = false;
    }
    const throttledScroll = throttle(handleScroll,500);

    /** lodash/throttle을 이용해 스크롤 */
    useEffect(() => {
        window.addEventListener('scroll', throttledScroll);
        return () => { window.removeEventListener('scroll', throttledScroll); }
    });

    /** 컬러 테마 ref */
    const refThemeLabel = useRef<HTMLLabelElement>(null);
    const refThemeDiv = useRef<HTMLDivElement>(null);

    /** 컬러 테마 영역 외 클릭 */
    useEffect(() => {
        function handleThemeOutside(e:Event) {
            const themeInput = document.getElementById("color-theme") as HTMLInputElement;
            if (refThemeDiv?.current && !refThemeDiv.current.contains(e.target as Node) && refThemeLabel.current && !refThemeLabel.current.contains(e.target as Node)) {
                themeInput.checked = false;
            }
        }
        document.addEventListener("mouseup", handleThemeOutside);
        return () => document.removeEventListener("mouseup", handleThemeOutside);
    },[refThemeDiv, refThemeLabel]);

    /** 컬러 테마 선택창 팝업 */
    const handleColorTheme = (e:React.ChangeEvent<HTMLInputElement>) => {
        const colorTheme = document.getElementById("color-theme-select") as HTMLDivElement;
        if (e.target.checked) {
            colorTheme.classList.add("animate-fade-in");
            setTimeout(function() { colorTheme.classList.remove('animate-fade-in'); },600);
        }
    }

    /** 컬러 테마 state */
    const defaultTheme = "dark";
    const [theme, setTheme] = useState(defaultTheme);
    useLayoutEffect(() => {
        const lightMode = document.getElementById("light-mode") as HTMLInputElement;
        const darkMode = document.getElementById("dark-mode") as HTMLInputElement;

        if (cookies.theme === undefined || cookies.theme === "dark") {
            document.documentElement.classList.add('dark');
            darkMode.checked = true;
            setTheme("dark");
        } else {
            document.documentElement.classList.remove('dark');
            setTheme("light");
            lightMode.checked = true;
        }
    }, [cookies.theme]);

    /** 컬러 테마 변경 */
    const handleColorThemeChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const themeInput = document.getElementById("color-theme") as HTMLInputElement;

        if (e.target.checked) {
            setCookie('theme', e.target.value, {path:'/', secure:true, sameSite:'none'});
            if (e.target.value === "dark") {
                document.documentElement.classList.add('dark');
                setTheme("dark");
            } else {
                document.documentElement.classList.remove('dark');
                setTheme("light");
            }
        }
        themeInput.checked = false;
    }

    // 폰트 미리보기 state
    const [fontSize, setFontSize] = useState<number>(defaultFontSize);
    const [lineHeight, setLineHeight] = useState<number>(defaultLineHeight);
    const [letterSpacing, setLetterSpacing] = useState<number>(defaultLetterSpacing);

    /** MUI TextArea 줄바꿈 시 높이 변경 */
    const handleHeightChange = (e: any) => {
        e.target.style.height = 0;
        e.target.style.height = (e.target.scrollHeight)+"px";
    }

    /** MUI 폰트 크기 뒤에 px 추가 */
    const fnAddUnit = (value: number) => {
        return value + "px";
    }

    /** MUI 행간 값 */
    const fnLineheightValue = (value: number) => {
        return value / 10;
    }

    /** MUI 자간 값 */
    const fnLetterSpacingValue = (value: number) => {
        return value / 10;
    }

    return (
        <>
            {/* Head 부분*/}
            <NextSeo title={font.name + " · 폰트 아카이브"}/>

            {/* 고정 메뉴 */}
            <Tooltip/>

            {/* 헤더 */}
            <div className='interface w-[100%] h-[60px] tlg:h-[56px] px-[20px] tlg:px-[16px] tmd:px-[12px] fixed right-0 top-0 z-10 flex flex-row justify-between items-center backdrop-blur bg-theme-9/80 dark:bg-theme-2/80 border-b border-theme-7 dark:border-theme-4'>
                <div className="flex flex-row justify-start items-center">
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/" aria-label="logo" className="w-[36px] tlg:w-[32px] h-[36px] tlg:h-[32px] flex flex-row justify-center items-center rounded-[8px] tlg:rounded-[6px] mr-[12px] bg-theme-4 dark:bg-theme-1/80 hover:dark:bg-theme-1/60 tlg:hover:dark:bg-theme-1/80 hover:drop-shadow-default hover:dark:drop-shadow-dark tlg:hover:drop-shadow-none">
                        <svg className="w-[18px] tlg:w-[16px] pb-px fill-theme-10 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m2.244 13.081.943-2.803H6.66l.944 2.803H8.86L5.54 3.75H4.322L1 13.081h1.244zm2.7-7.923L6.34 9.314H3.51l1.4-4.156h.034zm9.146 7.027h.035v.896h1.128V8.125c0-1.51-1.114-2.345-2.646-2.345-1.736 0-2.59.916-2.666 2.174h1.108c.068-.718.595-1.19 1.517-1.19.971 0 1.518.52 1.518 1.464v.731H12.19c-1.647.007-2.522.8-2.522 2.058 0 1.319.957 2.18 2.345 2.18 1.06 0 1.716-.43 2.078-1.011zm-1.763.035c-.752 0-1.456-.397-1.456-1.244 0-.65.424-1.115 1.408-1.115h1.805v.834c0 .896-.752 1.525-1.757 1.525z"/></svg>
                    </a>
                </div>
                <div className="w-content flex flex-row justify-start items-center">
                    <button onClick={handleFontSearch} className="w-[220px] tlg:w-[200px] tmd:w-[32px] h-[32px] relative text-[14px] tlg:text-[12px] text-normal text-theme-5 dark:text-theme-8 leading-none bg-theme-8 dark:bg-theme-3/80 flex flex-start justify-start items-center rounded-[8px] tmd:rounded-[6px] pl-[38px] tlg:pl-[30px] tmd:pl-0 pb-px hover:bg-theme-8 hover:bg-theme-7/60 hover:dark:bg-theme-4/60 tlg:hover:dark:bg-theme-3/80 hover:drop-shadow-default hover:dark:drop-shadow-dark tlg:hover:drop-shadow-none">
                        <span className="tmd:hidden">폰트 검색하기...</span>
                        <svg className="w-[12px] tlg:w-[10px] absolute left-[16px] tlg:left-[11px] top-[50%] translate-y-[-50%] fill-theme-5 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                        <div className="absolute right-[16px] flex flex-row justify-center items-center">
                            {
                                isMac === true
                                ? <div className="flex flex-row justify-center items-center">
                                    <svg className="tmd:hidden w-[10px] fill-theme-3 dark:fill-theme-8 mr-px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3.5 2A1.5 1.5 0 0 1 5 3.5V5H3.5a1.5 1.5 0 1 1 0-3zM6 5V3.5A2.5 2.5 0 1 0 3.5 6H5v4H3.5A2.5 2.5 0 1 0 6 12.5V11h4v1.5a2.5 2.5 0 1 0 2.5-2.5H11V6h1.5A2.5 2.5 0 1 0 10 3.5V5H6zm4 1v4H6V6h4zm1-1V3.5A1.5 1.5 0 1 1 12.5 5H11zm0 6h1.5a1.5 1.5 0 1 1-1.5 1.5V11zm-6 0v1.5A1.5 1.5 0 1 1 3.5 11H5z"/></svg>
                                    <span className="tmd:hidden text-[12px] leading-none pt-px">K</span>
                                </div>
                                : ( isMac === false
                                    ? <span className="tmd:hidden text-[12px] tlg:text-[10px] leading-none">Ctrl + K</span>
                                    : <></>
                                )
                            }
                        </div>
                    </button>
                    <div className='w-px h-[20px] tlg:h-[16px] tmd:hidden rounded-full mx-[10px] mr-[8px] tlg:mx-[8px] tlg:mr-[4px] bg-theme-7 dark:bg-theme-4'></div>
                    <div className="relative mx-[10px] txl:mx-[8px]">
                        <input onChange={handleColorTheme} type="checkbox" id="color-theme" className="hidden"/>
                        <label ref={refThemeLabel} htmlFor="color-theme" className="w-[32px] h-[32px] flex flex-row justify-center items-center cursor-pointer">
                            <svg className={`light-mode light-label w-[20px]`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>
                            <svg className={`dark-mode dark-label w-[20px]`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/></svg>
                        </label>
                        <div ref={refThemeDiv} id="color-theme-select" className="color-theme-select w-[128px] absolute left-[50%] top-[40px] translate-x-[-50%] rounded-[8px] px-[16px] py-[8px] bg-theme-5 dark:bg-theme-blue-2 drop-shadow-default dark:drop-shadow-dark">
                            <input onChange={handleColorThemeChange} type="radio" name="color-theme-select" id="light-mode" value="light" className="hidden"/>
                            <label htmlFor="light-mode" className="flex flex-row justify-start items-center py-[8px] cursor-pointer">
                                <svg className={`light-svg w-[16px] fill-theme-9/80"`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>
                                <span className={`light-txt text-[14px] ml-[10px]`}>라이트 모드</span>
                            </label>
                            <input onChange={handleColorThemeChange} type="radio" name="color-theme-select" id="dark-mode" value="dark" className="hidden"/>
                            <label htmlFor="dark-mode" className="flex flex-row justify-start items-center py-[8px] cursor-pointer">
                                <svg className={`dark-svg w-[16px] fill-theme-9/80`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/><path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/></svg>
                                <span className={`dark-txt text-[14px] ml-[10px]`}>다크 모드</span>
                            </label>
                        </div>
                    </div>
                    <Link aria-label="github-link" href="https://github.com/taedonn/fonts-archive" target="_blank" className="w-[32px] h-[32px] flex flex-row justify-center items-center">
                        <svg className="w-[22px] fill-theme-4/80 dark:fill-theme-9/80 hover:fill-theme-4 hover:dark:fill-theme-9 tlg:hover:fill-theme-9/80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                    </Link>
                </div>
            </div>

            {/* 메인 */}
            <div className="w-[100%] mt-[60px] tlg:mt-[56px] p-[20px] tlg:p-[16px] tmd:p-[12px] py-[24px] tlg:py-[20px] tmd:py-[16px]">
                <link href={font.cdn_url} rel="stylesheet" type="text/css" itemProp="url"></link>
                <div className="w-[100%] flex flex-col justify-start items-start">
                    <div style={{fontFamily:font.font_family}} className="text-[32px] tlg:text-[28px] tmd:text-[24px] text-theme-3 dark:text-theme-9 font-medium leading-tight mb-[12px] tlg:mb-[8px]">{font.name}</div>
                    <div className="flex flex-row justify-start items-center">
                        <div style={{fontFamily:font.font_family}} className="text-[16px] tlg:text-[14px] tmd:text-[12px] leading-tight text-theme-3 dark:text-theme-9 ml-[2px] mr-[16px] tlg:mr-[14px] tmd:mr-[12px]">제작<span className="text-theme-5 dark:text-theme-7 ml-[8px] tlg:ml-[6px]">{font.source}</span></div>
                        <div style={{fontFamily:font.font_family}} className="text-[16px] tlg:text-[14px] tmd:text-[12px] leading-tight text-theme-3 dark:text-theme-9  mr-[16px] tlg:mr-[14px] tmd:mr-[12px]">형태<span className="text-theme-5 dark:text-theme-7 ml-[8px] tlg:ml-[6px]">{font.font_type === "Sans Serif" ? "고딕" : (font.font_type === "Serif" ? "명조" : (font.font_type === "Hand Writing" ? "손글씨" : (font.font_type === "Display" ? "장식체" : "픽셀체")))}</span></div>
                        <div style={{fontFamily:font.font_family}} className="text-[16px] tlg:text-[14px] tmd:text-[12px] leading-tight text-theme-3 dark:text-theme-9 ">조회수<span className="text-theme-5 dark:text-theme-7 ml-[8px] tlg:ml-[6px]">{formatNumber(view)}</span></div>
                    </div>
                    <div className="w-[100%] h-px my-[20px] tlg:my-[16px] bg-theme-7 dark:bg-theme-4"></div>
                </div>
                <div className="flex flex-row justify-start items-center mb-[60px] tlg:mb-[48px] tmd:mb-[40px]">
                    <Link aria-label="source-link" href={font.source_link} target="_blank" className="h-[40px] tlg:h-[36px] tmd:h-[32px] flex flex-row justify-center items-center text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-3 dark:text-theme-blue-1 font-medium dark:border-2 tmd:dark:border dark:border-theme-blue-1 rounded-full px-[20px] mr-[12px] tmd:mr-[8px] cursor-pointer bg-theme-yellow hover:bg-theme-yellow/90 tlg:hover:bg-theme-yellow dark:bg-transparent hover:dark:bg-theme-blue-1/10 tlg:hover:dark:bg-transparent">다운로드 페이지로 이동</Link>
                    {
                        font.license_ofl[0] === "N"
                        ? <></>
                        : <Link aria-label="github-source-link" href={font.github_link} target="_blank" className="w-[180px] tlg:w-[140px] tmd:w-[128px] h-[40px] tlg:h-[36px] tmd:h-[32px] flex flex-row justify-center items-center text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-9 dark:text-theme-9 font-medium dark:border-2 tmd:dark:border border-theme-4 dark:border-theme-9 rounded-full px-[20px] cursor-pointer bg-theme-4 hover:bg-theme-4/90 tlg:hover:bg-theme-4 dark:bg-transparent hover:dark:bg-theme-9/10 tlg:hover:dark:bg-transparent">폰트 다운로드</Link>
                    }
                </div>
                {
                    font.license_embed === "N" || font.license_ofl[0] === "N"
                    ? <></>
                    : <>
                        <div className="flex flex-col justify-start items-start mb-[60px] tlg:mb-[48px] tmd:mb-[40px]">
                            <h2 className="text-[24px] tlg:text-[20px] tmd:text-[18px] text-theme-3 dark:text-theme-9 font-medium mb-[20px] tlg:mb-[16px] tmd:mb-[14px]">웹 폰트 사용하기</h2>
                            <div className="cdn w-[1000px] tlg:w-[100%] h-[60px] tlg:h-[48px] tmd:h-[40px] overflow-hidden border-x border-t border-b border-theme-4 dark:border-theme-3/80 rounded-t-[8px] flex flex-row justify-start items-center">
                                <input onChange={handleWebFont} type="radio" id="cdn_css" name="cdn" value="CSS" className="hidden" defaultChecked/>
                                <label htmlFor="cdn_css" className="w-[25%] h-[100%] border-r border-theme-8 dark:border-theme-3/80 flex flex-row justify-center items-center text-[16px] tlg:text-[14px] tmd:text-[10px] text-theme-3 focused:text-theme-9 dark:text-theme-9 leading-none cursor-pointer">CSS 설정하기</label>
                                <input onChange={handleWebFont} type="radio" id="cdn_link" name="cdn" value="link" className="hidden"/>
                                <label htmlFor="cdn_link" className="w-[25%] h-[100%] border-r border-theme-8 dark:border-theme-3/80 flex flex-row justify-center items-center text-[16px] tlg:text-[14px] tmd:text-[10px] text-theme-3 dark:text-theme-9 leading-none cursor-pointer">link 방식</label>
                                <input onChange={handleWebFont} type="radio" id="cdn_import" name="cdn" value="import" className="hidden"/>
                                <label htmlFor="cdn_import" className="w-[25%] h-[100%] border-r border-theme-8 dark:border-theme-3/80 flex flex-row justify-center items-center text-[16px] tlg:text-[14px] tmd:text-[10px] text-theme-3 dark:text-theme-9 leading-none cursor-pointer">import 방식</label>
                                <input onChange={handleWebFont} type="radio" id="cdn_font_face" name="cdn" value="font-face" className="hidden"/>
                                <label htmlFor="cdn_font_face" className="w-[25%] h-[100%] flex flex-row justify-center items-center text-[16px] tlg:text-[14px] tmd:text-[10px] text-theme-3 dark:text-theme-9 leading-none cursor-pointer">font-face 방식</label>
                            </div>
                            <div className="w-[1000px] tlg:w-[100%] border-x border-b rounded-b-[8px] border-theme-4 dark:border-theme-blue-2 bg-theme-4 dark:bg-theme-blue-2">
                                {
                                    webFont === "CSS"
                                    ? <div className="w-[100%] relative pl-[32px] tlg:pl-[24px] tmd:pl-[16px] pr-[66px] tlg:pr-[60px] overflow-hidden">
                                        <div className="cdn_pre w-[100%] h-[72px] tlg:h-[60px] tmd:h-[48px] flex flex-row justify-start items-center overflow-x-auto"><pre style={{fontFamily:"Noto Sans KR"}} className="text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-9">{font.cdn_css}</pre></div>
                                        <div className="absolute z-10 right-[20px] tlg:right-[16px] tmd:right-[12px] top-[50%] translate-y-[-50%] cursor-pointer">
                                            <svg onClick={copyOnClick} className="copy_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                                            <svg className="copy_chk_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                                        </div>
                                    </div>
                                    : ( webFont === "link"
                                        ? <div className="w-[100%] relative pl-[32px] tlg:pl-[24px] tmd:pl-[16px] pr-[66px] tlg:pr-[60px] overflow-hidden">
                                            <div className="cdn_pre w-[100%] h-[72px] tlg:h-[60px] tmd:h-[48px] flex flex-row justify-start items-center overflow-x-auto"><pre style={{fontFamily:"Noto Sans KR"}} className="text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-9">{font.cdn_link}</pre></div>
                                            <div className="absolute z-10 right-[20px] tlg:right-[16px] tmd:right-[12px] top-[50%] translate-y-[-50%] cursor-pointer">
                                                <svg onClick={copyOnClick} className="copy_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                                                <svg className="copy_chk_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                                            </div>
                                        </div>
                                        : ( webFont === "import"
                                            ? <div className="w-[100%] relative pl-[32px] tlg:pl-[24px] tmd:pl-[16px] pr-[66px] tlg:pr-[60px] overflow-hidden">
                                                <div className="cdn_pre w-[100%] h-[72px] tlg:h-[60px] tmd:h-[48px] flex flex-row justify-start items-center overflow-x-auto"><pre style={{fontFamily:"Noto Sans KR"}} className="text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-9">{font.cdn_import}</pre></div>
                                                <div className="absolute z-10 right-[20px] tlg:right-[16px] tmd:right-[12px] top-[50%] translate-y-[-50%] cursor-pointer">
                                                    <svg onClick={copyOnClick} className="copy_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                                                    <svg className="copy_chk_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                                                </div>
                                            </div>
                                            : <div className="w-[100%] relative pl-[32px] tlg:pl-[24px] tmd:pl-[16px] pr-[66px] tlg:pr-[60px] overflow-hidden">
                                                <div className="cdn_pre w-[100%] h-[auto] py-[24px] tlg:py-[20px] tmd:py-[15px] flex flex-row justify-start items-center overflow-auto whitespace-nowrap"><div id="cdn-font-face" style={{fontFamily:"Noto Sans KR"}} className="font-face text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-9">{font.cdn_font_face}</div></div>
                                                <div className="absolute z-10 right-[20px] tlg:right-[16px] tmd:right-[12px] top-[36px] tlg:top-[30px] tmd:top-[24px] translate-y-[-50%] cursor-pointer">
                                                    <svg onClick={copyOnClick} className="copy_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/></svg>
                                                    <svg className="copy_chk_btn w-[32px] tmd:w-[28px] p-[8px] fill-theme-9 dark:fill-theme-7 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>
                                                </div>
                                            </div>
                                        )
                                    )
                                }
                            </div>
                        </div>
                    </>
                }
                <div className="max-w-[100%] w-content flex flex-col justify-start items-start mb-[60px] tlg:mb-[48px] tmd:mb-[40px]">
                    <h2 className="text-[24px] tlg:text-[20px] tmd:text-[18px] text-theme-3 dark:text-theme-9 font-medium mb-[20px] tlg:mb-[16px] tmd:mb-[14px]">폰트 미리보기</h2>
                    <div className="w-[100%] px-[16px] py-[8px] mb-[20px] tlg:mb-[16px] border-b border-theme-7 dark:border-theme-4">
                        <textarea onChange={handleFontWeightChange} onInput={handleHeightChange} placeholder="원하는 문구를 적어보세요..." className="w-[100%] h-[18px] resize-none text-[14px] text-theme-5 dark:text-theme-8 placeholder-theme-5 dark:placeholder-theme-6 leading-tight bg-transparent"/>
                    </div>
                    <div className="font-preview-wrap max-w-[100%] overflow-hidden rounded-[12px] p-[32px] pb-[16px] tlg:p-[20px] tlg:pt-[28px] tlg:pb-[14px] bg-theme-4 dark:bg-theme-blue-2">
                        <div className="w-[100%] flex flex-row flex-wrap justify-start items-center">
                            <div className="flex flex-col justify-center items-start mr-[60px] tlg:mr-[40px] mb-[20px] tlg:mb-[16px]">
                                <p className="text-[16px] tlg:text-[14px] text-normal leading-none mb-[12px] tlg:mb-[2px] text-theme-9">
                                    폰트 크기<span className="text-[13px] tlg:text-[11px] text-theme-7 ml-[8px]">Font Size</span>
                                </p>
                                <div className="w-[280px] tlg:w-[200px] mx-[34px] relative">
                                    <Slider
                                        className="font-size-slider"
                                        aria-label="font-size-slider"
                                        aria-valuetext="px"
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={fnAddUnit}
                                        onChange={(e, v) => setFontSize(Number(v))}
                                        defaultValue={20}
                                        min={12}
                                        max={64}
                                    />
                                    <div className="absolute left-[-34px] top-[50%] translate-y-[-70%] text-[12px] text-theme-9">12px</div>
                                    <div className="absolute right-[-34px] top-[50%] translate-y-[-70%] text-[12px] text-theme-9">64px</div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-start mr-[60px] tlg:mr-[40px] mb-[20px] tlg:mb-[16px]">
                                <p className="text-[16px] tlg:text-[14px] text-normal leading-none mb-[12px] tlg:mb-[2px] text-theme-9">
                                    행간<span className="text-[13px] tlg:text-[11px] text-theme-7 ml-[8px]">Line Height</span>
                                </p>
                                <div className="w-[280px] tlg:w-[200px] mx-[20px] relative">
                                    <Slider
                                        className="font-size-slider"
                                        aria-label="font-size-slider"
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={fnLineheightValue}
                                        onChange={(e, v) => setLineHeight(Number(v)/10)}
                                        defaultValue={12}
                                        min={10}
                                        max={20}
                                    />
                                    <div className="absolute left-[-18px] top-[50%] translate-y-[-70%] text-[12px] text-theme-9">1</div>
                                    <div className="absolute right-[-18px] top-[50%] translate-y-[-70%] text-[12px] text-theme-9">2</div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-start mr-[60px] tlg:mr-[40px] mb-[20px] tlg:mb-[16px]">
                                <p className="text-[16px] tlg:text-[14px] text-normal leading-none mb-[12px] tlg:mb-[2px] text-theme-9">
                                    자간<span className="text-[13px] tlg:text-[11px] text-theme-7 ml-[8px]">Letter Spacing</span>
                                </p>
                                <div className="w-[280px] tlg:w-[200px] ml-[48px] relative">
                                    <Slider
                                        className="font-size-slider"
                                        aria-label="font-size-slider"
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={fnLetterSpacingValue}
                                        onChange={(e, v) => setLetterSpacing(Number(v)/10)}
                                        defaultValue={0}
                                        min={-5}
                                        max={10}
                                    />
                                    <div className="absolute left-[-48px] top-[50%] translate-y-[-70%] text-[12px] text-theme-9">-0.5em</div>
                                    <div className="absolute right-[-32px] top-[50%] translate-y-[-70%] text-[12px] text-theme-9">1em</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-[100%] h-px mb-[36px] tlg:mb-[28px] bg-theme-5"></div>
                        {
                            font.font_weight[0] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">Thin 100</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"100"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[1] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">ExtraLight 200</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"200"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[2] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">Light 300</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"300"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[3] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">Regular 400</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"400"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[4] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">Medium 500</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"500"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[5] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">SemiBold 600</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"600"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[6] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">Bold 700</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"700"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[7] === "Y"
                            ? <>
                                <div className="text-[14px] tlg:text-[11px] text-theme-7 leading-none mb-[12px]">Heavy 800</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"800"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                        {
                            font.font_weight[8] === "Y"
                            ? <>
                                <div className="text-[14px] tmd:text-[12px] text-theme-7 leading-none mb-[12px]">Black 900</div>
                                <pre style={{fontFamily:font.font_family, fontSize:fontSize, lineHeight:lineHeight, letterSpacing:letterSpacing+"em", fontWeight:"900"}} className="font-preview w-[100%] text-theme-9 pb-[16px] tlg:pb-[14px] mb-[20px] tlg:mb-[16px]"><DummyText lang={font.lang} text={text} num={randomNum}/></pre>
                            </>
                            : <></>
                        }
                    </div>
                </div>
                <div className="flex flex-col justify-start items-start">
                    <h2 className="text-[24px] tlg:text-[20px] tmd:text-[18px] text-theme-3 dark:text-theme-9 font-medium mb-[20px] tlg:mb-[16px] tmd:mb-[14px]">라이센스 사용 범위</h2>
                    <table className="w-[100%] mb-[20px] tlg:mb-[16px]">
                        <thead className="h-[60px] tlg:h-[48px] bg-theme-8 dark:bg-theme-3 border-x border-theme-8 dark:border-theme-3">
                            <tr className="text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-3 dark:text-theme-8 font-medium">
                                <th className="w-[240px] tlg:w-[120px] tmd:w-[88px] border-r border-theme-7 dark:border-theme-4">카테고리</th>
                                <th>사용 범위</th>
                                <th className="w-[240px] tlg:w-[120px] tmd:w-[88px] border-l border-theme-7 dark:border-theme-4">허용 여부</th>
                            </tr>
                        </thead>
                        <tbody className="text-[16px] tlg:text-[14px] tmd:text-[12px] leading-tight text-theme-3 dark:text-theme-8 text-center font-normal border-x border-b border-theme-7 dark:border-theme-4">
                            <tr className="tlg:relative">
                                <td className="border-r border-theme-7 dark:border-theme-4">인쇄</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-theme-7 dark:border-theme-4">브로슈어, 포스터, 책, 잡지 및 출판용 인쇄물 등</td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center">
                                    {
                                        font.license_print[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_print[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_print[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_print[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">웹사이트</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">웹페이지, 광고 배너, 메일, E-브로슈어 등</td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_web[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_web[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_web[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_web[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">영상</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">영상물 자막, 영화 오프닝/엔딩 크레딧, UCC 등</td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_video[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_video[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_video[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_video[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">포장지</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">판매용 상품의 패키지</td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_package[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_package[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_package[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_package[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">임베딩</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">웹사이트 및 프로그램 서버 내 폰트 탑재, E-book 제작</td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_embed[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_embed[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_embed[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_embed[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">BI/CI</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">회사명, 브랜드명, 상품명, 로고, 마크, 슬로건, 캐치프레이즈</td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_bici[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_bici[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_bici[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_bici[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">OFL</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_ofl[0] === "Y"
                                        ? <span>폰트 파일의 수정/ 복제/ 배포 가능. 단, 폰트 파일의 유료 판매는 금지</span>
                                        : <span>폰트 파일의 수정/ 복제/ 배포/ 유료 판매 금지</span>
                                    }
                                </td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_ofl[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_ofl[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_ofl[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_ofl[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">용도</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_purpose[0] === "Y"
                                        ? <span>개인적, 상업적 용도 모두 사용 가능</span>
                                        : <span>개인적 용도 사용 가능, 상업적 용도 사용 금지</span>
                                    }
                                </td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_purpose[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_purpose[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_purpose[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_purpose[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                            <tr className="tlg:relative">
                                <td className="border-r border-t border-theme-7 dark:border-theme-4">출처</td>
                                <td className="h-[60px] tlg:h-[auto] tlg:p-[16px] tmd:p-[12px] border-r border-t border-theme-7 dark:border-theme-4">출처 표시</td>
                                <td className="h-[60px] tlg:h-[100%] tlg:w-[120px] tmd:w-[88px] tlg:absolute flex flex-row justify-center items-center border-t border-theme-7 dark:border-theme-4">
                                    {
                                        font.license_source[0] === "Y"
                                        ? <svg className="w-[16px] tlg:w-[14px] tmd:w-[12px] fill-theme-3 dark:fill-theme-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>
                                        : ( font.license_source[0] === "N"
                                            ? <div style={{color:"#FF0000"}}>금지</div>
                                            : ( font.license_source[0] === "R"
                                                ? <>권장</>
                                                : ( font.license_source[0] === "Q"
                                                    ? <div style={{color:"#FF0000"}}>문의</div>
                                                    : <></>
                                                )
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="w-[100%] border border-theme-7 dark:border-theme-4 px-[28px] tlg:px-[24px] tmd:px-[20px] py-[32px] tlg:py-[28px] tmd:py-[24px]">
                        <h2 className="text-[24px] tlg:text-[20px] tmd:text-[16px] text-theme-3 dark:text-theme-8 font-medium leading-none">라이센스 본문</h2>
                        <div className="w-[100%] h-px bg-theme-7 dark:bg-theme-4 my-[20px] tmd:my-[16px]"></div>
                        <div style={{fontFamily:"Noto Sans KR"}} id="license" className="whitespace-pre-wrap text-[16px] tlg:text-[14px] tmd:text-[12px] text-theme-3 dark:text-theme-8 leading-loose"></div>
                    </div>
                </div>
            </div>
            
            {/* 폰트 검색 */}
            <FontSearch display={searchDisplay} closeBtn={handleFontSearchCloseBtn} showBtn={handleFontSearch}/>
        </>
    )
}

export async function getStaticPaths() {
    try {
        const fonts = await FetchFont();

        const paths = fonts.map((font: any) => ({
            params: { fontId: font.code.toString() },
        }));

        return { paths, fallback: false }
    } catch (error) {
        console.log(error);
    }
}

export async function getStaticProps(ctx: any) {
    try {
        const fonts = await FetchFontInfo(ctx.params.fontId);
        const comps = await FetchFontComp(fonts[0].source, ctx.params.fontId);
        const randomNum: number = Math.floor(Math.random() * 19);

        return {
            props: {
                fonts: fonts,
                comps: comps,
                randomNum: randomNum,
                initFontSize: 20,
                initLineHeight: 1.2,
                initLetterSpacing: 0
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export default DetailPage;