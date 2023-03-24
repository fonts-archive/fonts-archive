const dummyText = [
    '흔히들 말한다. 상대가 원하는 걸 해주는게 사랑이라고. 하지만 그건 작은 사랑인지도 모른다. 상대가 싫어하는 걸 하지 않는 것이야말로 큰 사랑이 아닐까',
  
    '너무 치열하게 살지 마라. 인생은 우리에게 주어진 선물이지, 맹목적으로 전진만 하다가 그렇게 죽어가라고 주어진 것이 아니다.',
  
    '우선은 맛있는 것을 먹기로 했다.  그래야 바닥에 내팽개쳐진 내 존엄을 다시 챙길 수 있을 테니까.  맛있는 것을 먹고 나면 기분이 좋아질 테니, 기분이 좋아진 상태에서 하고 싶은 작은 일을 하면 된다.',
  
    '바쁜 일상속에 간혹 비치는 오아시스 앞에 앉은 듯한 고요한 순간이 찾아와도 우리는 그것이 우리 삶의 다음 단계로의 이행을 예비해주는 귀중한 순간이라는 걸 알지못한다.',
  
    '내일을 위한 목적함수를 설계하고, 그에 맞는 수단매체를 우회축적해야 한다. 우회 축적은 단기적으로 희생이 따르지만 장기적으로는  그 희생을 보상하고도 남을 수 있는 현명한 길이다.',
  
    '세상에서 가장 설득하기 힘든 것은 나 자신이다. 세상에 지지 말자. 안될 거라고 말하는 세상에 쉽게 설득 당하지 말자.',
  
    '삶이라는 모든 영화에는 "나"라는 주인공이 있고, 그 영화 속 모든 선택은 언제나 주인공이 하는 거다.',
  
    '우리는 정말로 책임이 있는 권력자에게 소리를 내지를 수가 없기에 우리가 비난을 해도 가장 너그럽게 보아주리라 확신하는 사람에게 화를 낸다.',
  
    '우리가 사랑하는 사람에게 퍼붓는 비난들은 딱히 이치에 닿지 않는다. 세상 다른 어떤 사람에게도 그런 부당한 말들을 발설하지 않는다.',
  
    '하지만 우리의 난폭한 비난은 친밀함과 신뢰의 독특한 증거이자 사랑 그 자체의 한 증상이고, 제 나름대로 헌신을 표현하는 비꾸러진 징표다.',
  
    '천재는 노력하는 사람을 이기지 못하고, 노력하는 사람은 즐기는 사람을 이기지 못한다. 그러나 즐기는 사람도 돈 받고 일하는 사람에게는 이길 수 없다.',
  
    '나는 신념에 가득 찬 자들을 신뢰하지 않습니다. 나는 오히려 의심에 가득 찬 자들을 신뢰합니다.',
  
    '인류를 사랑한 사람의 할 일은 사람들로 하여금 진리를 비웃게 하고, 진리로 하여금 웃도록 만드는 데 있는 거야. 유일한 진리는 진리에 대한 광적인 정열에서 우리가 해방하는 길을 배우는데 있기 때문이지.',
  
    '왜 사람들은 이동할까? 무엇 때문에 뿌리를 내리고 모르는 게 없던 곳을 떠나 수평선 너머 미지의 세계로 향할까? 어디서나 답은 하나겠지. 사람들은 더 나은 삶을 소망하며 이주한다.',
  
    '말하자면 호밀밭의 파수꾼이 되고 싶다고나 할까. 바보 같은 이야기라는 건 알고 있어. 하지만 정말 내가 되고 싶은 건 그거야. 바보 같겠지만 말이야.',
  
    '내가 가지지 못한 것에 대해 생각할 시간은 없다. 내가 가진 것을 활용하여 무엇을 할 수 있는지를 생각해야 한다.',
  
    '삶이 열려 있음을 아는 것, 다음 산을 넘으면, 다음 골목으로 접어들면, 아직 알지 못하는 지평이 놓여 있으리라는 기대는 우리를 행복하게 한다.',
  
    '누구에게든 아무 말도 하지 말아라. 말을 하게 되면 모든 사람들이 그리워지기 시작하니까.',
  
    '그러므로 우리는 물결을 거스르는 배처럼, 쉴 새 없이 과거 속으로 밀려나면서도 끝내 앞으로 나아가는 것이다.',
  
    '다른 사람에게는 결코 열어주지 않는 문을 당신에게만 열어주는 사람이 있다면 그 사람이야 말로 당신의 진정한 친구이다.'
]
const randomNum = Math.floor(Math.random() * dummyText.length - 1);

const dummyTextEn = [
    'You will face many defeats in life, but never let yourself be defeated.',

    'The greatest glory in living lies not in never falling, but in rising every time we fall.',

    'In the end, it’s not the years in your life that count. It’s the life in your years.',

    'Many of life’s failures are people who did not realize how close they were to success when they gave up.',

    'If you spend too much time thinking about a thing, you’ll never get it done.',

    'The two most important days in your life are the day you are born and the day you find out why.',

    'There is always some madness in love. But there is also always some reason in madness.',

    'Love, free as air at sight of human ties, Spreads his light wings, and in a moment flies.',

    'To love and win is the best thing. To love and lose, is the next best thing.',

    'We come to love not by finding a perfect person, but by learning to see an imperfect person perfectly.',

    'Love doesn’t make the world go round. Love is what makes the ride worthwhile.',

    'The best and most beautiful things in the world cannot be seen or even touched. They must be felt with the heart.',

    'There is no use whatever trying to help people who do not help themselves. You cannot push anyone up a ladder unless he be willing to climb himself.',

    'Always bear in mind that your own resolution to succeed is more important than any other.',

    'We must believe in luck. For how else can we explain the success of those we don’t like?',

    'Successful people do what unsuccessful people are not willing to do. Don’t wish it were easier; wish you were better.',

    'I owe my success to having listened respectfully to the very best advice, and then going away and doing the exact opposite.',

    'If you cannot fly then run. If you cannot run, then walk. And, if you cannot walk, then crawl, but whatever you do, you have to keep moving forward.',

    'Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.',

    'Money is like gasoline during a road trip. You do not want to run out of gas on your trip, but you ‘re not doing a tour of gas stations.'
]
const randomNumEn = Math.floor(Math.random() * dummyTextEn.length - 1);

function DummyText(props) {
    return (
        <>
            {
                props.lang === "KR"
                ? dummyText[randomNum]
                : (
                    props.lang === "EN"
                    ? dummyTextEn[randomNumEn]
                    : <></>
                )
            }
        </>
    )
}

export default DummyText;