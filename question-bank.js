// Bundled local question bank: 300 Python prompts and 300 beginner Japanese translations.
(() => {
  const make = (prompt, answer, aliases = []) => ({ prompt, answers: [String(answer).toLowerCase(), ...aliases] });
  const python = { easy: [], medium: [], hard: [] };
  for (let a = 1; a <= 8; a++) for (let b = 1; b <= 5; b++) python.easy.push(make('In Python, what is ' + a + ' + ' + b + '?', a + b));
  for (let a = 6; a <= 11; a++) for (let b = 1; b <= 5; b++) python.easy.push(make('In Python, what is ' + a + ' - ' + b + '?', a - b));
  for (let a = 1; a <= 6; a++) for (let b = 2; b <= 6; b++) python.easy.push(make('In Python, what is ' + a + ' * ' + b + '?', a * b));
  for (let start = 0; start < 20; start++) for (let index = 0; index < 5; index++) { const list = [start, start+2, start+4, start+6, start+8]; python.medium.push(make('Given nums = [' + list.join(', ') + '], what is nums[' + index + ']?', list[index])); }
  for (let a = 10; a < 60; a++) { const divisor = 2 + (a % 7); python.hard.push(make('What is the remainder of ' + a + ' % ' + divisor + '?', a % divisor)); }
  for (let a = 30; a < 80; a++) { const divisor = 2 + (a % 7); python.hard.push(make('What is ' + a + ' // ' + divisor + ' using Python floor division?', Math.floor(a / divisor))); }
  const japaneseWords = {
    easy: [
      ['こんにちは','hello',['hi','good afternoon']],['おはよう','good morning',['morning']],['こんばんは','good evening'],['おやすみ','good night',['goodnight']],['ありがとう','thank you',['thanks']],['ごめん','sorry'],['すみません','excuse me',['sorry']],['はい','yes'],['いいえ','no'],['これ','this'],['ここ','here'],['なまえ','name'],['へや','room'],['にほんご','Japanese language',['Japanese']],['えいご','English language',['English']],['みず','water'],['おちゃ','tea'],['ほん','book'],['ねこ','cat'],['いぬ','dog'],['ともだち','friend'],['せんせい','teacher'],['がっこう','school'],['かさ','umbrella'],['くつ','shoes',['shoe']],['かばん','bag'],['くるま','car'],['やま','mountain'],['かわ','river'],['そら','sky'],['いち','one'],['に','two'],['さん','three'],['よん','four'],['ご','five'],['ろく','six'],['なな','seven'],['はち','eight'],['きゅう','nine'],['じゅう','ten'],
      ['おかあさん','mother',['mom']],['おとうさん','father',['dad']],['おにいさん','older brother'],['おねえさん','older sister'],['おとうと','younger brother'],['いもうと','younger sister'],['おじいさん','grandfather',['grandpa']],['おばあさん','grandmother',['grandma']],['かぞく','family'],['こども','child',['children']],
      ['あか','red'],['あお','blue'],['しろ','white'],['くろ','black'],['きいろ','yellow'],['みどり','green'],['ピンク','pink'],['むらさき','purple'],['はいいろ','gray',['grey']],['ちゃいろ','brown'],
      ['うま','horse'],['うし','cow'],['ぶた','pig'],['うさぎ','rabbit'],['さる','monkey'],['ぞう','elephant'],['ねずみ','mouse'],['とら','tiger'],['へび','snake'],['かめ','turtle'],
      ['バナナ','banana'],['いちご','strawberry'],['ぶどう','grapes',['grape']],['なし','pear'],['すいか','watermelon'],['もも','peach'],['レモン','lemon'],['メロン','melon'],['キウイ','kiwi'],['オレンジ','orange'],
      ['かぎ','key'],['さいふ','wallet'],['ぼうし','hat',['cap']],['シャツ','shirt'],['ペン','pen'],['かみ','paper'],['ふでばこ','pencil case'],['けいたい','mobile phone',['cell phone']],['とびら','door'],['めがね','glasses'],
      ['あたま','head'],['め','eye'],['みみ','ear'],['はな','nose'],['くち','mouth'],['て','hand'],['あし','foot',['leg']],['からだ','body'],['ゆび','finger'],['かお','face']
    ],
    medium: [
      ['はる','spring'],['なつ','summer'],['あき','autumn',['fall']],['ふゆ','winter'],['きょう','today'],['あした','tomorrow'],['きのう','yesterday'],['あさ','morning'],['ひる','daytime',['noon']],['よる','night',['evening']],['りんご','apple'],['みかん','mandarin orange',['mandarin']],['たまご','egg'],['ごはん','rice',['meal']],['パン','bread'],['さかな','fish'],['とり','bird',['chicken']],['やさい','vegetable',['vegetables']],['にく','meat'],['ぎゅうにゅう','milk'],['えき','train station',['station']],['こうえん','park'],['びょういん','hospital'],['とけい','clock',['watch']],['でんしゃ','train'],['じてんしゃ','bicycle',['bike']],['いす','chair'],['つくえ','desk'],['まど','window'],['みせ','shop',['store']],['しごと','work',['job']],['かいしゃ','company'],['でんわ','telephone',['phone']],['じかん','time'],['つき','moon'],['ほし','star'],['おかね','money'],['ひと','person',['people']],['こども','child',['children']],['くうこう','airport'],
      ['うみ','sea'],['しま','island'],['もり','forest'],['いけ','pond'],['いし','stone'],['かぜ','wind'],['くも','cloud'],['たいよう','sun'],['つち','soil',['earth']],['ゆき','snow'],
      ['としょかん','library'],['ゆうびんきょく','post office'],['ぎんこう','bank'],['こうばん','police box'],['ちかてつ','subway'],['ちず','map'],['きっぷ','ticket'],['ひこうき','airplane',['plane']],['ホテル','hotel'],['レストラン','restaurant'],
      ['さとう','sugar'],['しお','salt'],['しょうゆ','soy sauce'],['みそ','miso'],['おにぎり','rice ball'],['うどん','udon noodles',['udon']],['そば','soba noodles',['soba']],['ラーメン','ramen'],['カレー','curry'],['コーヒー','coffee'],
      ['はし','chopsticks'],['さら','plate'],['コップ','cup',['glass']],['ふく','clothes'],['ズボン','pants',['trousers']],['スカート','skirt'],['くつした','socks'],['てぶくろ','gloves'],['ネクタイ','tie'],['ゆびわ','ring'],
      ['げつようび','Monday'],['かようび','Tuesday'],['すいようび','Wednesday'],['もくようび','Thursday'],['きんようび','Friday'],['どようび','Saturday'],['にちようび','Sunday'],['まいにち','every day'],['まいしゅう','every week'],['まいつき','every month'],
      ['まいとし','every year'],['しゅくだい','homework'],['じしょ','dictionary'],['べんきょう','study',['studying']],['りょこう','travel',['trip']],['しゃしん','photograph',['photo']],['しんぶん','newspaper'],['えいが','movie',['film']],['おんがく','music'],['てんき','weather']
    ],
    hard: [
      ['たべる','eat'],['のむ','drink'],['みる','see',['watch']],['きく','listen',['ask']],['はなす','speak',['talk']],['よむ','read'],['かく','write',['draw']],['あるく','walk'],['はしる','run'],['およぐ','swim'],['ねる','sleep'],['おきる','wake up',['get up']],['いく','go'],['くる','come'],['かえる','return',['go home']],['あう','meet'],['つかう','use'],['つくる','make',['create']],['まつ','wait'],['かう','buy'],['うる','sell'],['あける','open'],['しめる','close'],['ある','exist',['there is']],['いる','exist',['there are']],['おおきい','big',['large']],['ちいさい','small',['little']],['あたらしい','new'],['ふるい','old'],['おいしい','delicious',['tasty']],
      ['はたらく','work'],['やすむ','rest',['take a break']],['べんきょうする','study'],['りょうりする','cook'],['そうじする','clean'],['せんたくする','do laundry',['wash clothes']],['うたう','sing'],['おどる','dance'],['おしえる','teach'],['ならう','learn',['take lessons']],
      ['つける','turn on',['switch on']],['けす','turn off',['erase']],['もつ','hold',['carry']],['おく','put',['place']],['とる','take'],['おくる','send'],['もらう','receive',['get']],['あげる','give'],['はいる','enter',['go in']],['でる','leave',['go out']],
      ['のる','ride',['get on']],['おりる','get off'],['なくす','lose'],['みつける','find'],['えらぶ','choose'],['かりる','borrow',['rent']],['かす','lend'],['あそぶ','play'],['すわる','sit'],['たつ','stand'],
      ['ふる','fall',['rain']],['やむ','stop'],['はじまる','begin',['start']],['おわる','finish',['end']],['なる','become'],['おもう','think'],['しる','know'],['わかる','understand'],['いう','say',['tell']],['いそぐ','hurry'],
      ['きれい','beautiful',['pretty','clean']],['しずか','quiet'],['にぎやか','lively',['busy']],['げんき','energetic',['healthy']],['しんせつ','kind'],['すずしい','cool'],['あたたかい','warm'],['あまい','sweet'],['にがい','bitter'],['すっぱい','sour'],
      ['かっこいい','cool',['good-looking']],['ひろい','wide',['spacious']],['せまい','narrow',['small']],['ながい','long'],['みじかい','short'],['おもしろい','interesting',['funny']],['つまらない','boring'],['いそがしい','busy'],['ひま','free',['not busy']],['たかい','expensive',['tall','high']]
    ]
  };
  const toQuestions = words => words.map(([word, meaning, aliases]) => make('Translate ' + word + ' into English.', meaning, aliases || []));
  window.portfolioQuestionBank = { python, japanese: { easy: toQuestions(japaneseWords.easy), medium: toQuestions(japaneseWords.medium), hard: toQuestions(japaneseWords.hard) } };
})();
